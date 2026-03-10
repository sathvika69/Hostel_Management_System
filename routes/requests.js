const express = require('express');
const Request = require('../models/Request');
const Room = require('../models/Room');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Request Room (Student)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can request rooms' });
    }

    const { hostelId, roomId } = req.body;

    // Check if student already has a pending or approved request
    const existingRequest = await Request.findOne({
      studentId: req.user._id,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending or approved request' });
    }

    const requestId = `REQ${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const request = new Request({
      requestId,
      studentId: req.user._id,
      hostelId,
      roomId: roomId || null,
      status: 'Pending',
      requestDate: new Date()
    });

    await request.save();
    await request.populate('studentId', 'name email studentId');
    await request.populate('hostelId', 'name type');
    if (request.roomId) {
      await request.populate('roomId', 'roomNumber type');
    }

    res.status(201).json({ message: 'Room request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Requests (Admin)
router.get('/', auth, async (req, res) => {
  try {
    let requests;
    
    if (req.user.role === 'admin') {
      requests = await Request.find()
        .populate('studentId', 'name email studentId contact gender')
        .populate('hostelId', 'name type')
        .populate('roomId', 'roomNumber type')
        .sort({ requestDate: -1 });
    } else {
      // Student can only see their own requests
      requests = await Request.find({ studentId: req.user._id })
        .populate('hostelId', 'name type')
        .populate('roomId', 'roomNumber type')
        .sort({ requestDate: -1 });
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Room Request (Admin)
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const { roomId } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('hostelId', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // If roomId is provided, allocate that specific room
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.status === 'Full') {
        return res.status(400).json({ message: 'Room is already full' });
      }

      // Update room occupancy
      room.occupiedCount += 1;
      if (room.occupiedCount >= room.capacity) {
        room.status = 'Full';
      }
      await room.save();

      request.roomId = roomId;
    } else {
      // Auto-allocate: Find an available room in the requested hostel
      const availableRoom = await Room.findOne({
        hostelId: request.hostelId,
        status: 'Available'
      });

      if (!availableRoom) {
        return res.status(400).json({ message: 'No available rooms in this hostel' });
      }

      // Update room occupancy
      availableRoom.occupiedCount += 1;
      if (availableRoom.occupiedCount >= availableRoom.capacity) {
        availableRoom.status = 'Full';
      }
      await availableRoom.save();

      request.roomId = availableRoom._id;
    }

    request.status = 'Approved';
    await request.save();

    await request.populate('roomId', 'roomNumber type');
    res.json({ message: 'Request approved and room allocated', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Room Request (Admin)
router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'Rejected';
    await request.save();

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

