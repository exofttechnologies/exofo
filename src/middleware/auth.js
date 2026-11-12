const { verifyToken } = require('../utils/jwt');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

/**
 * Protect routes — requires a valid JWT in Authorization header.
 * Attaches req.user = { id, role } after verification.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Attach light user info
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }
};

/**
 * Restrict to admin-only routes.
 * Must be used AFTER protect().
 */
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
};

module.exports = { protect, adminOnly };

