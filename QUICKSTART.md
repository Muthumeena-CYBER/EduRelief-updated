# 🚀 Quick Start Guide - Document Upload Feature

## ✅ What's Been Implemented

### Frontend
✔️ **DocumentUpload Component** added to Student Dashboard
  - Document type dropdown (Student ID / Admission Letter / Fee Receipt)
  - File input with validation (PDF, JPG, PNG only, max 5MB)
  - Upload button with loading states
  - Success/error status messages

### Backend
✔️ **Express.js Server** (`backend/server.js`)
  - POST endpoint: `/api/documents/upload`
  - Multer middleware for file handling
  - Local file storage in `backend/uploads/`
  - File validation and security

### Database
✔️ **Supabase Migration** created
  - `verification_documents` table with proper schema
  - Row Level Security policies
  - Indexes for performance

## 📋 Setup Steps (In Order)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Apply Database Migration
```bash
# Option A: Using Supabase CLI (recommended)
supabase db push

# Option B: Manually in Supabase Dashboard
# 1. Go to SQL Editor
# 2. Open: supabase/migrations/20251228_verification_documents.sql
# 3. Execute the SQL
```

### Step 3: Start the Application
```bash
# Run both frontend and backend together
npm run dev:all
```

**OR run separately in two terminals:**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run server
```

### Step 4: Test the Feature

1. Open browser: `http://localhost:5173`
2. Login as a **student** user
3. Navigate to **Dashboard**
4. Find **"Verification Documents"** card on the right side
5. Select a document type
6. Upload a file (PDF/JPG/PNG, max 5MB)
7. Click "Upload Document"
8. Verify success message appears

## 🔍 Verify Everything is Working

1. **Frontend Running**: `http://localhost:5173` should load
2. **Backend Running**: Visit `http://localhost:3001/health` (should show `{"status":"ok"}`)
3. **Upload Test**: Try uploading a document and check:
   - Success message appears
   - File appears in `backend/uploads/` folder

## 📁 Files Created/Modified

```
New Files:
├── backend/
│   ├── server.js                                    # Express server
│   ├── README.md                                    # Backend docs
│   └── uploads/.gitkeep                             # Upload directory
├── src/components/documents/
│   ├── DocumentUpload.tsx                           # Upload component
│   └── index.ts                                     # Export file
├── supabase/migrations/
│   └── 20251228_verification_documents.sql          # Database migration
├── DOCUMENT_UPLOAD_SETUP.md                         # Full documentation
└── QUICKSTART.md                                    # This file

Modified Files:
├── package.json                                     # Added dependencies
├── .gitignore                                       # Ignore uploads
└── src/pages/Dashboard.tsx                          # Integrated component
```

## 🎯 Key Features

### Security
- ✅ File type validation (PDF, JPG, PNG only)
- ✅ File size limit (5MB max)
- ✅ User authentication required
- ✅ Row-level security in database
- ✅ Unique filename generation

### User Experience
- ✅ Clear document type selection
- ✅ File preview before upload
- ✅ Upload progress indication
- ✅ Success/error feedback
- ✅ Responsive design

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Make sure port 3001 is free
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process if needed and restart
npm run server
```

### "Network error" when uploading?
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify `http://localhost:3001/health` returns OK

### File not uploading?
- Check file is under 5MB
- Ensure file is PDF, JPG, or PNG
- Make sure you're logged in
- Select document type first

### Database migration failed?
- Check Supabase connection
- Verify campaigns table exists
- Run migration manually in SQL Editor

## 📚 Additional Resources

- **Full Documentation**: See `DOCUMENT_UPLOAD_SETUP.md`
- **Backend README**: See `backend/README.md`
- **API Endpoints**: Documented in `DOCUMENT_UPLOAD_SETUP.md`

## 🎉 Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Database migration applied
- [ ] Frontend running on port 5173
- [ ] Backend running on port 3001
- [ ] Can access Dashboard as student
- [ ] Can see "Verification Documents" section
- [ ] Can select document type
- [ ] Can upload a file successfully
- [ ] File appears in `backend/uploads/` folder

## 💡 Next Steps

Once everything is working, you can:
1. Test with different file types and sizes
2. Upload multiple documents
3. Verify files are stored in `backend/uploads/`
4. Check database records in Supabase
5. Consider implementing additional features (see DOCUMENT_UPLOAD_SETUP.md)

---

**Need Help?** Check the full documentation in `DOCUMENT_UPLOAD_SETUP.md`
