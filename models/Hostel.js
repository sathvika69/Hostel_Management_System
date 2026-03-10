const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  hostelId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Boys', 'Girls'],
    required: true
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hostel', hostelSchema);

