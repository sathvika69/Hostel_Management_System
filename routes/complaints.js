const express = require('express');
const Complaint = require('../models/Complaint');
const Request = require('../models/Request');
const Room = require('../models/Room');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Add Complaint (Student)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit complaints' });
    }

    const { roomId, category, description } = req.body;

    // Verify student has an approved room allocation
    const approvedRequest = await Request.findOne({
      studentId: req.user._id,
      status: 'Approved',
      roomId: roomId
    });

    if (!approvedRequest) {
      return res.status(400).json({ message: 'You must have an approved room allocation to submit complaints' });
    }

    const complaintId = `CMP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const complaint = new Complaint({
      complaintId,
      studentId: req.user._id,
      roomId,
      category,
      description,
      status: 'Pending',
      createdAt: new Date()
    });

    await complaint.save();
    await complaint.populate('studentId', 'name email studentId');
    await complaint.populate('roomId', 'roomNumber');

    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Complaints
router.get('/', auth, async (req, res) => {
  try {
    let complaints;

    if (req.user.role === 'admin') {
      complaints = await Complaint.find()
        .populate('studentId', 'name email studentId contact')
        .populate('roomId', 'roomNumber')
        .sort({ createdAt: -1 });
    } else {
      // Student can only see their own complaints
      complaints = await Complaint.find({ studentId: req.user._id })
        .populate('roomId', 'roomNumber')
        .sort({ createdAt: -1 });
    }

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Complaint Status (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    await complaint.save();

    await complaint.populate('studentId', 'name email');
    await complaint.populate('roomId', 'roomNumber');

    res.json({ message: 'Complaint status updated', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

