const { WorkSession, SessionTask } = require('../models');
const { Op } = require('sequelize');

// @route   POST api/timer/start
// @desc    Start a new work session
// @access  Private
exports.startTimer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { clientId } = req.body;

    // Check if there is already an active session
    const existingSession = await WorkSession.findOne({
      where: { userId, status: { [Op.ne]: 'stopped' } },
    });

    if (existingSession) {
      return res.status(400).json({ message: 'An active session already exists. Stop it before starting a new one.' });
    }

    const newSession = await WorkSession.create({
      userId,
      clientId,
      startTime: new Date(),
      status: 'active',
    });

    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST api/timer/pause
// @desc    Pause the current work session
// @access  Private
exports.pauseTimer = async (req, res) => {
  try {
    const session = await WorkSession.findOne({ where: { userId: req.user.userId, status: 'active' } });
    if (!session) {
      return res.status(404).json({ message: 'No active session found to pause.' });
    }
    session.status = 'paused';
    session.lastPausedTime = new Date();
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST api/timer/resume
// @desc    Resume a paused work session
// @access  Private
exports.resumeTimer = async (req, res) => {
  try {
    const session = await WorkSession.findOne({ where: { userId: req.user.userId, status: 'paused' } });
    if (!session) {
      return res.status(404).json({ message: 'No paused session found to resume.' });
    }

    const pauseDuration = Math.round((new Date() - session.lastPausedTime) / 1000);
    session.totalPausedSeconds += pauseDuration;
    session.lastPausedTime = null;
    session.status = 'active';
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST api/timer/stop
// @desc    Stop the current work session
// @access  Private
exports.stopTimer = async (req, res) => {
  try {
    const { hourlyRate, tags } = req.body;
    const session = await WorkSession.findOne({ where: { userId: req.user.userId, status: { [Op.ne]: 'stopped' } } });

    if (!session) {
      return res.status(404).json({ message: 'No active or paused session found to stop.' });
    }

    // If it was paused, add the last pause duration
    if (session.status === 'paused') {
      const pauseDuration = Math.round((new Date() - session.lastPausedTime) / 1000);
      session.totalPausedSeconds += pauseDuration;
    }

    session.status = 'stopped';
    session.endTime = new Date();
    session.hourlyRate = hourlyRate;
    session.tags = tags;

    // Calculate total earned
    if (hourlyRate) {
      const durationInSeconds = (session.endTime - session.startTime) / 1000;
      const activeDurationInSeconds = durationInSeconds - session.totalPausedSeconds;
      const activeDurationInHours = activeDurationInSeconds / 3600;
      session.totalEarned = activeDurationInHours * hourlyRate;
    }

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/timer/active

// @desc    Get the user's active or paused session
// @access  Private
exports.getActiveSession = async (req, res) => {
  try {
    const session = await WorkSession.findOne({
      where: {
        userId: req.user.userId,
        status: {
          [Op.ne]: 'stopped',
        },
      },
      include: ['tasks'], // Include associated tasks
    });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST api/timer/task
// @desc    Add a task to the active session
// @access  Private
exports.addTask = async (req, res) => {
  try {
    const { description } = req.body;
    const session = await WorkSession.findOne({ where: { userId: req.user.userId, status: { [Op.ne]: 'stopped' } } });

    if (!session) {
      return res.status(404).json({ message: 'No active session found to add a task to.' });
    }

    if (!description) {
      return res.status(400).json({ message: 'Task description is required.' });
    }

    const newTask = await SessionTask.create({
      description,
      workSessionId: session.id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
