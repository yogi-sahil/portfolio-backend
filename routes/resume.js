const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Multer config — only accept PDF files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// GET /api/resume — Public: get resume URL/file info
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('resume_url', 'resume_filename')"
    );
    const settings = rows.reduce((acc, r) => { acc[r.setting_key] = r.setting_value; return acc; }, {});

    // Build the download URL
    let downloadUrl = null;
    if (settings.resume_filename) {
      downloadUrl = `/api/resume/download`;
    } else if (settings.resume_url) {
      downloadUrl = settings.resume_url;
    }

    res.json({
      success: true,
      data: {
        has_resume: !!downloadUrl,
        download_url: downloadUrl,
        type: settings.resume_filename ? 'file' : settings.resume_url ? 'url' : null,
        filename: settings.resume_filename,
        external_url: settings.resume_url,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/resume/download — Public: stream the PDF file
router.get('/download', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT setting_value FROM settings WHERE setting_key = 'resume_filename'"
    );
    const filename = rows[0]?.setting_value;
    if (!filename) return res.status(404).json({ success: false, message: 'No resume file uploaded.' });

    const filePath = path.join(__dirname, '../uploads', filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Resume file not found on server.' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Sahil_Resume.pdf"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/resume/upload — Admin: upload a PDF resume
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  try {
    // Delete old resume file if exists
    const [oldRows] = await db.execute("SELECT setting_value FROM settings WHERE setting_key = 'resume_filename'");
    const oldFilename = oldRows[0]?.setting_value;
    if (oldFilename) {
      const oldPath = path.join(__dirname, '../uploads', oldFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.execute(
      "UPDATE settings SET setting_value = ? WHERE setting_key = 'resume_filename'",
      [req.file.filename]
    );
    // Clear external URL since we now have a file
    await db.execute("UPDATE settings SET setting_value = NULL WHERE setting_key = 'resume_url'");

    res.json({ success: true, message: 'Resume uploaded successfully.', filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/resume/url — Admin: set external resume URL (Google Drive, etc.)
router.put('/url', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'URL is required.' });
  try {
    await db.execute("UPDATE settings SET setting_value = ? WHERE setting_key = 'resume_url'", [url]);
    // Clear uploaded file if setting URL
    await db.execute("UPDATE settings SET setting_value = NULL WHERE setting_key = 'resume_filename'");

    res.json({ success: true, message: 'Resume URL updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/resume — Admin: remove resume
router.delete('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT setting_value FROM settings WHERE setting_key = 'resume_filename'");
    const filename = rows[0]?.setting_value;
    if (filename) {
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.execute("UPDATE settings SET setting_value = NULL WHERE setting_key IN ('resume_filename', 'resume_url')");
    res.json({ success: true, message: 'Resume removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
