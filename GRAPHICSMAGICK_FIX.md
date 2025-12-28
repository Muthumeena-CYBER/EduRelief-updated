# Fix: GraphicsMagick Installation Guide

## The Issue
You're seeing errors like:
```
--- Page 1 ---
[Error extracting text from this page]
```

This happens because **GraphicsMagick** is required to convert PDF pages to images for OCR.

## Quick Fix Options

### Option 1: Install via Chocolatey (Recommended)

**Open PowerShell as Administrator** and run:
```powershell
choco install graphicsmagick -y
```

After installation, restart the servers:
```bash
# Press Ctrl+C in the terminal
# Then run:
npm run dev:all
```

### Option 2: Manual Download

1. Download from: http://www.graphicsmagick.org/download.html
2. Choose: **GraphicsMagick-1.3.x-Q16-win64-dll.exe**
3. Run the installer
4. **Important:** Check "Add to PATH" during installation
5. Restart your terminal
6. Verify: `gm version`

### Option 3: Use Image Files Instead (No Install)

**GraphicsMagick is only needed for PDFs!**

✅ **JPG/PNG files work immediately** without GraphicsMagick
❌ **PDF files** need GraphicsMagick

**Workaround:**
1. Convert your PDF to images first (using any PDF tool)
2. Upload the JPG/PNG images
3. OCR will work perfectly!

## Verify Installation

After installing, check if it works:
```bash
gm version
```

You should see:
```
GraphicsMagick 1.3.x
```

## Test the Feature

1. **For Images (JPG/PNG):**
   - Upload directly - works immediately! ✅

2. **For PDFs:**
   - After installing GraphicsMagick
   - Upload and OCR will extract text from all pages ✅

## Updated Behavior

The code has been improved to:
- ✅ Detect if GraphicsMagick is missing
- ✅ Show helpful error message
- ✅ Still extract any text it can from PDFs
- ✅ Work perfectly with JPG/PNG without GraphicsMagick

## Need Help?

If GraphicsMagick won't install:
1. **Use JPG/PNG images instead** (they work without it)
2. Or convert PDFs online: https://pdf2jpg.net/
3. Then upload the converted images

---

**Servers are already running with the fix!**
Just install GraphicsMagick and you're good to go.
