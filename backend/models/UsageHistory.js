const mongoose = require('mongoose');

const usageHistorySchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
usageHistorySchema.index({ teamId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('UsageHistory', usageHistorySchema); 