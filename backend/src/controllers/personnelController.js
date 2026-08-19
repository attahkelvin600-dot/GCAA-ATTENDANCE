const pool = require('../config/database');

// Get all personnel
const getAllPersonnel = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, employee_id, email, role, created_at FROM personnel ORDER BY name'
    );

    return res.status(200).json({
      message: 'Personnel list retrieved',
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all personnel error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get single personnel
const getPersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, employee_id, email, role, created_at FROM personnel WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    return res.status(200).json({
      message: 'Personnel retrieved',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get personnel error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update personnel (admin only)
const updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const result = await pool.query(
      'UPDATE personnel SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role) WHERE id = $4 RETURNING *',
      [name, email, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    return res.status(200).json({
      message: 'Personnel updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update personnel error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete personnel (admin only)
const deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM personnel WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    return res.status(200).json({ message: 'Personnel deleted successfully' });
  } catch (error) {
    console.error('Delete personnel error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getAllPersonnel,
  getPersonnel,
  updatePersonnel,
  deletePersonnel
};
