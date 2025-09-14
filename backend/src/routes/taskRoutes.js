const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/tasks
// @desc    Create a task for a work session
// @access  Private
router.post('/', authMiddleware, taskController.createTask);

// @route   GET api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get('/', authMiddleware, taskController.getAllTasks);

// @route   GET api/tasks/session/:workSessionId
// @desc    Get all tasks for a work session
// @access  Private
router.get('/session/:workSessionId', authMiddleware, taskController.getTasksForSession);

// @route   GET api/tasks/:id
// @desc    Get a task by id
// @access  Private
router.get('/:id', authMiddleware, taskController.getTaskById);

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', authMiddleware, taskController.updateTask);

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;
