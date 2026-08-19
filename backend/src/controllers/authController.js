const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      'INSERT INTO personnel (name, employee_id, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, name, email, role',
      [name, employee_id, email, hashedPassword, role || 'personnel']
    );

    return res.status(201).json({
      message: 'Personnel registered successfully',
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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: personnel.id,
        email: personnel.email,
        role: personnel.role,
        name: personnel.name
      },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: personnel.id,
        name: personnel.name,
        email: personnel.email,
        role: personnel.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { register, login };
