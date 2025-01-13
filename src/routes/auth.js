const express = require('express');
const { login, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Login route
router.post('/login', login);

// Change password route
router.post('/change-password', changePassword);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;
