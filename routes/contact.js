const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/contact — Public (submit message)
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'name, email, message required.' });
  }
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }
  try {
    await db.execute(
      'INSERT INTO contact_messages (name, email, message) VALUES (?,?,?)',
      [name, email, message]
    );
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/contact/messages — Admin only
router.get('/messages', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/contact/messages/:id/read — Admin only
router.patch('/messages/:id/read', auth, async (req, res) => {
  try {
    await db.execute('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/contact/messages/:id — Admin only
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/contact/stats — Admin only (dashboard counts)
router.get('/stats', auth, async (req, res) => {
  try {
    const [[{ total_projects }]] = await db.execute('SELECT COUNT(*) as total_projects FROM projects');
    const [[{ total_skills }]] = await db.execute('SELECT COUNT(*) as total_skills FROM skills');
    const [[{ total_experience }]] = await db.execute('SELECT COUNT(*) as total_experience FROM experience');
    const [[{ total_posts }]] = await db.execute('SELECT COUNT(*) as total_posts FROM blog_posts');
    const [[{ total_messages }]] = await db.execute('SELECT COUNT(*) as total_messages FROM contact_messages');
    const [[{ unread_messages }]] = await db.execute('SELECT COUNT(*) as unread_messages FROM contact_messages WHERE is_read = FALSE');
    res.json({
      success: true,
      data: { total_projects, total_skills, total_experience, total_posts, total_messages, unread_messages }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
