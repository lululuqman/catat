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
<p>[Sender Name]<br>[Sender Address]<br>[Sender Phone/Email]</p>

<hr>

<p>[Recipient Name]<br>[Recipient Title]<br>[Recipient Organization]<br>[Recipient Address]<span style="float: right;">DD MONTH YYYY</span></p>

<p>Dear Sir/Madam,</p>

<p>Subject: [Subject Line]</p>

<p>[Opening paragraph with formal introduction]</p>

<p>[Body paragraph 1 - main points]</p>

<p>[Body paragraph 2 - additional details]</p>

<p>[Closing paragraph with call to action or thanks]</p>

<p>Yours faithfully,<br>[Sender Name]</p>

MALAY FORMAT:
<p>[Nama Pengirim]<br>[Alamat Pengirim]<br>[Telefon/Email]</p>

<hr>

<p>[Nama Penerima]<br>[Jawatan Penerima]<br>[Organisasi]<br>[Alamat Penerima]<span style="float: right;">DD BULAN YYYY</span></p>

<p>Tuan/Puan,</p>

<p>Perkara: [Tajuk Surat]</p>

<p>Dengan segala hormatnya, [opening paragraph]</p>

<p>[Isi kandungan perenggan 1]</p>

<p>[Isi kandungan perenggan 2]</p>

<p>Sekian, terima kasih.</p>

<p>Yang benar,<br>[Nama Pengirim]</p>

CRITICAL FORMATTING RULES:
1. **Sender info**: Left-aligned at top, separate lines with <br>
2. **Horizontal line**: <hr> placed between sender's last line and recipient's first line
3. **Recipient + Date**: COMBINED in ONE paragraph
   - Recipient info (name, title, organization, address) LEFT-ALIGNED with <br> between lines
   - Date on SAME LINE as recipient's last line (address) using <span style="float: right;">
   - Date format: "DD MONTH YYYY" in CAPITAL LETTERS (e.g., "6 DECEMBER 2025")
   - Example: <p>[Recipient]<br>[Address]<span style="float: right;">6 DECEMBER 2025</span></p>
4. **Subject**: Plain text with "Subject:" or "Perkara:" prefix (no bold formatting)
5. **Body**: Each paragraph in separate <p> tag, natural spacing
6. **Closing**: Left-aligned, sender name with <br> for signature space

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
2. Sender info at top (left-aligned), each line separated by <br>
3. Horizontal line <hr> after sender
4. Recipient AND date in ONE paragraph:
   - Recipient info LEFT-ALIGNED (name, title, organization, address) with <br> between lines
   - Date on SAME LINE as last recipient line using: <span style="float: right;">[Date]</span>
   - Date in CAPITAL LETTERS: "DD MONTH YYYY" (e.g., "6 DECEMBER 2025")
   - Example: <p>[Name]<br>[Title]<br>[Org]<br>[Address]<span style="float: right;">6 DECEMBER 2025</span></p>
5. Use plain "Subject: [text]" or "Perkara: [text]" without bold formatting
6. Each body paragraph in separate <p> tags
7. Natural, professional tone throughout

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
        Ensure Malaysian letter layout: sender -> <hr> -> (recipient left + date right on same line) -> rest.
        Combines recipient and date into one paragraph with date as floated span.
        """
        try:
            blocks = re.findall(r"<p[^>]*>.*?</p>", html, flags=re.IGNORECASE | re.DOTALL)
            if not blocks:
                return html

            def is_date(block: str) -> bool:
                date_re = re.compile(r"\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Dis|Januari|Februari|Mac|April|Mei|Jun|Julai|Ogos|September|Oktober|November|Disember)", re.IGNORECASE)
                return "[date]" in block.lower() or bool(date_re.search(block))

            def is_salutation(block: str) -> bool:
                return re.search(r"dear\s|tuan|puan|sir/madam", block, re.IGNORECASE) is not None

            def is_subject(block: str) -> bool:
                return re.search(r"(\*\*subject|\*\*perkara|<strong>\s*(re:|rujukan:|subject:|perkara:))", block, re.IGNORECASE) is not None

            def is_recipient(block: str) -> bool:
                # Recipient block usually appears after sender and before salutation
                # It's not a date, salutation, or subject
                return not is_date(block) and not is_salutation(block) and not is_subject(block)

            # Find key blocks
            sender_block = blocks[0]
            date_idx = next((i for i, b in enumerate(blocks) if is_date(b)), -1)
            date_block = blocks[date_idx] if date_idx != -1 else None

            # Find recipient block (typically second block after sender, before salutation)
            recipient_idx = -1
            for i, b in enumerate(blocks[1:], start=1):
                if is_recipient(b) and i != date_idx:
                    recipient_idx = i
                    break
            recipient_block = blocks[recipient_idx] if recipient_idx != -1 else None

            # Extract content from recipient and date blocks
            def extract_content(block: str) -> str:
                """Extract inner HTML content from <p> tag"""
                match = re.search(r"<p[^>]*>(.*?)</p>", block, re.IGNORECASE | re.DOTALL)
                return match.group(1).strip() if match else ""

            # Combine recipient and date into one paragraph with date as floated span
            combined_recipient_date = None
            if recipient_block or date_block:
                recipient_content = extract_content(recipient_block) if recipient_block else ""
                date_content = extract_content(date_block) if date_block else ""

                # Remove any existing float spans or alignment classes from date content
                date_content = re.sub(r'<span[^>]*style="float:\s*right;"[^>]*>(.*?)</span>', r'\1', date_content, flags=re.IGNORECASE)
                date_content = date_content.strip()

                # Combine: recipient info left-aligned, date as floated span on same line as last recipient line
                if recipient_content and date_content:
                    combined_content = f'{recipient_content}<span style="float: right;">{date_content}</span>'
                elif recipient_content:
                    combined_content = recipient_content
                elif date_content:
                    combined_content = f'<span style="float: right;">{date_content}</span>'
                else:
                    combined_content = None

                if combined_content:
                    combined_recipient_date = f'<p>{combined_content}</p>'

            # Rebuild ordered blocks
            new_blocks = []
            new_blocks.append(sender_block)
            new_blocks.append("<hr>")
            if combined_recipient_date:
                new_blocks.append(combined_recipient_date)

            # Append remaining blocks in original order, skipping already used ones
            used_indices = {0, recipient_idx, date_idx}
            for i, b in enumerate(blocks):
                if i not in used_indices:
                    new_blocks.append(b)

            return "\n\n".join(new_blocks)
        except Exception as exc:
            logger.warning(f"Layout normalization skipped: {exc}")
            return html

claude_service = ClaudeService()