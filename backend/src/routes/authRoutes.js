const express = require('express');
const router = express.Router();
const { register, login, demoLogin, getMe, submitKYC } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);
router.post('/kyc', protect, submitKYC);

module.exports = router;
