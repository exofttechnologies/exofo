const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Archived'],
      default: 'In Progress',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    progress: {
      type: Number,
      default: 0,
    },
    iconName: {
      type: String,
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
    features: {
      type: Array,
      default: [],
    },
    assignedEmployees: {
      type: Array,
      default: [],
    },
    phases: {
      type: Array,
      default: [],
    },
    documents: {
      type: Array,
      default: [],
    },
    credentials: {
      type: Array,
      default: [],
    },
    invoices: {
      type: Array,
      default: [],
    },
    budget: {
      type: String,
      default: '',
    },
    spent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

projectSchema.methods.toClient = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('Project', projectSchema);

