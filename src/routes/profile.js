const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// GET /api/profile - get admin profile
router.get('/', async (req, res) => {
  try {
    const admin = await Admin.findOne().sort({ createdAt: 1 });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin profile not found' });
    }
    res.json({ success: true, data: admin.toProfile() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profile - update admin profile
router.put('/', async (req, res) => {
  try {
    const admin = await Admin.findOne().sort({ createdAt: 1 });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin profile not found' });
    }

    if (req.body.name) admin.name = req.body.name;
    if (req.body.email) admin.email = req.body.email;
    if (req.body.phone !== undefined) admin.phone = req.body.phone;
    if (req.body.designation) admin.designation = req.body.designation;
    if (req.body.company) admin.company = req.body.company;
    if (req.body.avatar !== undefined) admin.avatar = req.body.avatar;

    await admin.save();
    res.json({ success: true, data: admin.toProfile() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/profile/change-password - admin change password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findOne().select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
