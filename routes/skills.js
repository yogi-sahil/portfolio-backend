const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/skills — Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM skills ORDER BY sort_order ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/skills — Admin only
router.post('/', auth, async (req, res) => {
  const { name, category, level, sort_order } = req.body;
  if (!name || !category || level === undefined) {
    return res.status(400).json({ success: false, message: 'name, category, level required.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO skills (name, category, level, sort_order) VALUES (?,?,?,?)',
      [name, category, level, sort_order || 0]
    );
    res.status(201).json({ success: true, message: 'Skill created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/skills/:id — Admin only
router.put('/:id', auth, async (req, res) => {
  const { name, category, level, sort_order } = req.body;
  try {
    await db.execute(
      'UPDATE skills SET name=?, category=?, level=?, sort_order=? WHERE id=?',
      [name, category, level, sort_order, req.params.id]
    );
    res.json({ success: true, message: 'Skill updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/skills/:id — Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM skills WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Skill deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
