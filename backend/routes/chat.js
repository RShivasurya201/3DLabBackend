const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Test route to verify the API is working
router.get('/test', (req, res) => {
  res.json({ message: 'Chat API is working' });
});

// Get all chat messages
router.get('/', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send a new message and get AI response
router.post('/', async (req, res) => {
  try {
    const { user, message } = req.body;
    console.log('Received message:', message);
    
    // Get response from Gemini
    const result = await model.generateContent(message);
    const response = result.response.text();
    console.log('AI response:', response);
    
    // Save message and response to database
    const chatMessage = new ChatMessage({
      user,
      message,
      response
    });
    
    await chatMessage.save();
    console.log('Message saved to database');
    
    res.json(chatMessage);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 