const express = require('express');
const { register, login, verifyLoginCode } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/verify-code', verifyLoginCode);

module.exports = router;
