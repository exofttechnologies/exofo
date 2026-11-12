const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const { signToken } = require('../utils/jwt');
const mongoose = require('mongoose');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize identifier coming from frontend.
 * Returns { type: 'admin'|'employee', identifier }
 */
function detectLoginType(loginId, roleTab) {
  const id = loginId.trim().toLowerCase();

  const adminEmails = ['admin@exofo.internal', 'miqdhadh@exofo.internal'];
  const isAdminEmail = adminEmails.includes(id) || id === 'admin';
  const isEmployeeId = /^emp\d+/i.test(id);

  if (roleTab === 'admin' || isAdminEmail) {
    return { type: 'admin', identifier: id };
  }
  return { type: 'employee', identifier: id };
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

/**
 * Unified login endpoint.
 * Body: { loginId, password, role: 'employee'|'admin', rememberMe? }
 */
exports.login = async (req, res) => {
  try {
    const { loginId, password, role } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Login ID and password are required.' });
    }

    const dbAvailable = mongoose.connection.readyState === 1;

    // ── ADMIN LOGIN ──────────────────────────────────────────────────────────
    if (role === 'admin') {
      if (!dbAvailable) {
        return res.status(503).json({ success: false, message: 'Database not connected. Cannot authenticate.' });
      }

      const id = loginId.trim().toLowerCase();
      const admin = await Admin.findOne({
        $or: [{ email: id }, { email: id + '@exofo.internal' }],
      }).select('+password');

      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      if (!admin.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Contact your system administrator.' });
      }

      const passwordMatch = await admin.comparePassword(password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Update last login
      admin.lastLoginAt = new Date();
      await admin.save({ validateBeforeSave: false });

      const token = signToken({ id: admin._id.toString(), role: admin.role });
      const profile = admin.toProfile();

      return res.status(200).json({
        success: true,
        message: `Welcome back, ${admin.name}!`,
        token,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: admin.role,
          designation: profile.designation,
          initials: profile.initials,
          avatar: profile.avatar,
        },
      });
    }

    // ── EMPLOYEE LOGIN ───────────────────────────────────────────────────────
    if (!dbAvailable) {
      return res.status(503).json({ success: false, message: 'Database not connected. Cannot authenticate.' });
    }

    const id = loginId.trim();
    const employee = await Employee.findOne({
      $or: [
        { employeeId: id.toUpperCase() },
        { email: id.toLowerCase() },
      ],
    }).select('+password');

    if (!employee) {
      return res.status(401).json({ success: false, message: 'No employee found with that ID or email.' });
    }

    if (employee.accountStatus !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact your administrator.' });
    }

    const passwordMatch = await employee.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    // Update last login
    employee.lastLoginAt = new Date();
    await employee.save({ validateBeforeSave: false });

    const token = signToken({ id: employee._id.toString(), role: 'employee' });
    const profile = employee.toProfile();

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${employee.name}!`,
      token,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        employeeId: profile.employeeId,
        role: 'employee',
        designation: profile.designation,
        department: profile.department,
        initials: profile.initials,
        avatar: profile.avatar,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

exports.logout = (req, res) => {
  // JWT is stateless — client simply drops the token.
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user's profile.
 * Requires protect() middleware.
 */
exports.getMe = async (req, res) => {
  try {
    const dbAvailable = mongoose.connection.readyState === 1;
    if (!dbAvailable) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id, role } = req.user;

    if (role === 'admin' || role === 'superadmin') {
      const admin = await Admin.findById(id);
      if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
      return res.json({ success: true, data: admin.toProfile() });
    }

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });
    return res.json({ success: true, data: employee.toProfile() });
  } catch (err) {
    console.error('[Auth] getMe error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/auth/seed-admin ────────────────────────────────────────────────

/**
 * One-time setup: create the initial admin account.
 * Only works if zero admin accounts exist in the database.
 * Remove or protect this route after first use in production.
 */
exports.seedAdmin = async (req, res) => {
  try {
    const dbAvailable = mongoose.connection.readyState === 1;
    if (!dbAvailable) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const existing = await Admin.countDocuments();
    if (existing > 0) {
      return res.status(409).json({ success: false, message: 'Admin account already exists. Seed is blocked.' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, and password are required.' });
    }

    const admin = await Admin.create({ name, email, password, role: 'superadmin' });
    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      data: admin.toProfile(),
    });
  } catch (err) {
    console.error('[Auth] Seed admin error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

