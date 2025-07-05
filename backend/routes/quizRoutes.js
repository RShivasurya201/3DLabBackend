const express = require('express');
const router = express.Router();
const { createQuiz, getAllQuizzes, getQuizById, submitQuiz, getUserPerformance } = require('../controllers/quizController');

// Teacher creates quiz
router.post('/', createQuiz);

// Student views all quizzes
router.get('/', getAllQuizzes);

// Student takes quiz (fetch by ID)
router.get('/:id', getQuizById);

// Submit quiz answers
router.post('/submit', submitQuiz);

// Get user performance
router.get('/performance/:userId', getUserPerformance);

module.exports = router;
