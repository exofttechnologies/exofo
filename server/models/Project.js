const mongoose = require('mongoose');

const AssignedEmployeeSchema = new mongoose.Schema(
  {
    employeeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    id: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    initials: { type: String, default: '' },
    designation: { type: String, default: '' },
    projectRole: { type: String, default: '' },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: [true, 'Project code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'Web Application',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Archived'],
      default: 'In Progress',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    iconName: {
      type: String,
      enum: ['Monitor', 'GraduationCap', 'Smartphone', 'Database', 'Layout'],
      default: 'Layout',
    },
    startDate: {
      type: String,
      default: '',
    },
    expectedCompletionDate: {
      type: String,
      default: '',
    },
    client: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      company: { type: String, default: '' },
    },
    assignedEmployees: {
      type: [AssignedEmployeeSchema],
      default: [],
    },
    features: { type: [mongoose.Schema.Types.Mixed], default: [] },
    phases: { type: [mongoose.Schema.Types.Mixed], default: [] },
    documents: { type: [mongoose.Schema.Types.Mixed], default: [] },
    milestones: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
