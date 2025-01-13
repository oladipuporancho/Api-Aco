const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // MongoDB User model
const dotenv = require('dotenv');

dotenv.config();

// Login logic
const login = async (req, res) => {
  const { email, password } = req.body;  // Use 'email' consistently

  try {
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;

    if (email !== userEmail) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, userPassword);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful!',
      user: 'Administrator',
      email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Change password logic
const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;

    if (email !== userEmail) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(oldPassword, userPassword);
    if (!match) return res.status(400).json({ message: 'Invalid current password' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    process.env.USER_PASSWORD = hashedNewPassword; // Update the password in memory

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Forgot password logic
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userEmail = process.env.USER_EMAIL;

    if (email !== userEmail) return res.status(400).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    process.env.RESET_OTP = otp;
    process.env.RESET_OTP_EXPIRES = Date.now() + 10 * 60 * 1000; // 10 minutes

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is: ${otp}`,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset password logic
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const userEmail = process.env.USER_EMAIL;
    const resetOtp = process.env.RESET_OTP;
    const resetOtpExpires = process.env.RESET_OTP_EXPIRES;

    if (email !== userEmail) return res.status(400).json({ message: 'User not found' });

    if (!resetOtp || resetOtp !== otp || resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    process.env.USER_PASSWORD = hashedNewPassword; // Update the password in memory
    process.env.RESET_OTP = undefined;
    process.env.RESET_OTP_EXPIRES = undefined;

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { login, changePassword, forgotPassword, resetPassword };
