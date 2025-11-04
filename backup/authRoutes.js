const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Routes publiques
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

// Routes protégées
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
