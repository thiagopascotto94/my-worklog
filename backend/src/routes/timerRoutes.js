const express = require('express');
const router = express.Router();
const timerController = require('../controllers/timerController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

router.post('/start', timerController.startTimer);
router.post('/pause', timerController.pauseTimer);
router.post('/resume', timerController.resumeTimer);
router.post('/stop', timerController.stopTimer);
router.post('/task', timerController.addTask);
router.get('/active', timerController.getActiveSession);

module.exports = router;
