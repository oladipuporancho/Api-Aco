const express = require('express');
const { login, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Login route
router.post('/login', login);

// Change password route
router.post('/change-password', changePassword);

// Forgot password route (OTP generation)
router.post('/forgot-password', forgotPassword);

// Reset password route (OTP validation and password reset)
router.post('/reset-password', resetPassword);

module.exports = router;
