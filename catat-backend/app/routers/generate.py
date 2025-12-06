from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from app.services.whisper_service import whisper_service
from app.services.groq_service import groq_service
from app.services.claude_service import claude_service
from app.models.letter import GenerateLetterResponse, Language, LetterType, LetterMetadata
from app.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["generate"])

@router.post("/generate-letter", response_model=GenerateLetterResponse)
async def generate_letter(
    audio: UploadFile = File(...),
    language: Language = Form(...),
    letter_type: LetterType = Form(...)
):
    """
    Complete pipeline: Audio → Groq Whisper → Groq Mixtral → Claude → Letter
    """
    
    audio_bytes = await audio.read()
    file_size_mb = len(audio_bytes) / (1024 * 1024)
    
    if file_size_mb > settings.MAX_AUDIO_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"File too large. Max: {settings.MAX_AUDIO_SIZE_MB}MB")
    
    if audio.content_type not in settings.ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {audio.content_type}")
    
    try:
        logger.info(f"🚀 Starting generation: {letter_type}, {language}, {file_size_mb:.2f}MB")
        
        # Step 1: Transcribe
        logger.info("Step 1: Groq Whisper transcription...")
        transcript = await whisper_service.transcribe_audio(
            audio_bytes=audio_bytes,
            language=language.value,
            filename=audio.filename or "recording.webm"
        )
        
        # Step 2: Structure
        logger.info("Step 2: Groq Mixtral structuring...")
        structured_data = await groq_service.structure_letter(transcript, letter_type.value)
        
        # Step 3: Generate
        logger.info("Step 3: Claude generation...")
        final_letter = await claude_service.generate_letter(structured_data, language, letter_type)
        
        metadata = LetterMetadata(
            language=language,
            letter_type=letter_type,
            tone_detected=structured_data.tone_detected,
            urgency=structured_data.urgency_level
        )
        
        response = GenerateLetterResponse(
            success=True,
            transcript=transcript,
            structured_data=structured_data,
            letter=final_letter,
            metadata=metadata
        )
        
        logger.info("✅ Generation completed successfully!")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Generation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))