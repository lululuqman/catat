import anthropic
from app.config import settings
from app.models.letter import StructuredData, Language, LetterType
from fastapi import HTTPException
import logging
import json
import re

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-20250514"
    
    def _build_system_prompt(self) -> str:
        return """You are an expert Malaysian letter writer.

Generate letters in HTML format with proper paragraph tags for each section.
Match this layout so the PDF renderer preserves formatting:

ENGLISH FORMAT STRUCTURE (sender → separator → recipient → date → body):
<p>[Sender Name]<br>[Address]<br>[Contact]</p>
<hr>
<p>[Recipient Name]<br>[Title]<br>[Organization]<br>[Address]</p>
<p class="ql-align-right">[Date: DD Month YYYY]</p>
<p>Dear Sir/Madam,</p>
<p><strong>Re: [Subject]</strong></p>
<p>[Opening paragraph]</p>
<p>[Body paragraph 1]</p>
<p>[Body paragraph 2]</p>
<p>[Closing paragraph]</p>
<p>Yours faithfully,<br>[Sender Name]</p>

MALAY FORMAT STRUCTURE (pengirim → pemisah → penerima → tarikh → isi):
<p>[Nama]<br>[Alamat]<br>[Telefon]</p>
<hr>
<p>[Penerima]<br>[Jawatan]<br>[Organisasi]<br>[Alamat]</p>
<p class="ql-align-right">[Tarikh: DD Bulan YYYY]</p>
<p>Tuan/Puan,</p>
<p><strong>Rujukan: [Subjek]</strong></p>
<p>Dengan segala hormatnya, [content]</p>
<p>[Body paragraphs]</p>
<p>Sekian, terima kasih.</p>
<p>Yang benar,<br>[Nama]</p>

FORMATTING RULES:
1. Use <p> tags for each section/paragraph
2. Use <br> for line breaks within same section (e.g., address lines)
3. Use <strong> for subject line
4. Add blank <p></p> between major sections if needed for spacing
5. Each body paragraph should be in its own <p> tag
6. Keep paragraphs focused - don't create overly long blocks
7. Keep the date paragraph right-aligned (e.g., class="ql-align-right")

TONE CONVERSION:
"Boss I MC lah" → "I am writing to inform you of my medical leave"

Use [SENDER_NAME], [DATE] if info missing.

Output ONLY the formatted HTML letter, no additional text."""

    async def generate_letter(
        self,
        structured_data: StructuredData,
        language: Language,
        letter_type: LetterType
    ) -> str:
        """Generate professional letter"""
        
        data_json = json.dumps(structured_data.dict(), indent=2)
        
        user_prompt = f"""Generate a professional {letter_type} letter in {self._get_language_name(language)}.

Structured Data:
{data_json}

Key Points:
{self._format_key_points(structured_data.key_points)}

IMPORTANT: 
- Format the letter with proper HTML paragraph tags (<p>...</p>)
- Use <br> for line breaks within sections (like addresses)
- Use <strong> for the subject line
- Each body paragraph should be separate <p> tags
- Make the content flow naturally with proper paragraph breaks

Generate the complete formatted letter now."""

        try:
            logger.info(f"🧠 Generating letter with Claude")
            
            message = self.client.messages.create(
                model=self.model,
                max_tokens=3000,
                temperature=0.3,
                system=self._build_system_prompt(),
                messages=[{"role": "user", "content": user_prompt}]
            )
            
            letter = message.content[0].text
            letter = self._normalize_layout(letter)
            logger.info(f"✅ Letter generated: {len(letter)} characters")
            return letter
            
        except Exception as e:
            logger.error(f"❌ Generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Letter generation failed: {str(e)}")
    
    def _get_language_name(self, language: Language) -> str:
        mapping = {
            Language.ENGLISH: "English",
            Language.MALAY: "Bahasa Malaysia",
            Language.MIXED: "English"
        }
        return mapping.get(language, "English")
    
    def _format_key_points(self, points: list) -> str:
        return "\n".join(f"- {point}" for point in points)

    def _normalize_layout(self, html: str) -> str:
        """
        Ensure layout order: sender -> <hr> -> recipient -> date -> rest.
        Right-align date paragraph if missing alignment class.
        """
        try:
            # Extract paragraph blocks
            blocks = re.findall(r"<p[^>]*>.*?</p>", html, flags=re.IGNORECASE | re.DOTALL)
            if not blocks:
                return html

            def is_date(block: str) -> bool:
                date_re = re.compile(r"\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)", re.IGNORECASE)
                return "[date]" in block.lower() or bool(date_re.search(block))

            def is_salutation(block: str) -> bool:
                return re.search(r"dear\s|tuan/p uan|sir/madam", block, re.IGNORECASE) is not None

            def is_subject(block: str) -> bool:
                return re.search(r"<strong>\s*(re:|rujukan:|subject:|perkara:)", block, re.IGNORECASE) is not None

            sender_idx = 0
            date_idx = next((i for i, b in enumerate(blocks) if is_date(b)), -1)
            recipient_idx = next(
                (
                    i
                    for i, b in enumerate(blocks[1:], start=1)
                    if i != date_idx and not is_salutation(b) and not is_subject(b)
                ),
                -1,
            )

            # Move date after recipient if it appears before
            if date_idx != -1 and recipient_idx != -1 and date_idx < recipient_idx:
                date_block = blocks.pop(date_idx)
                insert_at = recipient_idx  # after recipient once pop shifts left
                blocks.insert(insert_at + 1, date_block)

            # Inject <hr> after sender if missing
            if "<hr" not in html.lower():
                blocks.insert(sender_idx + 1, "<hr>")

            # Ensure date paragraph is right-aligned
            for i, b in enumerate(blocks):
                if is_date(b):
                    if 'class="' not in b:
                        b = b.replace("<p", '<p class="ql-align-right"', 1)
                    elif "ql-align-right" not in b:
                        b = b.replace('class="', 'class="ql-align-right ', 1)
                    blocks[i] = b
                    break

            return "\n\n".join(blocks)
        except Exception as exc:
            logger.warning(f"Layout normalization skipped: {exc}")
            return html

claude_service = ClaudeService()