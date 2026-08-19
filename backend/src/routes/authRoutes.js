const express = require('express');
const { register, login, verifyLoginCode, verifyEmail, resendVerification } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/verify-code', verifyLoginCode);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
