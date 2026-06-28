const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'pending'
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'medium'
    },
    category: {
      type: String,
      enum: {
        values: ['work', 'personal', 'urgent', 'learning', 'health', 'others'],
        message: '{VALUE} is not a valid category'
      },
      default: 'work'
    },
    dueDate: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', TaskSchema);
