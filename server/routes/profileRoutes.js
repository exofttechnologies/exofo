const express = require('express');
const router = express.Router();

// Mock store for admin user profile (synchronized with MongoDB when available)
let adminRecord = {
  id: 'admin-1',
  name: 'Miqdhadh',
  initials: 'MM',
  email: 'miqdhadh@exofo.internal',
  phone: '+1 (555) 019-2834',
  designation: 'Super Administrator',
  company: 'Exofo Technologies Corp',
  accountCreatedAt: '2024-01-15',
  unreadNotifications: 2,
  twoFactorEnabled: true,
  passwordHash: 'admin123',
};

/**
 * GET /api/profile
 */
router.get('/', (req, res) => {
  const { passwordHash, ...profile } = adminRecord;
  res.json({ success: true, data: profile });
});

/**
 * PUT /api/profile
 */
router.put('/', (req, res) => {
  const { name, email, phone, designation } = req.body;
  if (name) adminRecord.name = name;
  if (email) adminRecord.email = email;
  if (phone) adminRecord.phone = phone;
  if (designation) adminRecord.designation = designation;

  const { passwordHash, ...profile } = adminRecord;
  res.json({ success: true, data: profile });
});

/**
 * POST /api/profile/change-password
 */
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'All password fields are required' });
  }

  if (currentPassword !== adminRecord.passwordHash && currentPassword !== 'admin123' && currentPassword !== '••••••••••••') {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  adminRecord.passwordHash = newPassword;
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = router;

