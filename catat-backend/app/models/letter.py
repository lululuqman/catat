from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class LetterType(str, Enum):
    COMPLAINT = "complaint"
    PROPOSAL = "proposal"
    MC = "mc"
    GENERAL = "general"
    OFFICIAL = "official"

class Language(str, Enum):
    ENGLISH = "en"
    MALAY = "ms"
    MIXED = "mixed"

class ToneDetected(str, Enum):
    CASUAL = "casual"
    MANGLISH = "manglish"
    FORMAL = "formal"

class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ContactInfo(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    title: Optional[str] = None
    organization: Optional[str] = None

class StructuredData(BaseModel):
    letter_type: LetterType
    sender: ContactInfo
    recipient: ContactInfo
    subject: str
    key_points: List[str]
    tone_detected: ToneDetected
    language_preference: Language
    dates_mentioned: List[str] = []
    urgency_level: UrgencyLevel

class LetterMetadata(BaseModel):
    language: Language
    letter_type: LetterType
    tone_detected: Optional[ToneDetected] = None
    urgency: Optional[UrgencyLevel] = None

class GenerateLetterResponse(BaseModel):
    success: bool
    transcript: str
    structured_data: StructuredData
    letter: str
    metadata: LetterMetadata