const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Project = require('../models/Project');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(plainPassword), salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword) return false;
  if (!storedHash) {
    return plainPassword === 'Welcome123!';
  }
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const [, salt, storedHex] = parts;
    const derived = crypto.scryptSync(String(plainPassword), salt, 64);
    const expected = Buffer.from(storedHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  }
  // Support legacy unhashed demo records seamlessly until updated
  return String(plainPassword) === String(storedHash);
}

function computeInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return String(name || 'EM').substring(0, 2).toUpperCase();
}

function sanitizeEmployee(empDoc) {
  const obj = empDoc.toObject ? empDoc.toObject() : { ...empDoc };
  delete obj.passwordHash;
  return {
    ...obj,
    id: String(obj._id || obj.id || ''),
    initials: obj.initials || computeInitials(obj.name),
    joiningDate: obj.joiningDate ? new Date(obj.joiningDate).toISOString().split('T')[0] : '',
  };
}

function isRequesterAuthorized(req, employee) {
  const requesterHeader = req.headers['x-employee-id'];
  if (!requesterHeader) return true;
  const cleanReq = String(requesterHeader).trim().toLowerCase();
  return (
    cleanReq === String(employee._id).toLowerCase() ||
    cleanReq === String(employee.employeeId).toLowerCase() ||
    cleanReq === String(employee.email).toLowerCase()
  );
}

async function resolveEmployee(identifier) {
  const clean = String(identifier || '').trim();
  const orConditions = [
    { employeeId: new RegExp(`^${escapeRegex(clean)}$`, 'i') },
    { email: clean.toLowerCase() },
  ];
  if (clean.match(/^[0-9a-fA-F]{24}$/)) {
    orConditions.push({ _id: clean });
  }
  return Employee.findOne({ $or: orConditions });
}

/**
 * GET /api/employees
 */
router.get('/', async (req, res) => {
  try {
    const { search, designation, status, department } = req.query;
    const filter = {};

    if (designation && designation !== 'All') {
      filter.designation = designation;
    }

    if (status && status !== 'All') {
      filter.accountStatus = status;
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { designation: new RegExp(search, 'i') },
      ];
    }

    const employees = await Employee.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/employees
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, designation, department, joiningDate, employeeId, temporaryPassword } = req.body;

    if (!name || !email || !phone || !designation || !department || !joiningDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Duplicate check
    const existingEmail = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: `Email "${email}" is already registered` });
    }

    let finalEmpId = employeeId;
    if (!finalEmpId) {
      const count = await Employee.countDocuments();
      finalEmpId = `EMP${(count + 1).toString().padStart(3, '0')}`;
    }

    const existingId = await Employee.findOne({ employeeId: finalEmpId });
    if (existingId) {
      return res.status(409).json({ success: false, message: `Employee ID "${finalEmpId}" is already taken` });
    }

    const newEmp = new Employee({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      department: department.trim(),
      joiningDate: new Date(joiningDate),
      employeeId: finalEmpId.trim(),
      accountStatus: 'Active',
      passwordHash: hashPassword(temporaryPassword || 'Welcome123!'),
    });

    const saved = await newEmp.save();
    res.status(201).json({ success: true, data: sanitizeEmployee(saved) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/employees/:employeeId/dashboard
 * Dynamic employee dashboard metrics, tasks, and profile
 */
router.get('/:employeeId/dashboard', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({
      $or: [{ employeeId: employeeId }, { _id: employeeId.match(/^[0-9a-fA-F]{24}$/) ? employeeId : null }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Find all tasks assigned to this employee
    const assignedTasks = await Task.find({
      $or: [
        { assignedEmployee: employee._id },
        { assignedEmployeeName: new RegExp(`^${employee.name}$`, 'i') },
      ],
    }).sort({ createdAt: -1 });

    const myTasksCount = assignedTasks.length;
    const inProgressCount = assignedTasks.filter((t) => t.status === 'In Progress').length;
    const completedCount = assignedTasks.filter((t) => t.status === 'Completed').length;
    const pendingCount = assignedTasks.filter((t) => t.status === 'Pending').length;

    const myProjectsCount = await Project.countDocuments({
      status: { $ne: 'Archived' },
      $or: [
        { 'assignedEmployees.employeeRef': employee._id },
        { 'assignedEmployees.employeeId': new RegExp(`^${escapeRegex(employee.employeeId)}$`, 'i') },
        { 'assignedEmployees.email': employee.email.toLowerCase() },
        { 'assignedEmployees.name': new RegExp(`^${escapeRegex(employee.name)}$`, 'i') },
      ],
    });

    // Today's tasks (due today or active, up to 5)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = assignedTasks
      .filter((t) => {
        if (!t.dueDate) return true;
        const d = new Date(t.dueDate);
        return d <= tomorrow;
      })
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          department: employee.department,
          avatar: employee.avatar || '',
          accountStatus: employee.accountStatus,
          unreadNotifications: 2,
        },
        counts: {
          myTasks: myTasksCount,
          myProjects: myProjectsCount,
          inProgress: inProgressCount,
          completed: completedCount,
          pending: pendingCount,
        },
        todayTasks,
        assignedTasks,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/employees/:employeeId/projects
 * Retrieve only projects assigned to the authenticated employee, with summary counts & filters
 */
router.get('/:employeeId/projects', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, search } = req.query;
    const requesterHeader = req.headers['x-employee-id'];

    const employee = await resolveEmployee(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.accountStatus === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Inactive accounts cannot access employee projects' });
    }

    // Enforce backend employee authorization when header is provided
    if (requesterHeader) {
      const cleanReq = String(requesterHeader).trim().toLowerCase();
      const matchesEmployee =
        cleanReq === String(employee._id).toLowerCase() ||
        cleanReq === String(employee.employeeId).toLowerCase() ||
        cleanReq === String(employee.email).toLowerCase();

      if (!matchesEmployee) {
        return res.status(403).json({ success: false, message: "Access denied: cannot view another employee's projects" });
      }
    }

    const assignmentConditions = [
      { 'assignedEmployees.employeeRef': employee._id },
      { 'assignedEmployees.employeeId': new RegExp(`^${escapeRegex(employee.employeeId)}$`, 'i') },
      { 'assignedEmployees.email': employee.email.toLowerCase() },
      { 'assignedEmployees.name': new RegExp(`^${escapeRegex(employee.name)}$`, 'i') },
    ];

    // Fetch all projects assigned to this employee to compute accurate summary metrics
    const allAssignedProjects = await Project.find({
      $and: [
        { status: { $ne: 'Archived' } },
        { $or: assignmentConditions },
      ],
    }).sort({ updatedAt: -1 });

    const summary = {
      total: allAssignedProjects.length,
      inProgress: allAssignedProjects.filter((p) => p.status === 'In Progress').length,
      completed: allAssignedProjects.filter((p) => p.status === 'Completed').length,
      notStarted: allAssignedProjects.filter((p) => p.status === 'Not Started').length,
      onHold: allAssignedProjects.filter((p) => p.status === 'On Hold').length,
    };

    // Build filtered database query restricted to assigned projects
    const filteredConditions = [
      { status: { $ne: 'Archived' } },
      { $or: assignmentConditions },
    ];

    if (status && status !== 'All') {
      filteredConditions.push({ status: String(status) });
    }

    if (search && String(search).trim()) {
      const searchRegex = new RegExp(escapeRegex(String(search).trim()), 'i');
      filteredConditions.push({
        $or: [
          { name: searchRegex },
          { projectCode: searchRegex },
          { 'client.name': searchRegex },
          { 'client.company': searchRegex },
          { description: searchRegex },
        ],
      });
    }

    const projects = await Project.find({ $and: filteredConditions }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          avatar: employee.avatar || '',
        },
        summary,
        projects,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/employees/:employeeId/projects/:projectId
 * Allow assigned employee to view & update project details (without altering assignments or code)
 */
router.put('/:employeeId/projects/:projectId', async (req, res) => {
  try {
    const { employeeId, projectId } = req.params;
    const employee = await resolveEmployee(employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.accountStatus === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Inactive accounts cannot edit projects' });
    }

    if (!isRequesterAuthorized(req, employee)) {
      return res.status(403).json({ success: false, message: 'Access denied: unauthorized project update attempt' });
    }

    const projectIdConditions = [
      { projectCode: new RegExp(`^${escapeRegex(projectId)}$`, 'i') },
    ];
    if (String(projectId).match(/^[0-9a-fA-F]{24}$/)) {
      projectIdConditions.push({ _id: projectId });
    }

    const assignmentConditions = [
      { 'assignedEmployees.employeeRef': employee._id },
      { 'assignedEmployees.employeeId': new RegExp(`^${escapeRegex(employee.employeeId)}$`, 'i') },
      { 'assignedEmployees.email': employee.email.toLowerCase() },
      { 'assignedEmployees.name': new RegExp(`^${escapeRegex(employee.name)}$`, 'i') },
    ];

    const project = await Project.findOne({
      $and: [
        { $or: projectIdConditions },
        { $or: assignmentConditions },
      ],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or not assigned to this employee' });
    }

    const {
      name,
      description,
      category,
      status,
      priority,
      progress,
      startDate,
      expectedCompletionDate,
      client,
    } = req.body;

    if (name && String(name).trim()) project.name = String(name).trim();
    if (typeof description === 'string') project.description = description.trim();
    if (typeof category === 'string' && category.trim()) project.category = category.trim();
    if (status && ['Not Started', 'In Progress', 'On Hold', 'Completed'].includes(status)) {
      project.status = status;
    }
    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      project.priority = priority;
    }
    if (typeof progress === 'number' && progress >= 0 && progress <= 100) {
      project.progress = Math.round(progress);
    }
    if (typeof startDate === 'string') project.startDate = startDate;
    if (typeof expectedCompletionDate === 'string') project.expectedCompletionDate = expectedCompletionDate;

    if (client && typeof client === 'object') {
      project.client = {
        name: typeof client.name === 'string' ? client.name.trim() : project.client.name,
        phone: typeof client.phone === 'string' ? client.phone.trim() : project.client.phone,
        email: typeof client.email === 'string' ? client.email.trim() : project.client.email,
        address: typeof client.address === 'string' ? client.address.trim() : project.client.address,
        company: typeof client.company === 'string' ? client.company.trim() : project.client.company,
      };
    }

    const saved = await project.save();
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/employees/:employeeId/profile
 * Fetch authenticated employee profile + live work summary counts
 */
router.get('/:employeeId/profile', async (req, res) => {
  try {
    const employee = await resolveEmployee(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!isRequesterAuthorized(req, employee)) {
      return res.status(403).json({ success: false, message: "Access denied: cannot view another employee's profile" });
    }

    const assignedProjectsCount = await Project.countDocuments({
      status: { $ne: 'Archived' },
      $or: [
        { 'assignedEmployees.employeeRef': employee._id },
        { 'assignedEmployees.employeeId': new RegExp(`^${escapeRegex(employee.employeeId)}$`, 'i') },
        { 'assignedEmployees.email': employee.email.toLowerCase() },
        { 'assignedEmployees.name': new RegExp(`^${escapeRegex(employee.name)}$`, 'i') },
      ],
    });

    const assignedTasks = await Task.find({
      $or: [
        { assignedEmployee: employee._id },
        { assignedEmployeeName: new RegExp(`^${escapeRegex(employee.name)}$`, 'i') },
      ],
    });

    const activeTasks = assignedTasks.filter(
      (t) => t.status === 'Pending' || t.status === 'In Progress'
    ).length;
    const completedTasks = assignedTasks.filter((t) => t.status === 'Completed').length;

    res.json({
      success: true,
      data: {
        employee: sanitizeEmployee(employee),
        workSummary: {
          assignedProjects: assignedProjectsCount,
          activeTasks,
          completedTasks,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/employees/:employeeId/profile
 * Update only employee-permitted profile fields (name, phone, address, avatar)
 */
router.put('/:employeeId/profile', async (req, res) => {
  try {
    const employee = await resolveEmployee(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!isRequesterAuthorized(req, employee)) {
      return res.status(403).json({ success: false, message: "Access denied: cannot edit another employee's profile" });
    }

    // Reject attempts to alter admin-controlled employment fields
    const forbiddenFields = ['employeeId', 'designation', 'department', 'joiningDate', 'accountStatus', 'reportingManager', 'passwordHash'];
    const attemptedForbidden = forbiddenFields.filter((f) => Object.prototype.hasOwnProperty.call(req.body, f));
    if (attemptedForbidden.length > 0) {
      return res.status(403).json({
        success: false,
        message: `You are not permitted to modify employment field(s): ${attemptedForbidden.join(', ')}`,
      });
    }

    const { name, phone, address, avatar } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, message: 'Mobile Number is required' });
    }

    employee.name = String(name).trim();
    employee.phone = String(phone).trim();
    if (typeof address === 'string') {
      employee.address = address.trim();
    }
    if (typeof avatar === 'string') {
      employee.avatar = avatar;
    }

    const saved = await employee.save();
    res.json({ success: true, data: sanitizeEmployee(saved) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/employees/:employeeId/change-password
 * Verify current password and save scrypt-hashed new password
 */
router.post('/:employeeId/change-password', async (req, res) => {
  try {
    const employee = await resolveEmployee(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!isRequesterAuthorized(req, employee)) {
      return res.status(403).json({ success: false, message: "Access denied: cannot change another employee's password" });
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    if (!verifyPassword(currentPassword, employee.passwordHash)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match' });
    }

    employee.passwordHash = hashPassword(newPassword);
    await employee.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/employees/:employeeId
 */
router.get('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({
      $or: [{ employeeId: employeeId }, { _id: employeeId.match(/^[0-9a-fA-F]{24}$/) ? employeeId : null }],
    }).select('-passwordHash');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: sanitizeEmployee(employee) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/employees/:employeeId
 */
router.put('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({
      $or: [{ employeeId: employeeId }, { _id: employeeId.match(/^[0-9a-fA-F]{24}$/) ? employeeId : null }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { name, email, phone, designation, department, joiningDate, accountStatus } = req.body;

    if (email && email.toLowerCase() !== employee.email.toLowerCase()) {
      const duplicate = await Employee.findOne({ email: email.toLowerCase().trim(), _id: { $ne: employee._id } });
      if (duplicate) {
        return res.status(409).json({ success: false, message: `Email "${email}" is already in use` });
      }
      employee.email = email.toLowerCase().trim();
    }

    if (name) employee.name = name.trim();
    if (phone) employee.phone = phone.trim();
    if (designation) employee.designation = designation.trim();
    if (department) employee.department = department.trim();
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (accountStatus) employee.accountStatus = accountStatus;

    const saved = await employee.save();
    res.json({ success: true, data: sanitizeEmployee(saved) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/employees/:employeeId/status
 */
router.patch('/:employeeId/status', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { accountStatus } = req.body;

    const employee = await Employee.findOne({
      $or: [{ employeeId: employeeId }, { _id: employeeId.match(/^[0-9a-fA-F]{24}$/) ? employeeId : null }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.accountStatus = accountStatus || (employee.accountStatus === 'Active' ? 'Inactive' : 'Active');
    const saved = await employee.save();

    res.json({ success: true, data: sanitizeEmployee(saved) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

