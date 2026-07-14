const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/experience — Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM experience ORDER BY sort_order ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/experience — Admin only
router.post('/', auth, async (req, res) => {
  const { role, company, duration, type, bullets, sort_order } = req.body;
  if (!role || !company || !duration || !bullets) {
    return res.status(400).json({ success: false, message: 'role, company, duration, bullets required.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO experience (role, company, duration, type, bullets, sort_order) VALUES (?,?,?,?,?,?)',
      [role, company, duration, type || 'FULL_TIME', JSON.stringify(bullets), sort_order || 0]
    );
    res.status(201).json({ success: true, message: 'Experience created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/experience/:id — Admin only
router.put('/:id', auth, async (req, res) => {
  const { role, company, duration, type, bullets, sort_order } = req.body;
  try {
    await db.execute(
      'UPDATE experience SET role=?, company=?, duration=?, type=?, bullets=?, sort_order=? WHERE id=?',
      [role, company, duration, type, JSON.stringify(bullets), sort_order, req.params.id]
    );
    res.json({ success: true, message: 'Experience updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/experience/:id — Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM experience WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Experience deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
