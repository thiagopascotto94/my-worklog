const { SessionTask, WorkSession } = require('../models');

// @route   POST api/tasks
// @desc    Create a task for a work session
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { workSessionId, title, description, tags, observations, continuedFromTaskId } = req.body;
    const userId = req.user.userId;

    const workSession = await WorkSession.findOne({ where: { id: workSessionId, userId } });
    if (!workSession) {
      return res.status(404).json({ message: 'Work session not found.' });
    }

    const newTask = await SessionTask.create({
      workSessionId,
      title,
      description,
      tags,
      observations,
      status: 'pending',
      continuedFromTaskId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/tasks
// @desc    Get all tasks for a user
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await SessionTask.findAll({
      include: [{
        model: WorkSession,
        as: 'workSession',
        where: { userId },
        attributes: []
      }, 'continuedFromTask']
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/tasks/:id
// @desc    Get a task by id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await SessionTask.findOne({
      where: { id },
      include: [
        {
          model: WorkSession,
          as: 'workSession',
          where: { userId }
        },
        'continuedFromTask'
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// @route   GET api/tasks/session/:workSessionId
// @desc    Get all tasks for a work session
// @access  Private
exports.getTasksForSession = async (req, res) => {
  try {
    const { workSessionId } = req.params;
    const userId = req.user.userId;

    const workSession = await WorkSession.findOne({ where: { id: workSessionId, userId } });
    if (!workSession) {
      return res.status(404).json({ message: 'Work session not found.' });
    }

    const tasks = await SessionTask.findAll({
      where: { workSessionId },
      include: ['continuedFromTask']
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, tags, observations, continuedFromTaskId } = req.body;
    const userId = req.user.userId;

    const task = await SessionTask.findOne({
      where: { id },
      include: [{
        model: WorkSession,
        as: 'workSession',
        where: { userId }
      }]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.tags = tags || task.tags;
    task.observations = observations || task.observations;
    task.continuedFromTaskId = continuedFromTaskId !== undefined ? continuedFromTaskId : task.continuedFromTaskId;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await SessionTask.findOne({
      where: { id },
      include: [{
        model: WorkSession,
        as: 'workSession',
        where: { userId }
      }]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await task.destroy();

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
