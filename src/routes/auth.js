const express = require('express');
const router = express.Router();
const { login, logout, getMe, seedAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/login  — unified login (admin + employee)
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', protect, logout);

// GET  /api/auth/me  — get currently authenticated user profile
router.get('/me', protect, getMe);

// POST /api/auth/seed-admin  — one-time admin creation (dev/setup only)
router.post('/seed-admin', seedAdmin);

module.exports = router;

