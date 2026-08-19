const pool = require('../config/database');

// Check-in personnel
const checkIn = async (req, res) => {
  try {
    const { personnel_id, location, notes, location_name, latitude, longitude } = req.body;

    if (!personnel_id) {
      return res.status(400).json({ message: 'Personnel ID is required' });
    }

    // Check if personnel exists
    const personnel = await pool.query('SELECT * FROM personnel WHERE id = $1', [personnel_id]);

    if (personnel.rows.length === 0) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    // Check if already checked in today
    const todayCheckIn = await pool.query(
      `SELECT * FROM attendance 
       WHERE personnel_id = $1 
       AND DATE(check_in_time) = CURRENT_DATE 
       AND check_out_time IS NULL`,
      [personnel_id]
    );

    if (todayCheckIn.rows.length > 0) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Insert check-in record
    const attendance = await pool.query(
      `INSERT INTO attendance (
        personnel_id,
        check_in_time,
        location,
        location_name,
        latitude,
        longitude,
        notes,
        created_at
      ) 
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [personnel_id, location, location_name || location, latitude || null, longitude || null, notes]
    );

    return res.status(201).json({
      message: 'Check-in successful',
      data: attendance.rows[0]
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Check-out personnel
const checkOut = async (req, res) => {
  try {
    const { personnel_id, notes } = req.body;

    if (!personnel_id) {
      return res.status(400).json({ message: 'Personnel ID is required' });
    }

    // Find today's check-in record
    const todayCheckIn = await pool.query(
      `SELECT * FROM attendance 
       WHERE personnel_id = $1 
       AND DATE(check_in_time) = CURRENT_DATE 
       AND check_out_time IS NULL`,
      [personnel_id]
    );

    if (todayCheckIn.rows.length === 0) {
      return res.status(400).json({ message: 'No active check-in found for today' });
    }

    // Update with check-out time
    const attendance = await pool.query(
      `UPDATE attendance 
       SET check_out_time = NOW(), checkout_notes = $1 
       WHERE id = $2 
       RETURNING *`,
      [notes, todayCheckIn.rows[0].id]
    );

    return res.status(200).json({
      message: 'Check-out successful',
      data: attendance.rows[0]
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get attendance records
const getAttendance = async (req, res) => {
  try {
    const { personnel_id, start_date, end_date } = req.query;

    let query = `SELECT a.*, p.name, p.employee_id 
                 FROM attendance a 
                 JOIN personnel p ON a.personnel_id = p.id 
                 WHERE 1=1`;
    const params = [];

    if (personnel_id) {
      query += ` AND a.personnel_id = $${params.length + 1}`;
      params.push(personnel_id);
    }

    if (start_date) {
      query += ` AND DATE(a.check_in_time) >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND DATE(a.check_in_time) <= $${params.length + 1}`;
      params.push(end_date);
    }

    query += ` ORDER BY a.check_in_time DESC`;

    const result = await pool.query(query, params);

    return res.status(200).json({
      message: 'Attendance records retrieved',
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get daily report
const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    const report = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.employee_id,
        CASE
          WHEN a.check_in_time IS NULL THEN 'Not checked in'
          ELSE TO_CHAR(a.check_in_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        END AS check_in,
        CASE
          WHEN a.check_out_time IS NULL THEN 'Not checked out'
          ELSE TO_CHAR(a.check_out_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        END AS check_out,
        CASE 
          WHEN a.check_in_time IS NULL THEN 'Absent'
          WHEN a.check_out_time IS NULL THEN 'Still checked in'
          ELSE 'Present'
        END AS status
       FROM personnel p
       LEFT JOIN attendance a ON p.id = a.personnel_id AND DATE(a.check_in_time) = $1
       ORDER BY p.name`,
      [reportDate]
    );

    return res.status(200).json({
      message: 'Daily report retrieved',
      date: reportDate,
      count: report.rows.length,
      data: report.rows
    });
  } catch (error) {
    console.error('Get daily report error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { checkIn, checkOut, getAttendance, getDailyReport };
