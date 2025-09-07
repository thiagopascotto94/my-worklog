const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.get('/approve/:token', reportController.approveReport);

// All subsequent routes are protected
router.use(authMiddleware);

router.post('/generate', reportController.generateReport);
router.get('/', reportController.getReports);
router.get('/:id', reportController.getReportById);
router.post('/:id/send', reportController.sendReport);

module.exports = router;
