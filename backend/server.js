require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/3dlab', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Start server after successful database connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('API endpoints available:');
    console.log('- GET /api/chat/test');
    console.log('- GET /api/chat');
    console.log('- POST /api/chat');
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
