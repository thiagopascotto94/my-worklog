const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-customer', paymentController.createCustomer);
router.post('/create-subscription', paymentController.createSubscription);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
