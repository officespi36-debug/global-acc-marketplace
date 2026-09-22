const jwt = require('jsonwebtoken');
const store = require('../services/store');
const User = require('../models/User');
const { isConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_accglobal_jwt_key_2026_xyz987';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;
    if (isConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      const users = store.getUsers();
      const found = users.find(u => u._id.toString() === decoded.id.toString());
      if (found) {
        // Strip password
        const { password, ...userWithoutPass } = found;
        user = userWithoutPass;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended by an administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
