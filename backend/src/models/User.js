const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  avatar: { type: String, default: '' },
  walletBalance: { type: Number, default: 250 }, // Initial demo balance for easy testing
  escrowHoldingBalance: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  kycDetails: {
    idType: String,
    idNumber: String,
    country: String,
    submittedAt: Date
  },
  isBanned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Performance Indexes
userSchema.index({ role: 1 });
userSchema.index({ kycStatus: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
