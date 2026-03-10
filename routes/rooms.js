const express = require('express');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Add Room (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { hostelId, roomNumber, type, capacity } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const roomId = `RM${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const room = new Room({
      roomId,
      hostelId,
      roomNumber,
      type,
      capacity,
      occupiedCount: 0,
      status: 'Available'
    });

    await room.save();
    res.status(201).json({ message: 'Room added successfully', room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Rooms
router.get('/', auth, async (req, res) => {
  try {
    const { hostelId } = req.query;
    const query = hostelId ? { hostelId } : {};
    const rooms = await Room.find(query).populate('hostelId', 'name type').sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Available Rooms (Student)
router.get('/available', auth, async (req, res) => {
  try {
    const { hostelId, type } = req.query;
    const query = { status: 'Available' };
    
    if (hostelId) query.hostelId = hostelId;
    if (type) query.type = type;

    const rooms = await Room.find(query)
      .populate('hostelId', 'name type address')
      .sort({ createdAt: -1 });
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Room by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hostelId', 'name type address');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

