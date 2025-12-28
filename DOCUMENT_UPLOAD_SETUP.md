# Document Upload Feature - Setup Guide

## Overview
This feature allows students to upload verification documents (Student ID, Admission Letter, or Fee Receipt) for campaign verification through the Student Dashboard.

## Files Created/Modified

### Backend Files
1. **backend/server.js** - Express server with multer middleware for handling file uploads
   - Endpoint: `POST /api/documents/upload`
   - File storage: Local storage in `backend/uploads/` directory
   - Accepted formats: PDF, JPG, PNG (max 5MB)

### Frontend Files
1. **src/components/documents/DocumentUpload.tsx** - React component for document upload UI
2. **src/components/documents/index.ts** - Export file for documents module
3. **src/pages/Dashboard.tsx** - Modified to include DocumentUpload component

### Database Files
1. **supabase/migrations/20251228_verification_documents.sql** - Database migration for storing document metadata

### Configuration Files
1. **package.json** - Updated with new dependencies and scripts

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install the following new packages:
- `express` - Backend web framework
- `multer` - File upload middleware
- `cors` - Cross-origin resource sharing
- `concurrently` - Run multiple commands simultaneously

### 2. Run Database Migration

Apply the migration to create the `verification_documents` table:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL file in your Supabase dashboard
# Navigate to: SQL Editor > New Query
# Copy and paste the contents of: supabase/migrations/20251228_verification_documents.sql
```

### 3. Start the Application

#### Option 1: Run Frontend and Backend Together
```bash
npm run dev:all
```

#### Option 2: Run Separately (in different terminals)

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

### 4. Verify Setup

1. Frontend should be running at: `http://localhost:5173`
2. Backend should be running at: `http://localhost:3001`
3. Check backend health: `http://localhost:3001/health`

## Usage

### For Students:

1. **Login** as a student
2. Navigate to your **Dashboard**
3. Find the **"Verification Documents"** section on the right sidebar
4. **Select Document Type** from dropdown:
   - Student ID
   - Admission Letter
   - Fee Receipt / Fee Structure
5. **Choose a file** (PDF, JPG, or PNG - max 5MB)
6. Click **"Upload Document"**
7. Wait for success confirmation

### API Endpoints

#### Upload Document
```
POST http://localhost:3001/api/documents/upload
Content-Type: multipart/form-data

Body:
- document: File (required)
- documentType: string (required) - "student_id" | "admission_letter" | "fee_receipt"
- userId: string (required) - User's UUID
- campaignId: string (optional) - Campaign's UUID
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "filename": "document-1234567890-123456789.pdf",
    "originalName": "student_id.pdf",
    "path": "/absolute/path/to/file",
    "size": 102400,
    "mimetype": "application/pdf",
    "documentType": "student_id",
    "userId": "user-uuid",
    "campaignId": "campaign-uuid",
    "uploadedAt": "2025-12-28T12:00:00.000Z"
  }
}
```

#### Get User Documents
```
GET http://localhost:3001/api/documents/:userId
```

#### Health Check
```
GET http://localhost:3001/health
```

## File Structure

```
funding-futures-main/
├── backend/
│   ├── server.js              # Express server
│   └── uploads/               # Uploaded files (auto-created)
├── src/
│   ├── components/
│   │   └── documents/
│   │       ├── DocumentUpload.tsx
│   │       └── index.ts
│   └── pages/
│       └── Dashboard.tsx      # Modified
├── supabase/
│   └── migrations/
│       └── 20251228_verification_documents.sql
└── package.json               # Updated
```

## Database Schema

### verification_documents Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| campaign_id | UUID | Foreign key to campaigns (optional) |
| document_type | TEXT | Type: student_id, admission_letter, fee_receipt |
| file_name | TEXT | Stored filename |
| original_name | TEXT | Original filename |
| file_path | TEXT | Full file path |
| file_size | INTEGER | File size in bytes |
| mime_type | TEXT | MIME type of file |
| uploaded_at | TIMESTAMP | Upload timestamp |
| verified | BOOLEAN | Verification status |
| verified_at | TIMESTAMP | Verification timestamp |
| verified_by | UUID | Foreign key to verifier |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Security Features

### Backend Security
- File type validation (PDF, JPG, PNG only)
- File size limit (5MB max)
- Unique filename generation to prevent overwriting
- Error handling for invalid requests

### Database Security
- Row Level Security (RLS) enabled
- Users can only view/modify their own documents
- Proper foreign key constraints
- Automated timestamp updates

### Frontend Validation
- Client-side file type checking
- File size validation before upload
- User authentication required
- Clear error messages

## Troubleshooting

### "Network error" message
- Make sure backend server is running on port 3001
- Check if port 3001 is not being used by another application
- Verify CORS is properly configured

### File not uploading
- Check file size (must be under 5MB)
- Verify file type (PDF, JPG, PNG only)
- Ensure you're logged in
- Check browser console for errors

### Backend not starting
- Verify all dependencies are installed: `npm install`
- Check if port 3001 is available
- Look for error messages in the terminal

### Database migration fails
- Ensure you have proper Supabase connection
- Check if the campaigns table exists
- Verify you have admin privileges

## Next Steps / Future Enhancements

1. **Store documents in Supabase Storage** instead of local storage
2. **Document verification workflow** for administrators
3. **Document preview** in the dashboard
4. **Multiple document uploads** per user
5. **Document expiration** and renewal reminders
6. **Integrate with campaign creation** - require document before publishing
7. **Email notifications** on successful upload

## Support

For issues or questions, please:
1. Check the troubleshooting section
2. Review error messages in browser console and server logs
3. Verify all setup steps were completed
4. Check that all required services are running
