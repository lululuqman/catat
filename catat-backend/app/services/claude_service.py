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

Generate letters using MARKDOWN-STYLE FORMATTING following Malaysian formal letter schema.
Use minimal HTML tags ONLY for structure and alignment.

MALAYSIAN FORMAL LETTER STRUCTURE:

ENGLISH FORMAT:
<p>[Sender Name]</p>
<p>[Sender Address]</p>
<p>[Sender Phone/Email]</p>

<hr>

<p>[Recipient Name]</p>
<p>[Recipient Title]</p>
<p>[Recipient Organization]</p>
<p>[Recipient Address]</p>
<p>DD MONTH YYYY</p>

<p>Dear Sir/Madam,</p>

<p>Subject: [Subject Line]</p>

<p>[Opening paragraph with formal introduction]</p>

<p>[Body paragraph 1 - main points]</p>

<p>[Body paragraph 2 - additional details]</p>

<p>[Closing paragraph with call to action or thanks]</p>

<p>Yours faithfully,</p>
<p>[Sender Name]</p>

MALAY FORMAT:
<p>[Nama Pengirim]</p>
<p>[Alamat Pengirim]</p>
<p>[Telefon/Email]</p>

<hr>

<p>[Nama Penerima]</p>
<p>[Jawatan Penerima]</p>
<p>[Organisasi]</p>
<p>[Alamat Penerima]</p>
<p>DD BULAN YYYY</p>

<p>Tuan/Puan,</p>

<p>Perkara: [Tajuk Surat]</p>

<p>Dengan segala hormatnya, [opening paragraph]</p>

<p>[Isi kandungan perenggan 1]</p>

<p>[Isi kandungan perenggan 2]</p>

<p>Sekian, terima kasih.</p>

<p>Yang benar,</p>
<p>[Nama Pengirim]</p>

CRITICAL FORMATTING RULES:
1. **Sender info**: Each line in separate <p> tag (name, address, contact)
2. **Horizontal line**: <hr> placed after sender section
3. **Recipient info**: Each line in separate <p> tag (name, title, organization, address)
4. **Date**: Separate <p> tag after recipient address, format "DD MONTH YYYY" in CAPITAL LETTERS (e.g., "6 DECEMBER 2025")
5. **Subject**: Plain text with "Subject:" or "Perkara:" prefix in separate <p> tag (no bold formatting)
6. **Body**: Each paragraph in separate <p> tag
7. **Closing**: Closing phrase in one <p> tag, sender name in another <p> tag

DATE FORMAT EXAMPLES:
- English: "6 DECEMBER 2025" (CAPITAL LETTERS, full month name, no leading zero)
- Malay: "6 DISEMBER 2025" (HURUF BESAR, bulan penuh, tanpa sifar di hadapan)

TONE CONVERSION:
- Casual → Formal and professional
- "Boss I MC lah" → "I am writing to formally inform you that I require medical leave"

Use [SENDER_NAME], [DATE] if info missing.

Output ONLY the formatted HTML letter, no additional text or explanations."""

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

CRITICAL FORMATTING REQUIREMENTS:
1. Follow Malaysian formal letter schema exactly as shown in system prompt
2. Sender info: each line in separate <p> tag (name, address, contact)
3. Horizontal line <hr> after sender section
4. Recipient info: each line in separate <p> tag (name, title, organization, address)
5. Date: separate <p> tag after recipient address, in CAPITAL LETTERS "DD MONTH YYYY" (e.g., "6 DECEMBER 2025")
6. Subject: plain text "Subject: [text]" or "Perkara: [text]" in separate <p> tag (no bold formatting)
7. Body: each paragraph in separate <p> tag
8. Closing: closing phrase in one <p> tag, sender name in another <p> tag
9. Natural, professional tone throughout

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
        Ensure Malaysian letter layout has proper structure with <hr> separator.
        Letters should already have correct format from Claude, this just validates structure.
        """
        try:
            # Check if <hr> exists
            if '<hr>' not in html.lower():
                # Try to add <hr> after first paragraph (sender section)
                blocks = re.findall(r"<p[^>]*>.*?</p>", html, flags=re.IGNORECASE | re.DOTALL)
                if len(blocks) >= 2:
                    # Insert <hr> after first paragraph
                    html = html.replace(blocks[0], blocks[0] + '\n\n<hr>\n\n', 1)

            return html
        except Exception as exc:
            logger.warning(f"Layout normalization skipped: {exc}")
            return html

claude_service = ClaudeService()