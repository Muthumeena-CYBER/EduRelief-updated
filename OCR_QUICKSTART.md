# 🔍 OCR Feature - Quick Start

## What's New
✅ Automatic text extraction from uploaded documents
✅ Institution name detection
✅ Smart information parsing (IDs, amounts, dates)
✅ Confidence scoring and visual feedback

## Setup (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Install GraphicsMagick (Required for PDF processing)

**Windows (with Chocolatey):**
```bash
choco install graphicsmagick
```

**Windows (Manual):**
Download from: http://www.graphicsmagick.org/download.html

**Mac:**
```bash
brew install graphicsmagick
```

**Linux:**
```bash
sudo apt-get install graphicsmagick
```

### 3. Start Application
```bash
npm run dev:all
```

## How It Works

1. **Student uploads document** → File saved to `backend/uploads/`
2. **Auto-trigger OCR** → Text extraction begins automatically
3. **Display results** → Shows extracted info in dashboard

## What Gets Extracted

### Student ID Cards:
- Student ID number
- Institution name

### Admission Letters:
- Institution name
- Admission year
- Program (B.Tech, M.Sc, etc.)

### Fee Receipts:
- Institution name
- Amount paid
- Receipt/transaction number

## Testing

1. Login as student
2. Go to Dashboard
3. Upload a document
4. Watch "Extracting Text..." message
5. View results below upload form

## Verify Installation

```bash
# Check GraphicsMagick is installed
gm version

# Should show: GraphicsMagick 1.3.x
```

## API Endpoint

```
POST http://localhost:3001/api/documents/extract-text

Body:
{
  "filePath": "/absolute/path/to/file.pdf",
  "documentType": "student_id"
}
```

## Files Added

```
backend/ocrProcessor.js          # OCR engine
backend/temp/                    # Temp folder (auto-created)
package.json                     # New dependencies
DOCUMENT_OCR_SETUP.md           # Full documentation
```

## Troubleshooting

### "Could not execute GraphicsMagick"
→ Install GraphicsMagick (see Setup step 2)

### OCR taking too long
→ Large PDFs take 5-10 seconds per page (limit: 5 pages)

### Low confidence results
→ Upload clearer/higher resolution scans

## Performance

- **Images:** 3-8 seconds
- **PDFs (with text):** < 1 second  
- **PDFs (scanned):** 5-10 seconds per page

## What's Supported

✅ PDF files
✅ JPG/JPEG images
✅ PNG images
✅ English text
✅ Hindi keywords (university names)
✅ Common document formats

❌ Handwritten text
❌ Low quality scans
❌ Non-Latin scripts (without config)

---

**Full Documentation:** See `DOCUMENT_OCR_SETUP.md`
