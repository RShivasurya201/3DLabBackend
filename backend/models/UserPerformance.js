const mongoose = require('mongoose');

const userPerformanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  physics: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    average: { type: Number, default: 0 }
  },
  chemistry: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    average: { type: Number, default: 0 }
  },
  biology: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    average: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('UserPerformance', userPerformanceSchema); 