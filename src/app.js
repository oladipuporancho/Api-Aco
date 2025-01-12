const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // MongoDB connection file
const authRoutes = require('./routes/auth'); // Authentication routes

dotenv.config();

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Home route (Optional)
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Admin API!');
});

// Global error handling middleware
app.use((req, res, next) => {
  res.status(404).send({ message: 'Route not found!' });
});

module.exports = app;
