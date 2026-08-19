const express = require('express');
const { checkIn, checkOut, getAttendance, getDailyReport } = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/check-in', verifyToken, checkIn);
router.post('/check-out', verifyToken, checkOut);
router.get('/records', verifyToken, getAttendance);
router.get('/daily-report', verifyToken, getDailyReport);

module.exports = router;
