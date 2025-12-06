# Supabase Setup Guide for Catat

## Quick Setup Steps

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (or use existing)
4. Create a new project:
   - **Name**: Catat
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Southeast Asia)
5. Wait for project to finish setting up (~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, click **"Project Settings"** (gear icon in sidebar)
2. Go to **"API"** section
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Create the Database Table

1. In Supabase dashboard, click **"SQL Editor"** in the sidebar
2. Click **"New query"**
3. Copy the entire contents of `DATABASE_SCHEMA.sql` from this folder
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see: "Letters table created successfully!"

### 4. Configure Your Frontend

Update your `.env` file in `catat-frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

**Important**: Replace `your-project-id` and `your_anon_public_key_here` with the actual values from step 2!

### 5. Test the Integration

1. **Restart your frontend**:
   ```bash
   # Stop the dev server (Ctrl+C)
   cd catat-frontend
   npm run dev
   ```

2. **Test saving a letter**:
   - Go to `http://localhost:5173/generate`
   - Record a voice message
   - Generate a letter
   - Click "Edit & Save Letter"
   - Enter a title
   - Click "Save Letter"
   - You should see "Letter saved successfully!"

3. **View your letters**:
   - Click "My Letters" in the nav
   - You should see your saved letter!

4. **Verify in Supabase**:
   - Go to Supabase dashboard
   - Click "Table Editor"
   - Select "letters" table
   - You should see your letter data!

## Authentication Setup (Optional)

By default, the RLS policies require authentication. For development, you have two options:

### Option A: Disable RLS for Testing (Easier)

In Supabase SQL Editor, run:

```sql
-- WARNING: Only use for development/testing!
ALTER TABLE public.letters DISABLE ROW LEVEL SECURITY;
```

### Option B: Enable Public Access Policies (Better)

In Supabase SQL Editor, uncomment and run the public access policies from `DATABASE_SCHEMA.sql`:

```sql
DROP POLICY IF EXISTS "Users can view own letters" ON public.letters;
DROP POLICY IF EXISTS "Users can insert own letters" ON public.letters;
DROP POLICY IF EXISTS "Users can update own letters" ON public.letters;
DROP POLICY IF EXISTS "Users can delete own letters" ON public.letters;

CREATE POLICY "Enable read access for all users" ON public.letters FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.letters FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.letters FOR DELETE USING (true);
```

### Option C: Implement Full Authentication (Production Ready)

For production, implement Supabase Auth:

1. Enable authentication in Supabase dashboard
2. Add auth UI to your app (login/signup pages)
3. Update the service to include user_id:

```javascript
// In supabaseService.js, when saving:
const { data: { user } } = await supabase.auth.getUser()
// Add user_id: user.id to the insert data
```

## Troubleshooting

### Error: "new row violates row-level security policy"

**Solution**: You haven't set up public access or authentication. Follow Option A or B above.

### Error: "relation 'public.letters' does not exist"

**Solution**: You haven't created the table yet. Run the SQL from `DATABASE_SCHEMA.sql`.

### Error: "Invalid API key"

**Solution**: 
- Check that your VITE_SUPABASE_ANON_KEY is correct
- Make sure you copied the **anon public** key, not the service_role key
- Restart your frontend dev server after updating .env

### Letters not showing up

**Solution**:
1. Check browser console for errors
2. Verify .env file has correct credentials
3. Check Supabase Table Editor to see if data is being saved
4. Make sure RLS policies allow reading (see Authentication Setup above)

## Database Schema Overview

The `letters` table includes:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | UUID | Reference to auth.users (nullable for now) |
| title | TEXT | Letter title |
| content | TEXT | Letter content (HTML from Quill) |
| letter_type | TEXT | complaint, proposal, mc, general, official |
| language | TEXT | en, ms, mixed |
| tone_detected | TEXT | casual, manglish, formal |
| urgency | TEXT | low, medium, high |
| transcript | TEXT | Original voice transcript |
| structured_data | JSONB | Extracted data (sender, recipient, etc.) |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMP | Auto-set on creation |
| updated_at | TIMESTAMP | Auto-updated on changes |

## Next Steps

Once Supabase is working:

1. ✅ Test creating letters
2. ✅ Test editing letters
3. ✅ Test deleting letters
4. ✅ Test PDF export
5. 📱 Add authentication for multi-user support
6. 🚀 Deploy to production

---

**Need help?** Check the Supabase docs: https://supabase.com/docs

