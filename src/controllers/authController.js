const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const PASSWORD_FILE = './password.json'; // File to store hashed password
const OTP_FILE = './otp.json'; // File to store OTPs temporarily

// Helper function to read the stored password
const getStoredPassword = () => {
  try {
    const data = fs.readFileSync(PASSWORD_FILE, 'utf8');
    const { hashedPassword } = JSON.parse(data);
    return hashedPassword;
  } catch (err) {
    console.error('Error reading password file:', err.message);
    return process.env.USER_PASSWORD; // Fallback to environment variable
  }
};

// Helper function to save the new password
const saveNewPassword = (hashedPassword) => {
  try {
    const data = JSON.stringify({ hashedPassword }, null, 2);
    fs.writeFileSync(PASSWORD_FILE, data, 'utf8');
    console.log('Password updated in file successfully.');
  } catch (err) {
    console.error('Error writing password file:', err.message);
  }
};

// Hard-coded user credentials (for one user)
const USER_EMAIL = process.env.USER_EMAIL;

// Login logic
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email matches the hard-coded one
    if (email !== USER_EMAIL) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the password with the stored hashed password
    const storedPassword = getStoredPassword();
    const match = await bcrypt.compare(password, storedPassword);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate a JWT token
    const token = jwt.sign({ email: USER_EMAIL }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with login success message
    res.json({
      message: 'Login successful!',
      adminName: 'Administrator', // Replace with actual admin name if needed
      email: USER_EMAIL,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Change password logic
const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  console.log('Received request to change password for email:', email);

  try {
    if (email !== USER_EMAIL) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    const storedPassword = getStoredPassword(); // Get the current stored password
    const match = await bcrypt.compare(oldPassword, storedPassword);
    if (!match) {
      console.log('Invalid current password for email:', email);
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    saveNewPassword(hashedNewPassword); // Save the new password to the file

    console.log('Password updated successfully for email:', email);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Helper function to save OTP
const saveOtp = (email, otp) => {
  try {
    const otps = JSON.parse(fs.readFileSync(OTP_FILE, 'utf8') || '{}');
    otps[email] = otp;
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving OTP:', err.message);
  }
};

// Helper function to get OTP
const getOtp = (email) => {
  try {
    const otps = JSON.parse(fs.readFileSync(OTP_FILE, 'utf8') || '{}');
    return otps[email];
  } catch (err) {
    console.error('Error reading OTP:', err.message);
    return null;
  }
};

// Helper function to send email
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // Your Gmail password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log('Email sent successfully to:', to);
  } catch (err) {
    console.error('Error sending email:', err.message);
  }
};

// Forgot password logic
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (email !== process.env.USER_EMAIL) {
    return res.status(400).json({ message: 'User not found' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  saveOtp(email, otp);

  await sendEmail(email, 'Password Reset OTP', `Your OTP is: ${otp}`);

  res.json({ message: 'OTP sent to your email' });
};

// Validate OTP and reset password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (email !== process.env.USER_EMAIL) {
    return res.status(400).json({ message: 'User not found' });
  }

  const storedOtp = getOtp(email);
  if (!storedOtp || storedOtp != otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  fs.writeFileSync(PASSWORD_FILE, JSON.stringify({ hashedPassword: hashedNewPassword }, null, 2));

  res.json({ message: 'Password reset successfully' });
};

module.exports = { login, changePassword, forgotPassword, resetPassword };
