const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const TaskActivity = require('../models/TaskActivity');
const Employee = require('../models/Employee');
const Project = require('../models/Project');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function resolveAuthenticatedEmployee(req) {
  const identifier = req.headers['x-employee-id'] || req.query.employeeId;
  if (!identifier || !String(identifier).trim()) {
    return { errorStatus: 401, errorMessage: 'Authentication required: missing employee identifier' };
  }

  const clean = String(identifier).trim();
  const orConditions = [
    { employeeId: new RegExp(`^${escapeRegex(clean)}$`, 'i') },
    { email: clean.toLowerCase() },
  ];
  if (clean.match(/^[0-9a-fA-F]{24}$/)) {
    orConditions.push({ _id: clean });
  }

  const employee = await Employee.findOne({ $or: orConditions }).select('-passwordHash');
  if (!employee) {
    return { errorStatus: 401, errorMessage: 'Authenticated employee not found' };
  }
  if (employee.accountStatus === 'Inactive') {
    return { errorStatus: 403, errorMessage: 'Account is inactive' };
  }

  return { employee };
}

function buildEmployeeTaskOwnershipFilter(employee) {
  return {
    $or: [
      { assignedEmployee: employee._id },
      { assignedEmployeeCode: new RegExp(`^${escapeRegex(employee.employeeId)}$`, 'i') },
      { assignedEmployeeName: new RegExp(`^${escapeRegex(employee.name)}$`, 'i') },
    ],
  };
}

function doesTaskBelongToEmployee(task, employee) {
  if (!task || !employee) return false;
  if (task.assignedEmployee && String(task.assignedEmployee) === String(employee._id)) {
    return true;
  }
  if (
    task.assignedEmployeeCode &&
    task.assignedEmployeeCode.toLowerCase() === String(employee.employeeId).toLowerCase()
  ) {
    return true;
  }
  if (
    task.assignedEmployeeName &&
    task.assignedEmployeeName.trim().toLowerCase() === String(employee.name).trim().toLowerCase()
  ) {
    return true;
  }
  return false;
}

function computeIsOverdue(task) {
  if (!task || !task.dueDate || task.status === 'Completed') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return due < startOfToday;
}

function formatTaskForClient(taskDoc, activities = []) {
  const obj = taskDoc.toObject ? taskDoc.toObject() : { ...taskDoc };
  return {
    ...obj,
    id: String(obj._id || obj.id || obj.taskId),
    startDate: obj.startDate ? new Date(obj.startDate).toISOString().split('T')[0] : undefined,
    dueDate: obj.dueDate ? new Date(obj.dueDate).toISOString().split('T')[0] : undefined,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : new Date().toISOString(),
    isOverdue: computeIsOverdue(obj),
    activityHistory: activities.map((a) => {
      const actObj = a.toObject ? a.toObject() : { ...a };
      return {
        ...actObj,
        id: String(actObj._id || actObj.id),
        timestamp: actObj.timestamp
          ? new Date(actObj.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
      };
    }),
  };
}

/**
 * GET /api/employee/tasks
 * Retrieve only tasks assigned to the authenticated employee with summary & filters
 */
router.get('/', async (req, res) => {
  try {
    const auth = await resolveAuthenticatedEmployee(req);
    if (auth.errorStatus) {
      return res.status(auth.errorStatus).json({ success: false, message: auth.errorMessage });
    }
    const { employee } = auth;
    const { status, priority, project, dueDate, search } = req.query;

    const ownershipFilter = buildEmployeeTaskOwnershipFilter(employee);

    // Compute accurate summary counts across all tasks assigned to this employee
    const allAssigned = await Task.find(ownershipFilter).sort({ createdAt: -1 });
    const summary = {
      total: allAssigned.length,
      pending: allAssigned.filter((t) => t.status === 'Pending').length,
      inProgress: allAssigned.filter((t) => t.status === 'In Progress').length,
      completed: allAssigned.filter((t) => t.status === 'Completed').length,
    };

    const conditions = [ownershipFilter];

    if (status && status !== 'All') {
      conditions.push({ status: String(status) });
    }

    if (priority && priority !== 'All') {
      conditions.push({ priority: String(priority) });
    }

    if (project && project !== 'All') {
      if (project === 'independent') {
        conditions.push({ isIndependent: true });
      } else {
        const projRegex = new RegExp(`^${escapeRegex(String(project))}$`, 'i');
        conditions.push({
          $or: [
            { projectCode: projRegex },
            { projectName: new RegExp(escapeRegex(String(project)), 'i') },
            ...(String(project).match(/^[0-9a-fA-F]{24}$/) ? [{ projectId: project }] : []),
          ],
        });
      }
    }

    if (search && String(search).trim()) {
      const qRegex = new RegExp(escapeRegex(String(search).trim()), 'i');
      conditions.push({
        $or: [
          { taskName: qRegex },
          { taskId: qRegex },
          { projectName: qRegex },
        ],
      });
    }

    let tasks = await Task.find({ $and: conditions }).sort({ dueDate: 1, createdAt: -1 });

    // Apply dueDate filter cleanly (supports 'overdue' or YYYY-MM-DD date string)
    if (dueDate && dueDate !== 'All') {
      if (dueDate === 'overdue') {
        tasks = tasks.filter((t) => computeIsOverdue(t));
      } else {
        tasks = tasks.filter((t) => {
          if (!t.dueDate) return false;
          const isoDate = new Date(t.dueDate).toISOString().split('T')[0];
          return isoDate === String(dueDate);
        });
      }
    }

    res.json({
      success: true,
      data: {
        employee: {
          id: String(employee._id),
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          avatar: employee.avatar || '',
        },
        summary,
        tasks: tasks.map((t) => formatTaskForClient(t)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/employee/tasks/:taskId
 * Retrieve complete task details + related project (only if assigned to authenticated employee)
 */
router.get('/:taskId', async (req, res) => {
  try {
    const auth = await resolveAuthenticatedEmployee(req);
    if (auth.errorStatus) {
      return res.status(auth.errorStatus).json({ success: false, message: auth.errorMessage });
    }
    const { employee } = auth;
    const { taskId } = req.params;

    const task = await Task.findOne({
      $or: [
        { taskId: new RegExp(`^${escapeRegex(taskId)}$`, 'i') },
        ...(taskId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: taskId }] : []),
      ],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!doesTaskBelongToEmployee(task, employee)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: this task is not assigned to your employee account',
      });
    }

    const activities = await TaskActivity.find({ taskId: task.taskId }).sort({ timestamp: 1 });

    let relatedProject = null;
    if (!task.isIndependent && (task.projectId || task.projectCode || task.projectName)) {
      const projOr = [];
      if (task.projectId) projOr.push({ _id: task.projectId });
      if (task.projectCode) projOr.push({ projectCode: new RegExp(`^${escapeRegex(task.projectCode)}$`, 'i') });
      if (task.projectName) projOr.push({ name: new RegExp(`^${escapeRegex(task.projectName)}$`, 'i') });
      if (projOr.length > 0) {
        relatedProject = await Project.findOne({ $or: projOr }).select('projectCode name status progress category');
      }
    }

    res.json({
      success: true,
      data: {
        task: formatTaskForClient(task, activities),
        relatedProject,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/employee/tasks/:taskId/activity
 * Retrieve activity timeline for a task owned by the authenticated employee
 */
router.get('/:taskId/activity', async (req, res) => {
  try {
    const auth = await resolveAuthenticatedEmployee(req);
    if (auth.errorStatus) {
      return res.status(auth.errorStatus).json({ success: false, message: auth.errorMessage });
    }
    const { employee } = auth;
    const { taskId } = req.params;

    const task = await Task.findOne({
      $or: [
        { taskId: new RegExp(`^${escapeRegex(taskId)}$`, 'i') },
        ...(taskId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: taskId }] : []),
      ],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!doesTaskBelongToEmployee(task, employee)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: cannot view activity for another employee\'s task',
      });
    }

    const activities = await TaskActivity.find({ taskId: task.taskId }).sort({ timestamp: -1 });
    res.json({
      success: true,
      count: activities.length,
      data: activities.map((a) => ({
        ...a.toObject(),
        id: String(a._id),
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/employee/tasks/:taskId/progress
 * Validate and update status, progress percentage, comment, and optional attachment
 */
router.patch('/:taskId/progress', async (req, res) => {
  try {
    const auth = await resolveAuthenticatedEmployee(req);
    if (auth.errorStatus) {
      return res.status(auth.errorStatus).json({ success: false, message: auth.errorMessage });
    }
    const { employee } = auth;
    const { taskId } = req.params;

    const task = await Task.findOne({
      $or: [
        { taskId: new RegExp(`^${escapeRegex(taskId)}$`, 'i') },
        ...(taskId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: taskId }] : []),
      ],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!doesTaskBelongToEmployee(task, employee)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you cannot update tasks assigned to other employees',
      });
    }

    const { status, progress, comment, attachment } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }

    const numericProgress = Number(progress);
    if (Number.isNaN(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      return res.status(400).json({ success: false, message: 'Progress must be between 0% and 100%' });
    }

    // Strict consistency validation per Section 5 & Section 6
    if (status === 'Pending' && numericProgress !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Pending tasks must have 0% progress.',
      });
    }
    if (status === 'In Progress' && (numericProgress < 1 || numericProgress > 99)) {
      return res.status(400).json({
        success: false,
        message: 'In Progress tasks must have progress between 1% and 99%.',
      });
    }
    if (status === 'Completed' && numericProgress !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Completed tasks must have 100% progress.',
      });
    }

    const prevStatus = task.status;
    const prevProgress = task.progress;

    task.status = status;
    task.progress = Math.round(numericProgress);

    const trimmedComment = typeof comment === 'string' ? comment.trim() : '';
    if (trimmedComment) {
      task.progressNotes = trimmedComment;
    }

    if (attachment && typeof attachment === 'object' && attachment.name) {
      task.attachments = [
        ...(task.attachments || []),
        {
          id: attachment.id || `att-${Date.now()}`,
          name: String(attachment.name),
          size: String(attachment.size || '—'),
          fileType: String(attachment.fileType || 'FILE'),
          uploadedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          uploadedBy: employee.name,
        },
      ];
    }

    const saved = await task.save();

    if (prevStatus !== status) {
      await TaskActivity.create({
        taskId: task.taskId,
        description: `Status updated from ${prevStatus} to ${status}`,
        type: status === 'Completed' ? 'completed' : 'status_changed',
        updatedBy: employee.name,
      });
    }

    if (prevProgress !== Math.round(numericProgress)) {
      await TaskActivity.create({
        taskId: task.taskId,
        description: `Progress updated from ${prevProgress}% to ${Math.round(numericProgress)}%`,
        type: 'progress_updated',
        updatedBy: employee.name,
      });
    }

    if (trimmedComment) {
      await TaskActivity.create({
        taskId: task.taskId,
        description: `Work update: ${trimmedComment}`,
        type: 'edited',
        updatedBy: employee.name,
      });
    }

    if (attachment && attachment.name) {
      await TaskActivity.create({
        taskId: task.taskId,
        description: `Uploaded attachment: ${attachment.name}`,
        type: 'edited',
        updatedBy: employee.name,
      });
    }

    const activities = await TaskActivity.find({ taskId: task.taskId }).sort({ timestamp: 1 });
    res.json({
      success: true,
      message: 'Task progress updated successfully',
      data: formatTaskForClient(saved, activities),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
