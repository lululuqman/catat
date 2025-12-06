# Quick Start Checklist

## 🚀 Before You Start

Make sure you have completed all the setup steps!

### ✅ Prerequisites Checklist

- [ ] Node.js installed
- [ ] Python 3.x installed
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] API keys ready:
  - [ ] Groq API key
  - [ ] Anthropic (Claude) API key
  - [ ] Supabase credentials (optional)

### ✅ Environment Setup

1. **Backend `.env` file** (in `catat-backend/`)
   ```bash
   # Create .env file with these variables:
   GROQ_API_KEY=your_groq_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_ANON_KEY=your_anon_key
   DEBUG=True
   ```

2. **Frontend `.env` file** (in `catat-frontend/`)
   ```bash
   # Create .env file with these variables:
   VITE_API_BASE_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### ✅ Start Servers

**Terminal 1 - Backend:**
```bash
cd catat-backend
uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
🚀 Catat API starting...
Environment: Development
```

**Terminal 2 - Frontend:**
```bash
cd catat-frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### ✅ Verify Setup

1. **Backend Health Check**
   - Open: `http://localhost:8000/health`
   - Should see: `{"status":"healthy","version":"1.0.0","service":"Catat API"}`

2. **Backend API Docs**
   - Open: `http://localhost:8000/docs`
   - You should see FastAPI Swagger UI

3. **Frontend**
   - Open: `http://localhost:5173/`
   - You should see the Catat landing page

## 🎯 Test the App (2 Minutes)

### Option 1: Quick Voice Test

1. Go to `http://localhost:5173/generate`
2. Select **Language**: English
3. Select **Letter Type**: Complaint
4. Click **"Start Recording"**
5. Say: *"I want to complain to DBKL about the potholes on Jalan Tun Razak. They are very dangerous and need to be fixed immediately."*
6. Click **"Stop"**
7. Click **"Use This Recording"**
8. Click **"Generate Letter"**
9. Wait 5-10 seconds
10. See your professional letter! ✨

### Option 2: Sample Manglish Test

1. Go to `http://localhost:5173/generate`
2. Select **Language**: Mixed (Manglish)
3. Select **Letter Type**: MC
4. Click **"Start Recording"**
5. Say: *"Boss, today I cannot come work lah. I got fever and headache, very uncomfortable. Need to see doctor and rest. Can give me MC or not?"*
6. Click **"Stop"** → **"Use This Recording"** → **"Generate Letter"**
7. Watch AI transform Manglish into formal letter! 🎉

## 📊 Feature Checklist

After testing, verify these features work:

- [ ] Landing page loads properly
- [ ] Voice recording works
- [ ] Audio playback works
- [ ] Letter generation completes successfully
- [ ] Transcript is accurate
- [ ] Structured data is extracted (sender, recipient, subject)
- [ ] Generated letter looks professional
- [ ] Edit letter page works
- [ ] Quill editor allows text editing
- [ ] PDF export works
- [ ] Letters library page shows letters
- [ ] Search/filter works

## 🐛 Common Issues

### Issue: "Cannot connect to server"
**Solution**: 
- Ensure backend is running
- Check `VITE_API_BASE_URL` is `http://localhost:8000`
- Verify CORS settings in backend

### Issue: "Failed to access microphone"
**Solution**:
- Allow microphone permission in browser
- Try Chrome/Edge (better MediaRecorder support)
- Check browser console for errors

### Issue: "Transcription too short"
**Solution**:
- Speak for at least 5 seconds
- Speak clearly and loudly
- Ensure microphone is working

### Issue: "Invalid API key"
**Solution**:
- Verify Groq API key in backend `.env`
- Verify Anthropic API key in backend `.env`
- Restart backend server after changing `.env`

### Issue: "Rate limit reached"
**Solution**:
- Wait 60 seconds and try again
- Check your Groq API quota
- Use a different API key if needed

## 🎓 Learning Path

1. **Day 1**: Test voice recording and letter generation
2. **Day 2**: Try different letter types (complaint, proposal, MC)
3. **Day 3**: Test with Malay language
4. **Day 4**: Customize letter templates
5. **Day 5**: Integrate Supabase for saving letters

## 📚 Resources

- **Groq API Docs**: https://console.groq.com/docs
- **Claude API Docs**: https://docs.anthropic.com/
- **React Quill**: https://github.com/zenoamaro/react-quill
- **jsPDF**: https://github.com/parallax/jsPDF

## 🚀 Ready to Ship?

Before deploying:

- [ ] Replace all placeholder API keys
- [ ] Set `DEBUG=False` in backend
- [ ] Update CORS origins for production
- [ ] Add authentication (Supabase Auth)
- [ ] Set up production database
- [ ] Configure environment variables on hosting platform
- [ ] Test with real users
- [ ] Monitor API usage/costs

---

**Need Help?** Check `SETUP_GUIDE.md` for detailed documentation.

**Happy Letter Generating!** 🎉

