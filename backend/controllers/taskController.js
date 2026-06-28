const Task = require('../models/Task');

// @desc    Get all tasks with filtering, search, and sorting
// @route   GET /api/tasks
// @access  Public
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, search, sortBy, order } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort options
    let sortOptions = {};
    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      sortOptions[sortBy] = sortOrder;
    } else {
      sortOptions.createdAt = -1; // Default: newest first
    }
    
    const tasks = await Task.find(query).sort(sortOptions);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving tasks', error: error.message });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found (Invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error retrieving task', error: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    // Simple manual body validation validation fallback
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: { title: 'Title is required and must be at least 3 characters long' } 
      });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'pending',
      priority: priority || 'medium',
      category: category || 'work',
      dueDate: dueDate || null
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;
    
    // Find task
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Manual title validation if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: { title: 'Title must be at least 3 characters long' } 
      });
    }

    // Update fields if provided
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    
    // Handle clearing or setting due date
    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found (Invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error updating task', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found (Invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error deleting task', error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
