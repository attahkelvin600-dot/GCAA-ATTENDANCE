const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendLoginCodeEmail } = require('../services/emailService');

const hashLoginCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

// Register new personnel
const register = async (req, res) => {
  try {
    const { name, employee_id, email, password, role } = req.body;

    if (!name || !employee_id || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if employee already exists
    const existingUser = await pool.query(
      'SELECT * FROM personnel WHERE email = $1 OR employee_id = $2',
      [email, employee_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new personnel
    const newPersonnel = await pool.query(
      `INSERT INTO personnel (
        name, employee_id, email, password, role, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, email, role`,
      [name, employee_id, email, hashedPassword, role || 'personnel']
    );

    return res.status(201).json({
      message: 'Registration successful. You can now log in.',
      data: newPersonnel.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await pool.query('SELECT * FROM personnel WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const personnel = user.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, personnel.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    await pool.query(
      `UPDATE personnel
       SET two_factor_code_hash = $1, two_factor_code_expires_at = NOW() + INTERVAL '10 minutes'
       WHERE id = $2`,
      [hashLoginCode(code), personnel.id]
    );

    try {
      await sendLoginCodeEmail({ email: personnel.email, name: personnel.name, code });
    } catch (emailError) {
      await pool.query(
        'UPDATE personnel SET two_factor_code_hash = NULL, two_factor_code_expires_at = NULL WHERE id = $1',
        [personnel.id]
      );
      console.error('Two-step login email error:', emailError);
      return res.status(503).json({ message: 'Login code could not be sent because email delivery is unavailable.' });
    }

    const challengeToken = jwt.sign(
      { id: personnel.id, email: personnel.email, purpose: 'two_factor_login' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.status(202).json({
      message: 'A login code has been sent to your email.',
      requiresTwoFactor: true,
      challengeToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const verifyLoginCode = async (req, res) => {
  try {
    const { challengeToken, code } = req.body;
    if (!challengeToken || !code) {
      return res.status(400).json({ message: 'Login code is required' });
    }

    let challenge;
    try {
      challenge = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ message: 'Login challenge expired. Please log in again.' });
    }

    if (challenge.purpose !== 'two_factor_login') {
      return res.status(403).json({ message: 'Invalid login challenge.' });
    }

    const result = await pool.query(
      `UPDATE personnel
       SET two_factor_code_hash = NULL, two_factor_code_expires_at = NULL
       WHERE id = $1 AND two_factor_code_hash = $2 AND two_factor_code_expires_at > NOW()
       RETURNING id, name, email, role`,
      [challenge.id, hashLoginCode(String(code).trim())]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired login code.' });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Two-step verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, verifyLoginCode };
