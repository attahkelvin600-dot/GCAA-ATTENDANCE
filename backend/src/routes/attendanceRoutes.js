const express = require('express');
const { checkIn, checkOut, getAttendance, getDailyReport } = require('../controllers/attendanceController');
const { verifyToken, denyRole } = require('../middleware/auth');

const router = express.Router();

router.post('/check-in', verifyToken, denyRole(['admin']), checkIn);
router.post('/check-out', verifyToken, denyRole(['admin']), checkOut);
router.get('/records', verifyToken, getAttendance);
router.get('/daily-report', verifyToken, getDailyReport);

module.exports = router;
