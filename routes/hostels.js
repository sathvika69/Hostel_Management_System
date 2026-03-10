const express = require('express');
const Hostel = require('../models/Hostel');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Add Hostel (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, type, totalRooms, address } = req.body;

    const hostelId = `HST${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const hostel = new Hostel({
      hostelId,
      name,
      type,
      totalRooms,
      address
    });

    await hostel.save();
    res.status(201).json({ message: 'Hostel added successfully', hostel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Hostels
router.get('/', auth, async (req, res) => {
  try {
    const hostels = await Hostel.find().sort({ createdAt: -1 });
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Hostel by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

