const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/public/:token', reportController.getPublicReportByToken);
router.post('/public/:token/status', reportController.updateReportStatus);


// All subsequent routes are protected
router.use(authMiddleware);

router.post('/generate', reportController.generateReport);
router.get('/', reportController.getReports);
router.get('/client/:clientId', reportController.getReportsByClientId);
router.get('/:id', reportController.getReportById);
router.put('/:id', reportController.updateReport);
router.delete('/:id', reportController.deleteReport);
router.post('/:id/share', reportController.shareReport);
router.post('/:id/duplicate', reportController.duplicateReport);

module.exports = router;
