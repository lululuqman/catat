import anthropic
from app.config import settings
from app.models.letter import StructuredData, Language, LetterType
from fastapi import HTTPException
import logging
import json

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-20250514"
    
    def _build_system_prompt(self) -> str:
        return """You are an expert Malaysian letter writer.

ENGLISH FORMAT:
[Sender Name]
[Address]
[Contact]

[Date: DD Month YYYY]

[Recipient Name]
[Title]
[Organization]
[Address]

Dear Sir/Madam,

Re: [Subject]

[Opening paragraph]
[Body paragraphs]
[Closing paragraph]

Yours faithfully,
[Sender Name]

MALAY FORMAT:
[Nama]
[Alamat]
[Telefon]

[Tarikh: DD Bulan YYYY]

[Penerima]
[Jawatan]
[Organisasi]
[Alamat]

Tuan/Puan,

Rujukan: [Subjek]

Dengan segala hormatnya, [content]

Sekian, terima kasih.
Yang benar,
[Nama]

TONE CONVERSION:
"Boss I MC lah" → "I am writing to inform you of my medical leave"

Use [SENDER_NAME], [DATE] if info missing."""

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

Generate complete letter now."""

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

claude_service = ClaudeService()