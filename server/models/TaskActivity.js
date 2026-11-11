const mongoose = require('mongoose');

const TaskActivitySchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'created',
        'assigned',
        'started',
        'progress_updated',
        'status_changed',
        'completed',
        'reassigned',
        'edited',
      ],
      default: 'created',
    },
    updatedBy: {
      type: String,
      required: true,
      default: 'Admin',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.TaskActivity ||
  mongoose.model('TaskActivity', TaskActivitySchema);

