const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/verify — verify token is still valid
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, valid: false });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, valid: true, admin: decoded });
  } catch {
    res.status(401).json({ success: false, valid: false });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;
  
  if (!username) return res.status(400).json({ success: false, message: 'Username is required.' });

  try {
    const [rows] = await db.execute('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (rows.length === 0) {
      // Return success even if user not found to prevent user enumeration
      return res.json({ success: true, message: 'If the username exists, a reset link was generated.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.execute(
      'UPDATE admin_users SET reset_token = ?, reset_expires = ? WHERE username = ?',
      [resetToken, resetExpires, username]
    );

    // Provide the reset link in the backend console (since there's no email service)
    const resetLink = `http://localhost:5173/admin/reset-password?token=${resetToken}`;
    console.log('\n=============================================');
    console.log('🔔 PASSWORD RESET REQUESTED');
    console.log(`User: ${username}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('=============================================\n');

    res.json({ success: true, message: 'Reset link generated. Check the backend console.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id FROM admin_users WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    
    await db.execute(
      'UPDATE admin_users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hash, rows[0].id]
    );

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both old and new passwords are required.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute('SELECT password_hash FROM admin_users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const passwordMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, decoded.id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
