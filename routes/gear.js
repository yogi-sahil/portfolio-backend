const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET all gear (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gear ORDER BY sort_order ASC, id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching gear:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST new gear (protected)
router.post('/', auth, async (req, res) => {
  const { title, category, description, image_url, affiliate_url, sort_order } = req.body;
  
  if (!title || !category || !affiliate_url) {
    return res.status(400).json({ success: false, message: 'Title, category, and affiliate url are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO gear (title, category, description, image_url, affiliate_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, category, description || '', image_url || '', affiliate_url, sort_order || 0]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Gear added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding gear:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT update gear (protected)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, category, description, image_url, affiliate_url, sort_order } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE gear SET title = ?, category = ?, description = ?, image_url = ?, affiliate_url = ?, sort_order = ? WHERE id = ?',
      [title, category, description || '', image_url || '', affiliate_url, sort_order || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gear not found' });
    }

    res.json({ success: true, message: 'Gear updated successfully' });
  } catch (error) {
    console.error('Error updating gear:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// DELETE gear (protected)
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM gear WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gear not found' });
    }

    res.json({ success: true, message: 'Gear deleted successfully' });
  } catch (error) {
    console.error('Error deleting gear:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
