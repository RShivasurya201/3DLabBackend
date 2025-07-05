const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

// Routes
app.use('/api/materials', require('./routes/MaterialRoutes'));
// app.use('/api/experiments', require('./routes/experimentRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
// const chatRoutes = require('./routes/chat');
// app.use('/api/chat', chatRoutes);
app.use('/api/chat', require('./routes/geminiRoute'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

module.exports = app;
