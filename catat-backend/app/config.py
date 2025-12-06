from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import json

class Settings(BaseSettings):
    # App Info
    APP_NAME: str = "Catat API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API Keys
    GROQ_API_KEY: str
    ANTHROPIC_API_KEY: str
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str
    
    # CORS
    CORS_ORIGINS_STR: str = '["http://localhost:5173"]'
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS_STR)
        except:
            return ["http://localhost:5173"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10
    
    # File Upload
    MAX_AUDIO_SIZE_MB: int = 25
    ALLOWED_AUDIO_TYPES: list = ["audio/webm", "audio/wav", "audio/mp3", "audio/mpeg", "audio/flac", "audio/m4a"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()