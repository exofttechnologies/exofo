const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Project = require('../models/Project');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
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
      passwordHash: temporaryPassword || 'Welcome123!',
    });

    const saved = await newEmp.save();
    res.status(201).json({ success: true, data: saved });
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
 * GET /api/employees/:employeeId
 */
router.get('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({
      $or: [{ employeeId: employeeId }, { _id: employeeId.match(/^[0-9a-fA-F]{24}$/) ? employeeId : null }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
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
    res.json({ success: true, data: saved });
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

    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

