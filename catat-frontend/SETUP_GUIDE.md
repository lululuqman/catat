# Catat - Setup Guide

## Overview
Catat has been transformed into a full-featured **Malaysian Letter Generator** that uses voice-to-text and AI to create professional letters.

## Architecture

### Frontend → Backend Flow
1. **User records voice** → VoiceRecorder component (WebM audio)
2. **Audio sent to backend** → `/api/generate-letter` endpoint
3. **Backend processes**:
   - Groq Whisper: Speech-to-text transcription
   - Groq Mixtral: Structure extraction (sender, recipient, subject, key points)
   - Claude: Professional letter generation
4. **Frontend displays** → Transcript, structured data, generated letter
5. **User edits** → Quill editor with Malaysian formatting
6. **Export** → PDF with proper Malaysian letter format

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in `catat-frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important**: Replace the placeholder values with your actual credentials.

### 2. Start Backend

```bash
cd catat-backend
uvicorn app.main:app --reload
```

The backend should start on `http://localhost:8000`

### 3. Start Frontend

```bash
cd catat-frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

## Application Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Marketing page with features and CTA |
| `/generate` | Letter Generator | Main feature - record voice and generate letter |
| `/letters` | Letters Library | View all saved letters |
| `/letters/:id/edit` | Letter Editor | Edit generated letter with Quill editor |

## Features Implemented

### ✅ Voice Recording
- **Component**: `VoiceRecorder.jsx`
- Records audio in WebM format
- Start/pause/stop controls
- Audio playback preview
- Timer display

### ✅ Letter Generation
- **Page**: `LetterGeneratorPage.jsx`
- Language selection: English, Malay, Mixed (Manglish)
- Letter type: Complaint, Proposal, MC, General, Official
- Real-time API integration with backend
- Display transcript, structured data, and generated letter
- Navigate to editor for refinement

### ✅ Letter Editor
- **Page**: `LetterEditorPage.jsx`
- Rich text editing with React Quill
- Pre-filled with AI-generated content
- Save to database (Supabase integration ready)
- Export to PDF with Malaysian formatting

### ✅ Letters Library
- **Page**: `LettersPage.jsx`
- View all saved letters
- Search by title/content
- Filter by type and language
- Display metadata (urgency, tone, date)
- Edit or delete letters

### ✅ Malaysian Letter Templates
- **File**: `templates/letterTemplates.js`
- Proper Malaysian letter structure
- English format (Dear Sir/Madam, Yours faithfully)
- Malay format (Tuan/Puan, Yang benar)
- Date formatting (DD Month YYYY)
- Sender/recipient information

### ✅ PDF Export
- **Service**: `pdfService.js`
- Malaysian standard margins (25mm)
- Proper formatting for addresses, salutations, subjects
- Footer with metadata
- Support for both English and Malay letters

## API Integration

### Backend Endpoint

**POST** `/api/generate-letter`

**Request** (multipart/form-data):
```
audio: File (WebM audio blob)
language: "en" | "ms" | "mixed"
letter_type: "complaint" | "proposal" | "mc" | "general" | "official"
```

**Response**:
```json
{
  "success": true,
  "transcript": "string",
  "structured_data": {
    "letter_type": "complaint",
    "sender": {
      "name": "string",
      "address": "string",
      "contact": "string"
    },
    "recipient": {
      "name": "string",
      "title": "string",
      "organization": "string",
      "address": "string"
    },
    "subject": "string",
    "key_points": ["string"],
    "tone_detected": "casual" | "manglish" | "formal",
    "language_preference": "en" | "ms",
    "urgency_level": "low" | "medium" | "high"
  },
  "letter": "string (full formatted letter)",
  "metadata": {
    "language": "en" | "ms" | "mixed",
    "letter_type": "complaint",
    "tone_detected": "formal",
    "urgency": "high"
  }
}
```

## Testing the Application

### Test Flow

1. **Open** `http://localhost:5173`
2. **Click** "Get Started" or "Generate Letter"
3. **Select** language (e.g., English) and letter type (e.g., Complaint)
4. **Click** "Start Recording"
5. **Speak** your complaint/proposal (e.g., "I want to complain about the potholes on Jalan Tun Razak. They are very dangerous and need immediate repair.")
6. **Click** "Stop"
7. **Click** "Use This Recording"
8. **Click** "Generate Letter"
9. **Wait** for AI processing (transcript → structure → letter)
10. **Review** the generated letter
11. **Click** "Edit & Save Letter"
12. **Edit** in Quill editor
13. **Click** "Save Letter" or "Export PDF"

### Sample Test Cases

#### Test 1: English Complaint
- **Language**: English
- **Type**: Complaint
- **Message**: "Dear DBKL, I am writing to complain about the road conditions on Jalan Ampang. There are many potholes that pose a danger to motorists."

#### Test 2: Malay Proposal
- **Language**: Bahasa Malaysia
- **Type**: Proposal
- **Message**: "Saya ingin mencadangkan projek pembangunan taman permainan di kawasan perumahan kami untuk keselamatan kanak-kanak."

#### Test 3: Manglish MC Letter
- **Language**: Mixed
- **Type**: MC
- **Message**: "Boss, today I cannot come to work lah. I got fever and cough. Need to see doctor. Can give me MC or not?"

## File Structure

```
catat-frontend/
├── src/
│   ├── components/
│   │   ├── VoiceRecorder.jsx       ← Voice recording component
│   │   └── ui/
│   │       └── Button.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx         ← Updated landing page
│   │   ├── LetterGeneratorPage.jsx ← NEW: Main generation page
│   │   ├── LettersPage.jsx         ← NEW: Letters library
│   │   ├── LetterEditorPage.jsx    ← NEW: Letter editor
│   │   ├── NoteEditorPage.jsx      ← OLD (can be deleted)
│   │   └── NotesPage.jsx           ← OLD (can be deleted)
│   ├── services/
│   │   ├── apiService.js           ← NEW: Backend API calls
│   │   └── pdfService.js           ← ENHANCED: Malaysian formatting
│   ├── templates/
│   │   └── letterTemplates.js      ← NEW: Malaysian letter formats
│   ├── App.jsx                     ← UPDATED: New routes
│   └── index.css                   ← Quill editor styles
├── .env                            ← CREATE THIS (not in git)
├── .env.example                    ← Template (blocked by gitignore)
└── package.json
```

## Next Steps (Optional Enhancements)

### Supabase Integration
- Create `letters` table in Supabase
- Implement save/load functionality
- Add user authentication
- Store letters with metadata

### Additional Features
- Voice playback of generated letter (ElevenLabs TTS)
- Letter templates library
- Batch letter generation
- Email sending
- Multi-page PDF support
- Letter history analytics

## Troubleshooting

### Backend Not Connecting
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend `config.py`
- Verify `VITE_API_BASE_URL` in `.env`

### Microphone Permission Denied
- Allow microphone access in browser settings
- Use HTTPS in production (required for MediaRecorder API)

### PDF Export Issues
- Check console for errors
- Ensure letter content is plain text (strip HTML from Quill)

### Audio Format Not Supported
- WebM should work in modern browsers
- Backend supports: webm, wav, mp3, m4a, flac

## Support

For issues or questions, check:
1. Backend logs: `catat-backend/` terminal
2. Frontend console: Browser DevTools
3. Network tab: Check API calls and responses

---

**Built with**: React, Vite, Tailwind CSS, FastAPI, Groq, Claude, React Quill

