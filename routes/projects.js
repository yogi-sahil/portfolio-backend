const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/projects — Public
router.get('/', async (req, res) => {
  try {
    const featured = req.query.featured === 'true';
    let query = 'SELECT * FROM projects';
    if (featured) query += ' WHERE featured = TRUE';
    query += ' ORDER BY sort_order ASC, created_at DESC';
    const [rows] = await db.execute(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id — Public
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects — Admin only
router.post('/', auth, async (req, res) => {
  const { title, description, tech_stack, status, github_url, live_url, featured, sort_order } = req.body;
  if (!title || !description || !tech_stack) {
    return res.status(400).json({ success: false, message: 'title, description, tech_stack required.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO projects (title, description, tech_stack, status, github_url, live_url, featured, sort_order) VALUES (?,?,?,?,?,?,?,?)',
      [title, description, JSON.stringify(tech_stack), status || 'WIP', github_url || null, live_url || null, featured || false, sort_order || 0]
    );
    res.status(201).json({ success: true, message: 'Project created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id — Admin only
router.put('/:id', auth, async (req, res) => {
  const { title, description, tech_stack, status, github_url, live_url, featured, sort_order } = req.body;
  try {
    await db.execute(
      'UPDATE projects SET title=?, description=?, tech_stack=?, status=?, github_url=?, live_url=?, featured=?, sort_order=? WHERE id=?',
      [title, description, JSON.stringify(tech_stack), status, github_url, live_url, featured, sort_order, req.params.id]
    );
    res.json({ success: true, message: 'Project updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id — Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
