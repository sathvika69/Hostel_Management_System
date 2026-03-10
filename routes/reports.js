const express = require('express');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Request = require('../models/Request');
const Complaint = require('../models/Complaint');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get Reports Dashboard (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const totalHostels = await Hostel.countDocuments();
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Full' });
    const pendingRequests = await Request.countDocuments({ status: 'Pending' });
    const activeComplaints = await Complaint.countDocuments({ status: 'Pending' });

    res.json({
      totalHostels,
      totalRooms,
      availableRooms,
      occupiedRooms,
      pendingRequests,
      activeComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

