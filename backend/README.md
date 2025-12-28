# Backend Server

This is the Express.js backend server for handling document uploads.

## Files
- `server.js` - Main Express server with multer configuration
- `uploads/` - Directory where uploaded documents are stored (auto-created)

## Running the Server

```bash
# From project root
npm run server

# Or directly
node backend/server.js
```

## Endpoints

- `POST /api/documents/upload` - Upload a document
- `GET /api/documents/:userId` - Get user's documents
- `GET /health` - Health check
- `GET /uploads/:filename` - Serve uploaded files

## Configuration

- **Port**: 3001 (configurable via PORT environment variable)
- **Max File Size**: 5MB
- **Allowed Types**: PDF, JPG, PNG
- **Storage**: Local filesystem in `uploads/` directory

## Environment Variables

```bash
PORT=3001  # Server port (default: 3001)
```
