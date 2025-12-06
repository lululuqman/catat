import json
from groq import Groq
from app.config import settings
from app.models.letter import StructuredData, ContactInfo
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "mixtral-8x7b-32768"
    
    def _build_system_prompt(self) -> str:
        return """You are a Malaysian document analyzer. Extract structured data from speech transcripts.

Output ONLY valid JSON:
{
  "letter_type": "complaint|proposal|mc|general",
  "sender": {"name": "", "address": "", "contact": ""},
  "recipient": {"name": "", "title": "", "organization": "", "address": ""},
  "subject": "",
  "key_points": ["point1", "point2"],
  "tone_detected": "casual|manglish|formal",
  "language_preference": "en|ms",
  "dates_mentioned": [],
  "urgency_level": "low|medium|high"
}

MALAYSIAN CONTEXT:
- Agencies: DBKL, MBPJ, JPJ, LHDN
- Titles: YB, Datuk, Tuan, Puan

MANGLISH: Look for "lah", "ah", "can or not"

If info missing, leave empty string."""

    async def structure_letter(self, transcript: str, letter_type: str) -> StructuredData:
        """Extract structured data from transcript"""
        
        user_prompt = f"""Letter Type: {letter_type}

Transcript: {transcript}

Extract structured data in JSON format."""

        try:
            logger.info(f"⚙️ Structuring with Groq Mixtral")
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._build_system_prompt()},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=2000
            )
            
            response_text = completion.choices[0].message.content
            
            # Clean JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            response_text = response_text.strip()
            
            try:
                data = json.loads(response_text)
                structured = StructuredData(**data)
                logger.info("✅ Structuring successful")
                return structured
                
            except json.JSONDecodeError:
                logger.warning("⚠️ JSON parsing failed, using fallback")
                return StructuredData(
                    letter_type=letter_type,
                    sender=ContactInfo(),
                    recipient=ContactInfo(),
                    subject="Letter content",
                    key_points=[transcript[:200]],
                    tone_detected="casual",
                    language_preference="en",
                    dates_mentioned=[],
                    urgency_level="low"
                )
                
        except Exception as e:
            logger.error(f"❌ Structuring failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Structuring failed: {str(e)}")

groq_service = GroqService()