const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: [true, 'Task ID is required'],
      unique: true,
      trim: true,
    },
    taskName: {
      type: String,
      required: [true, 'Task Name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    requirements: {
      type: [String],
      default: [],
    },
    assignedEmployeeId: {
      type: String,
      default: '',
    },
    assignedEmployeeName: {
      type: String,
      default: '',
    },
    assignedEmployeeAvatar: {
      type: String,
      default: '',
    },
    assignedEmployeeDesignation: {
      type: String,
      default: '',
    },
    assignedEmployeeEmail: {
      type: String,
      default: '',
    },
    projectId: {
      type: String,
      default: '',
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
      default: false,
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
      default: 0,
    },
    startDate: {
      type: String,
      default: '',
    },
    dueDate: {
      type: String,
      default: '',
    },
    progressNotes: {
      type: String,
      default: '',
    },
    activityHistory: {
      type: Array,
      default: [],
    },
    attachments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

taskSchema.methods.toClient = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('Task', taskSchema);

