from groq import Groq
from app.config import settings
from fastapi import HTTPException
import logging
import tempfile
import os

logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "whisper-large-v3"
    
    async def transcribe_audio(
        self, 
        audio_bytes: bytes, 
        language: str = "en",
        filename: str = "recording.webm"
    ) -> str:
        """
        Transcribe audio using Groq Whisper
        """
        try:
            logger.info(f"🎙️ Transcribing with Groq Whisper (model: {self.model})")
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=self._get_extension(filename)) as temp_file:
                temp_file.write(audio_bytes)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe
                with open(temp_file_path, "rb") as audio_file:
                    transcription = self.client.audio.transcriptions.create(
                        file=audio_file,
                        model=self.model,
                        language=language if language != "mixed" else "en",
                        response_format="text",
                        temperature=0.0
                    )
                
                transcript = transcription if isinstance(transcription, str) else transcription.text
                
                if not transcript or len(transcript.strip()) < 5:
                    raise HTTPException(
                        status_code=400,
                        detail="Transcription too short. Please record more details."
                    )
                
                logger.info(f"✅ Transcription successful: {len(transcript)} characters")
                return transcript.strip()
                
            finally:
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
                
        except Exception as e:
            logger.error(f"❌ Transcription failed: {str(e)}")
            
            if "rate_limit" in str(e).lower():
                raise HTTPException(status_code=429, detail="Rate limit reached. Please wait.")
            elif "invalid" in str(e).lower() and "api" in str(e).lower():
                raise HTTPException(status_code=401, detail="Invalid Groq API key.")
            else:
                raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    
    def _get_extension(self, filename: str) -> str:
        if '.' in filename:
            return '.' + filename.split('.')[-1]
        return '.webm'

whisper_service = WhisperService()