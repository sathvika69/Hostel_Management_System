const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Single', 'Double', 'Triple'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  occupiedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Available', 'Full'],
    default: 'Available'
  }
}, {
  timestamps: true
});

// Update status based on occupancy
roomSchema.pre('save', function(next) {
  if (this.occupiedCount >= this.capacity) {
    this.status = 'Full';
  } else {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);

