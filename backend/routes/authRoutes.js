const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// @route   GET api/auth/test
// @desc    Test route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!', status: 'success' });
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('firstName', 'Le prénom est requis').not().isEmpty(),
    check('lastName', 'Le nom de famille est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('phone', 'Le numéro de téléphone est requis').not().isEmpty(),
    check('password', 'Veuillez entrer un mot de passe avec 6 caractères ou plus').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post(
  '/verify-otp',
  [
    check('userId', 'ID utilisateur requis').not().isEmpty(),
    check('otp', 'Code OTP requis').not().isEmpty()
  ],
  authController.verifyOTP
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Mot de passe requis').exists()
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('nom', 'Le nom est requis').not().isEmpty(),
      check('prenom', 'Le prénom est requis').not().isEmpty(),
      check('telephone', 'Le numéro de téléphone est requis').not().isEmpty()
    ]
  ],
  authController.updateProfile
);

// @route   PUT api/auth/change-password
// @desc    Change password
// @access  Private
router.put(
  '/change-password',
  [
    auth,
    [
      check('currentPassword', 'Le mot de passe actuel est requis').exists(),
      check('newPassword', 'Veuillez entrer un nouveau mot de passe avec 6 caractères ou plus').isLength({ min: 6 })
    ]
  ],
  authController.changePassword
);

module.exports = router;
