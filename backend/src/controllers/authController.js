const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../services/store');
const User = require('../models/User');
const { isConnected } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register a new user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const safeRole = ['seller', 'buyer'].includes(role) ? role : 'buyer';
    const normalizedEmail = email.toLowerCase().trim();

    if (isConnected()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: safeRole,
        walletBalance: 250.00
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
          escrowHoldingBalance: user.escrowHoldingBalance,
          rating: user.rating,
          kycStatus: user.kycStatus
        }
      });
    } else {
      const users = store.getUsers();
      if (users.find(u => u.email === normalizedEmail)) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: '66' + Date.now().toString(16).padEnd(22, '0'),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: safeRole,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        walletBalance: 250.00,
        escrowHoldingBalance: 0,
        rating: 5.0,
        reviewCount: 0,
        kycStatus: 'unverified',
        isBanned: false,
        createdAt: new Date()
      };

      store.addUser(newUser);
      const token = generateToken(newUser._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          walletBalance: newUser.walletBalance,
          escrowHoldingBalance: newUser.escrowHoldingBalance,
          rating: newUser.rating,
          kycStatus: newUser.kycStatus
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user;

    if (isConnected()) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = store.getUsers().find(u => u.email === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        escrowHoldingBalance: user.escrowHoldingBalance,
        rating: user.rating,
        reviewCount: user.reviewCount,
        kycStatus: user.kycStatus
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc 1-Click Quick Demo Login Switcher (Admin, Seller, Buyer)
// @route POST /api/auth/demo-login
const demoLogin = async (req, res) => {
  try {
    const { role } = req.body; // 'admin', 'seller', 'buyer'
    const targetRole = ['admin', 'seller', 'buyer'].includes(role) ? role : 'buyer';

    let user;
    if (isConnected()) {
      user = await User.findOne({ role: targetRole });
    } else {
      user = store.getUsers().find(u => u.role === targetRole);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user with role ${targetRole} not found.` });
    }

    const token = generateToken(user._id);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        escrowHoldingBalance: user.escrowHoldingBalance,
        rating: user.rating,
        reviewCount: user.reviewCount,
        kycStatus: user.kycStatus
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

// @desc Submit KYC Verification
// @route POST /api/auth/kyc
const submitKYC = async (req, res) => {
  try {
    const { idType, idNumber, country } = req.body;
    const updates = {
      kycStatus: 'verified', // Auto verify in sandbox for smooth user testing
      kycDetails: {
        idType: idType || 'Passport / National ID',
        idNumber: idNumber || 'DOC-998213',
        country: country || 'Global',
        submittedAt: new Date()
      }
    };

    if (isConnected()) {
      await User.findByIdAndUpdate(req.user._id, updates);
    } else {
      store.updateUser(req.user._id, updates);
    }

    return res.json({
      success: true,
      message: 'KYC documents verified successfully! Seller status upgraded.',
      kycStatus: 'verified'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe,
  submitKYC
};
