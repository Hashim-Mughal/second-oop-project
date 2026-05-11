// =============================================================
// BEFORE REFACTORING — taskRoutes.js
//
// VIOLATIONS:
// [S] Route handler = validator + DB access + business rule + response
// [O] Adding email notification on task completion = editing this file
// [D] Directly depends on Task and User mongoose models
// No Factory: task object constructed inline, defaults duplicated
// No Observer: no event emitted on status change
// No logging
// =============================================================

const express  = require('express');
const Task     = require('../models/Task');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// CREATE TASK — construction inline, no Factory
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    // If assignedTo is provided, verify user exists — business logic in route
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }

    // Object construction inline — hardcoded defaults scattered here and in schema
    const task = new Task({
      title,
      description:  description || '',
      status:       status || 'pending',     // default duplicated from schema
      priority:     priority || 'medium',    // default duplicated from schema
      dueDate:      dueDate || null,
      assignedTo:   assignedTo || null,
      createdBy:    req.user.id,
      createdAt:    new Date(),
      updatedAt:    new Date()
    });
    await task.save();

    // No event emitted — no logging, no notification
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL TASKS — filtering logic mixed into route
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;

    // Build filter object inline — if filter logic grows, this grows too
    const filter = { createdBy: req.user.id };
    if (status)     filter.status = status;
    if (priority)   filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET TASK STATS — must be BEFORE /:id or Express treats 'stats' as an id param
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const [pending, inProgress, done, high] = await Promise.all([
      Task.countDocuments({ createdBy: req.user.id, status: 'pending' }),
      Task.countDocuments({ createdBy: req.user.id, status: 'in-progress' }),
      Task.countDocuments({ createdBy: req.user.id, status: 'done' }),
      Task.countDocuments({ createdBy: req.user.id, priority: 'high' }),
    ]);
    res.status(200).json({ pending, inProgress, done, highPriority: high, total: pending + inProgress + done });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET SINGLE TASK
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Ownership check inline — not reusable
    if (task.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE TASK — status change notification should be an event, but isn't
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // Detect status change — should trigger an event/notification, but we can't
    // without coupling directly to a notifier here (Open/Closed violation)
    if (status && status !== task.status && status === 'done') {
      // If we wanted to send an email here, we'd have to import a mailer directly
      // into this route file — tight coupling, impossible to swap implementations
      console.log(`Task ${task._id} marked as done by ${req.user.id}`); // naive logging
    }

    task.title       = title       || task.title;
    task.description = description || task.description;
    task.status      = status      || task.status;
    task.priority    = priority    || task.priority;
    task.dueDate     = dueDate     || task.dueDate;
    task.assignedTo  = assignedTo  || task.assignedTo;
    task.updatedAt   = new Date();

    await task.save();
    res.status(200).json({ message: 'Task updated', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE TASK
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
