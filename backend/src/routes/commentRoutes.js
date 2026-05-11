// =============================================================
// BEFORE REFACTORING — commentRoutes.js
//
// VIOLATIONS:
// [S] Validation + DB access + ownership logic + response in route
// [D] Directly coupled to Comment and Task mongoose models
// No Factory, no Observer, no abstraction
// =============================================================

const express  = require('express');
const Comment  = require('../models/Comment');
const Task     = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // mergeParams for /tasks/:taskId/comments

// ADD COMMENT TO TASK
router.post('/', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });

    // Verify task exists — raw DB call in route
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Object creation inline — no Factory
    const comment = new Comment({
      text,
      task:   req.params.taskId,
      author: req.user.id,
      createdAt: new Date()
    });
    await comment.save();

    const populated = await comment.populate('author', 'name email');
    res.status(201).json({ message: 'Comment added', comment: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL COMMENTS FOR A TASK
router.get('/', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE COMMENT
router.put('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Ownership check inline — duplicated pattern (same in taskRoutes)
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.text = req.body.text || comment.text;
    await comment.save();

    res.status(200).json({ message: 'Comment updated', comment });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE COMMENT
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
