const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/blog — Public (only published)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, title, slug, excerpt, tags, created_at FROM blog_posts WHERE published = TRUE ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/blog/:slug — Public
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM blog_posts WHERE slug = ? AND published = TRUE',
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/blog/admin/all — Admin only (all posts incl. drafts)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/blog — Admin only
router.post('/', auth, async (req, res) => {
  const { title, slug, content, excerpt, tags, published } = req.body;
  if (!title || !slug || !content) {
    return res.status(400).json({ success: false, message: 'title, slug, content required.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO blog_posts (title, slug, content, excerpt, tags, published) VALUES (?,?,?,?,?,?)',
      [title, slug, content, excerpt || null, JSON.stringify(tags || []), published || false]
    );
    res.status(201).json({ success: true, message: 'Post created.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Slug already exists.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/blog/:id — Admin only
router.put('/:id', auth, async (req, res) => {
  const { title, slug, content, excerpt, tags, published } = req.body;
  try {
    await db.execute(
      'UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, tags=?, published=? WHERE id=?',
      [title, slug, content, excerpt, JSON.stringify(tags), published, req.params.id]
    );
    res.json({ success: true, message: 'Post updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/blog/:id — Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
