const Quiz = require('../models/Quiz');
const UserPerformance = require('../models/UserPerformance');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Error creating quiz', error: err });
  }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
};

// Get a single quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz' });
  }
};

exports.submitQuiz = async (req, res) => {
    const { quizId, answers, userId } = req.body;
  
    try {
      if (!quizId || !answers || !userId) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['quizId', 'answers', 'userId']
        });
      }

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ 
          message: 'Quiz not found',
          quizId: quizId
        });
      }

      if (!Array.isArray(answers)) {
        return res.status(400).json({ 
          message: 'Answers must be an array'
        });
      }

      if (answers.length !== quiz.questions.length) {
        return res.status(400).json({ 
          message: 'Number of answers does not match number of questions',
          questionsCount: quiz.questions.length,
          answersCount: answers.length
        });
      }
  
      let score = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          score++;
        }
      });

      const percentage = (score / quiz.questions.length) * 100;
      
      // Update user performance
      let userPerformance = await UserPerformance.findOne({ userId });
      
      if (!userPerformance) {
        userPerformance = new UserPerformance({ userId });
      }

      const subject = quiz.subject.toLowerCase();
      if (['physics', 'chemistry', 'biology'].includes(subject)) {
        userPerformance[subject].totalQuizzes += 1;
        userPerformance[subject].totalScore += percentage;
        userPerformance[subject].average = 
          userPerformance[subject].totalScore / userPerformance[subject].totalQuizzes;
        
        await userPerformance.save();
      }

      res.json({
        totalQuestions: quiz.questions.length,
        correctAnswers: score,
        percentage: percentage,
        subjectAverage: userPerformance[subject].average
      });
  
    } catch (err) {
      console.error('Quiz submission error:', err);
      res.status(500).json({ 
        message: 'Error submitting quiz', 
        error: err.message,
        details: err
      });
    }
};

exports.getUserPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const performance = await UserPerformance.findOne({ userId });
    
    if (!performance) {
      return res.json({
        physics: { totalQuizzes: 0, totalScore: 0, average: 0 },
        chemistry: { totalQuizzes: 0, totalScore: 0, average: 0 },
        biology: { totalQuizzes: 0, totalScore: 0, average: 0 }
      });
    }

    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user performance', error: err });
  }
};
  