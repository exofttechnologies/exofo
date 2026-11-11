const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Task = require('../models/Task');

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

