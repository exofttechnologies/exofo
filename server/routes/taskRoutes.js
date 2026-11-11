const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const TaskActivity = require('../models/TaskActivity');

/**
 * GET /api/tasks
 * Fetch all tasks with optional query filters:
 * ?status=Pending&priority=High&employee=Ahmed&project=PRJ001&search=listing
 */
router.get('/', async (req, res) => {
  try {
    const { status, priority, employee, project, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (employee && employee !== 'All') {
      filter.$or = [
        { assignedEmployee: employee },
        { assignedEmployeeName: new RegExp(employee, 'i') },
      ];
    }

    if (project && project !== 'All') {
      if (project === 'independent') {
        filter.isIndependent = true;
      } else {
        filter.$or = [
          { projectId: project },
          { projectCode: project },
          { projectName: new RegExp(project, 'i') },
        ];
      }
    }

    if (search) {
      filter.$or = [
        { taskName: new RegExp(search, 'i') },
        { taskId: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tasks/:taskId
 * Retrieve a single task by its taskId or ObjectId
 */
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({
      $or: [{ taskId: taskId }, { _id: taskId.match(/^[0-9a-fA-F]{24}$/) ? taskId : null }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const activities = await TaskActivity.find({ taskId: task.taskId }).sort({ timestamp: 1 });

    res.json({ success: true, data: { ...task.toObject(), activityHistory: activities } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/tasks
 * Create a new task (only taskName is mandatory)
 */
router.post('/', async (req, res) => {
  try {
    const {
      taskName,
      description,
      assignedEmployee,
      assignedEmployeeName,
      assignedEmployeeDesignation,
      projectId,
      projectName,
      projectCode,
      priority = 'Medium',
      status = 'Pending',
      startDate,
      dueDate,
      createdBy = 'Admin',
    } = req.body;

    if (!taskName || !taskName.trim()) {
      return res.status(400).json({ success: false, message: 'Task Name is required' });
    }

    // Auto-generate unique sequential Task ID e.g. TSK001, TSK002...
    const count = await Task.countDocuments();
    const nextNum = (count + 1).toString().padStart(3, '0');
    const taskId = req.body.taskId || `TSK${nextNum}`;

    const isIndependent = !projectId || projectId === 'independent';

    const newTask = new Task({
      taskId,
      taskName: taskName.trim(),
      description: description ? description.trim() : '',
      assignedEmployee: assignedEmployee || null,
      assignedEmployeeName: assignedEmployeeName || '',
      assignedEmployeeDesignation: assignedEmployeeDesignation || '',
      projectId: isIndependent ? null : projectId,
      projectName: isIndependent ? '' : projectName,
      projectCode: isIndependent ? '' : projectCode,
      isIndependent,
      priority,
      status,
      progress: status === 'Completed' ? 100 : status === 'In Progress' ? 25 : 0,
      startDate: startDate || null,
      dueDate: dueDate || null,
      createdBy,
    });

    const savedTask = await newTask.save();

    // Log creation activity
    await TaskActivity.create({
      taskId: savedTask.taskId,
      description: `Task created: ${savedTask.taskName}`,
      type: 'created',
      updatedBy: createdBy,
    });

    if (savedTask.assignedEmployeeName) {
      await TaskActivity.create({
        taskId: savedTask.taskId,
        description: `Assigned to ${savedTask.assignedEmployeeName}`,
        type: 'assigned',
        updatedBy: createdBy,
      });
    }

    res.status(201).json({ success: true, data: savedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/tasks/:taskId
 * Update an existing task
 */
router.put('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({
      $or: [{ taskId: taskId }, { _id: taskId.match(/^[0-9a-fA-F]{24}$/) ? taskId : null }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      taskName,
      description,
      assignedEmployee,
      assignedEmployeeName,
      assignedEmployeeDesignation,
      projectId,
      projectName,
      projectCode,
      priority,
      status,
      progress,
      startDate,
      dueDate,
      progressNotes,
    } = req.body;

    if (taskName) task.taskName = taskName.trim();
    if (description !== undefined) task.description = description;

    // Handle employee assignment changes
    if (assignedEmployee !== undefined) {
      const prevEmployee = task.assignedEmployeeName;
      task.assignedEmployee = assignedEmployee || null;
      task.assignedEmployeeName = assignedEmployeeName || '';
      task.assignedEmployeeDesignation = assignedEmployeeDesignation || '';

      if (assignedEmployeeName && assignedEmployeeName !== prevEmployee) {
        await TaskActivity.create({
          taskId: task.taskId,
          description: `Reassigned to ${assignedEmployeeName}`,
          type: 'reassigned',
          updatedBy: 'Admin',
        });
      } else if (!assignedEmployee && prevEmployee) {
        await TaskActivity.create({
          taskId: task.taskId,
          description: `Employee assignment removed (previously ${prevEmployee})`,
          type: 'reassigned',
          updatedBy: 'Admin',
        });
      }
    }

    // Handle project association changes
    if (projectId !== undefined) {
      const isIndependent = !projectId || projectId === 'independent';
      task.isIndependent = isIndependent;
      task.projectId = isIndependent ? null : projectId;
      task.projectName = isIndependent ? '' : (projectName || '');
      task.projectCode = isIndependent ? '' : (projectCode || '');
    }

    if (priority) task.priority = priority;
    if (status && status !== task.status) {
      const prevStatus = task.status;
      task.status = status;
      await TaskActivity.create({
        taskId: task.taskId,
        description: `Status changed from ${prevStatus} to ${status}`,
        type: status === 'Completed' ? 'completed' : 'status_changed',
        updatedBy: 'Admin',
      });
    }

    if (progress !== undefined) {
      const prevProgress = task.progress;
      task.progress = Number(progress);
      if (prevProgress !== Number(progress)) {
        await TaskActivity.create({
          taskId: task.taskId,
          description: `Progress updated from ${prevProgress}% to ${progress}%`,
          type: 'progress_updated',
          updatedBy: 'Admin',
        });
      }
    }

    if (startDate !== undefined) task.startDate = startDate || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (progressNotes !== undefined) task.progressNotes = progressNotes;

    const updatedTask = await task.save();

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/tasks/:taskId/status
 * Quick update of task status
 */
router.patch('/:taskId/status', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const task = await Task.findOne({
      $or: [{ taskId: taskId }, { _id: taskId.match(/^[0-9a-fA-F]{24}$/) ? taskId : null }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const prevStatus = task.status;
    task.status = status;
    if (status === 'Completed') {
      task.progress = 100;
    }

    await task.save();

    await TaskActivity.create({
      taskId: task.taskId,
      description: `Status changed from ${prevStatus} to ${status}`,
      type: status === 'Completed' ? 'completed' : 'status_changed',
      updatedBy: 'Admin',
    });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 */
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOneAndDelete({
      $or: [{ taskId: taskId }, { _id: taskId.match(/^[0-9a-fA-F]{24}$/) ? taskId : null }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await TaskActivity.deleteMany({ taskId: task.taskId });

    res.json({ success: true, message: `Task ${task.taskId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tasks/:taskId/activity
 * Retrieve activity history
 */
router.get('/:taskId/activity', async (req, res) => {
  try {
    const { taskId } = req.params;
    const activities = await TaskActivity.find({ taskId }).sort({ timestamp: -1 });
    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

