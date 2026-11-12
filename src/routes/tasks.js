const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Employee = require('../models/Employee');

// GET /api/tasks - fetch all tasks or filtered by employee
router.get('/', async (req, res) => {
  try {
    const { assignedEmployeeId, status, priority, search } = req.query;
    const query = {};

    if (assignedEmployeeId) {
      query.$or = [
        { assignedEmployeeId: assignedEmployeeId },
        { assignedEmployeeName: new RegExp(assignedEmployeeId, 'i') },
      ];
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (search && search.trim()) {
      query.$or = [
        { taskName: new RegExp(search.trim(), 'i') },
        { taskId: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ];
    }

    const tasks = await Task.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, data: tasks.map(t => t.toClient()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tasks/:id - get task by id or taskId
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let task = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      task = await Task.findById(id);
    }
    if (!task) {
      task = await Task.findOne({ taskId: id });
    }
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task.toClient() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tasks - create new task
router.post('/', async (req, res) => {
  try {
    let taskId = req.body.taskId;
    if (!taskId) {
      const count = await Task.countDocuments();
      taskId = `TSK${String(count + 1).padStart(3, '0')}`;
    }
    const task = await Task.create({ ...req.body, taskId });
    res.status(201).json({ success: true, data: task.toClient() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/tasks/:id - update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let task = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }
    if (!task) {
      task = await Task.findOneAndUpdate({ taskId: id }, req.body, { new: true, runValidators: true });
    }
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task.toClient() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

