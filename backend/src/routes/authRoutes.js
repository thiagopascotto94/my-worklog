const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/root/login', authController.rootLogin);
router.post('/send-verification-code', authController.sendVerificationCode);
router.post('/verify-code', authController.verifyCode);

module.exports = router;
