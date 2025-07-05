const express = require('express');
const router = express.Router();
const axios = require('axios');
const UserPerformance = require('../models/UserPerformance');

// Using the correct Gemini model
const MODEL_NAME = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent`;
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDcHduo3zAHUys72M-hNO6nnNqft_BXfGE';

// Fallback response generator based on performance
function generateFallbackResponse(message, userPerformance) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('performance') || lowerMessage.includes('how am i doing')) {
    if (userPerformance) {
      const physics = userPerformance.physics.average;
      const chemistry = userPerformance.chemistry.average;
      const biology = userPerformance.biology.average;
      
      if (lowerMessage.includes('physics')) {
        if (physics >= 80) {
          return "Excellent! Your physics performance is outstanding at " + physics.toFixed(1) + "%. You're demonstrating a strong grasp of physics concepts. Consider exploring advanced topics or helping other students.";
        } else if (physics >= 60) {
          return "Good work! Your physics score is " + physics.toFixed(1) + "%. You're on the right track. Focus on practicing problem-solving and reviewing key concepts to improve further.";
        } else {
          return "I see you're struggling with physics at " + physics.toFixed(1) + "%. Let's focus on building a strong foundation. Start with basic concepts and gradually work up to more complex topics.";
        }
      } else if (lowerMessage.includes('chemistry')) {
        if (chemistry >= 80) {
          return "Great job in chemistry! Your score of " + chemistry.toFixed(1) + "% shows excellent understanding. You're ready for more challenging chemistry concepts.";
        } else if (chemistry >= 60) {
          return "Your chemistry performance is " + chemistry.toFixed(1) + "%. You're making good progress. Keep practicing and reviewing the fundamentals.";
        } else {
          return "Your chemistry score is " + chemistry.toFixed(1) + "%. Let's work on strengthening your understanding of basic chemical principles.";
        }
      } else if (lowerMessage.includes('biology')) {
        if (biology >= 80) {
          return "Outstanding biology performance at " + biology.toFixed(1) + "%! You have a solid understanding of biological concepts.";
        } else if (biology >= 60) {
          return "Your biology score is " + biology.toFixed(1) + "%. You're doing well! Keep studying and practicing to improve further.";
        } else {
          return "Your biology performance is " + biology.toFixed(1) + "%. Let's focus on understanding the core biological concepts step by step.";
        }
      } else {
        return `Based on your performance: Physics ${physics.toFixed(1)}%, Chemistry ${chemistry.toFixed(1)}%, Biology ${biology.toFixed(1)}%. You're doing well overall! Focus on your weaker subjects to improve your overall performance.`;
      }
    } else {
      return "I don't have any performance data for you yet. Take some quizzes to get personalized feedback!";
    }
  }
  
  return "I'm here to help with your studies! Ask me about your performance in specific subjects or any questions you have about physics, chemistry, or biology.";
}

// Test route
router.get('/test', (req, res) => {
  console.log('Testing API with model:', MODEL_NAME);
  res.json({ 
    message: 'Gemini API is working',
    model: MODEL_NAME,
    apiKey: API_KEY ? 'Present' : 'Missing'
  });
});

// Chat endpoint with performance context
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    // Get user's performance data
    const userPerformance = await UserPerformance.findOne({ userId });
    let performanceContext = '';
    
    if (userPerformance) {
      performanceContext = `User's average percentages: Physics ${userPerformance.physics.average.toFixed(1)}%, Chemistry ${userPerformance.chemistry.average.toFixed(1)}%, Biology ${userPerformance.biology.average.toFixed(1)}%. `;
    }

    const fullPrompt = performanceContext + message;
    console.log('Sending prompt to Gemini:', fullPrompt);

    try {
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY
          }
        }
      );

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        res.json({ response: response.data.candidates[0].content.parts[0].text });
      } else {
        console.error('Unexpected response format:', response.data);
        // Fallback to basic response
        const fallbackResponse = generateFallbackResponse(message, userPerformance);
        res.json({ response: fallbackResponse, note: "Using fallback response due to API format issue" });
      }
    } catch (apiError) {
      console.error('Gemini API Error:', apiError.response?.data || apiError.message);
      
      // Use fallback response when API fails
      const fallbackResponse = generateFallbackResponse(message, userPerformance);
      res.json({ 
        response: fallbackResponse, 
        note: "Using fallback response due to API error",
        apiError: apiError.response?.status === 404 ? "Model not found" : 
                  apiError.response?.status === 403 ? "Invalid API key" : "API error"
      });
    }
  } catch (error) {
    console.error('General Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
