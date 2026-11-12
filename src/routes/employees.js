const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/employees - list employees with optional filters
router.get('/', async (req, res) => {
  try {
    const { search, designation, status, department } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.accountStatus = status;
    }
    if (designation && designation !== 'All') {
      query.designation = designation;
    }
    if (department && department !== 'All') {
      query.department = department;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { employeeId: regex },
        { email: regex },
        { designation: regex },
        { department: regex },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    const data = employees.map(e => e.toProfile());
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:idOrEmpId - get single employee
router.get('/:idOrEmpId', async (req, res) => {
  try {
    const { idOrEmpId } = req.params;
    let employee = null;

    if (idOrEmpId.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(idOrEmpId);
    }
    if (!employee) {
      employee = await Employee.findOne({
        $or: [
          { employeeId: idOrEmpId.toUpperCase() },
          { email: idOrEmpId.toLowerCase() },
          { name: new RegExp(`^${idOrEmpId}$`, 'i') },
        ],
      });
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee.toProfile() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:idOrEmpId/dashboard - employee personalized dashboard
router.get('/:idOrEmpId/dashboard', async (req, res) => {
  try {
    const { idOrEmpId } = req.params;
    let employee = null;

    if (idOrEmpId.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(idOrEmpId);
    }
    if (!employee) {
      employee = await Employee.findOne({
        $or: [
          { employeeId: idOrEmpId.toUpperCase() },
          { email: idOrEmpId.toLowerCase() },
          { name: new RegExp(`^${idOrEmpId}$`, 'i') },
        ],
      });
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const empId = employee.employeeId;
    const empMongoId = employee._id.toString();

    // Fetch tasks belonging to this employee
    const tasks = await Task.find({
      $or: [
        { assignedEmployeeId: empId },
        { assignedEmployeeId: empMongoId },
        { assignedEmployeeName: new RegExp(`^${employee.name}$`, 'i') },
      ],
    }).sort({ updatedAt: -1 });

    // Fetch projects where employee is assigned
    const projects = await Project.find({
      $or: [
        { 'assignedEmployees.id': empId },
        { 'assignedEmployees.id': empMongoId },
        { 'assignedEmployees.name': new RegExp(`^${employee.name}$`, 'i') },
        { assignedEmployees: { $elemMatch: { $or: [{ id: empId }, { name: employee.name }] } } },
      ],
    });

    const myTasksCount = tasks.length;
    const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const pendingCount = tasks.filter(t => t.status === 'Pending').length;

    const data = {
      employee: employee.toProfile(),
      counts: {
        myTasks: myTasksCount,
        myProjects: projects.length,
        inProgress: inProgressCount,
        completed: completedCount,
        pending: pendingCount,
      },
      assignedProjects: projects.map(p => p.toClient()),
      todayTasks: tasks.slice(0, 5).map(t => t.toClient()),
      assignedTasks: tasks.map(t => t.toClient()),
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:idOrEmpId/projects - projects assigned to employee
router.get('/:idOrEmpId/projects', async (req, res) => {
  try {
    const { idOrEmpId } = req.params;
    const { status, search } = req.query;

    let employee = null;
    if (idOrEmpId.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(idOrEmpId);
    }
    if (!employee) {
      employee = await Employee.findOne({
        $or: [
          { employeeId: idOrEmpId.toUpperCase() },
          { email: idOrEmpId.toLowerCase() },
          { name: new RegExp(`^${idOrEmpId}$`, 'i') },
        ],
      });
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const empId = employee.employeeId;
    const empMongoId = employee._id.toString();

    const query = {
      $or: [
        { 'assignedEmployees.id': empId },
        { 'assignedEmployees.id': empMongoId },
        { 'assignedEmployees.name': new RegExp(`^${employee.name}$`, 'i') },
      ],
    };

    if (status && status !== 'All') {
      query.status = status;
    }
    if (search && search.trim()) {
      query.name = new RegExp(search.trim(), 'i');
    }

    const projects = await Project.find(query).sort({ updatedAt: -1 });
    const allAssigned = await Project.find({
      $or: [
        { 'assignedEmployees.id': empId },
        { 'assignedEmployees.id': empMongoId },
        { 'assignedEmployees.name': new RegExp(`^${employee.name}$`, 'i') },
      ],
    });

    const summary = {
      total: allAssigned.length,
      inProgress: allAssigned.filter(p => p.status === 'In Progress').length,
      completed: allAssigned.filter(p => p.status === 'Completed').length,
      notStarted: allAssigned.filter(p => p.status === 'Not Started').length,
      onHold: allAssigned.filter(p => p.status === 'On Hold').length,
    };

    res.json({
      success: true,
      data: {
        employee: employee.toProfile(),
        summary,
        projects: projects.map(p => p.toClient()),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/employees - create employee
router.post('/', async (req, res) => {
  try {
    const emp = await Employee.create(req.body);
    res.status(201).json({ success: true, data: emp.toProfile() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/employees/:idOrEmpId - update employee
router.put('/:idOrEmpId', async (req, res) => {
  try {
    const { idOrEmpId } = req.params;
    let employee = null;

    if (idOrEmpId.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findByIdAndUpdate(idOrEmpId, req.body, { new: true, runValidators: true });
    }
    if (!employee) {
      employee = await Employee.findOneAndUpdate(
        { $or: [{ employeeId: idOrEmpId.toUpperCase() }, { email: idOrEmpId.toLowerCase() }] },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee.toProfile() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

