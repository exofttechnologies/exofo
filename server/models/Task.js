const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    taskName: {
      type: String,
      required: [true, 'Task Name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedEmployeeName: {
      type: String,
      default: '',
    },
    assignedEmployeeDesignation: {
      type: String,
      default: '',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    projectName: {
      type: String,
      default: '',
    },
    projectCode: {
      type: String,
      default: '',
    },
    isIndependent: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    progressNotes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to check if task is overdue
TaskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'Completed') return false;
  return new Date(this.dueDate) < new Date();
});

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);

