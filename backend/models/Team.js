const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  color: {
    type: String,
    required: true,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema); 