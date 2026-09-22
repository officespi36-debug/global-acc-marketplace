const store = require('../services/store');
const User = require('../models/User');
const AccountListing = require('../models/AccountListing');
const Order = require('../models/Order');
const Dispute = require('../models/Dispute');
const { isConnected } = require('../config/db');

// @desc Get overview platform analytics
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    let totalUsers = 0;
    let totalListings = 0;
    let pendingListings = 0;
    let totalOrders = 0;
    let grossVolume = 0;
    let platformFees = 0;
    let openDisputes = 0;

    if (isConnected()) {
      totalUsers = await User.countDocuments();
      totalListings = await AccountListing.countDocuments({ status: 'approved' });
      pendingListings = await AccountListing.countDocuments({ status: 'pending_approval' });
      const orders = await Order.find({ paymentStatus: 'paid' });
      totalOrders = orders.length;
      grossVolume = orders.reduce((sum, o) => sum + o.amount, 0);
      platformFees = orders.reduce((sum, o) => sum + (o.feeAmount || 0), 0);
      openDisputes = await Dispute.countDocuments({ status: 'open' });
    } else {
      totalUsers = store.getUsers().length;
      totalListings = store.getListings().filter(l => l.status === 'approved').length;
      pendingListings = store.getListings().filter(l => l.status === 'pending_approval').length;
      const orders = store.getOrders().filter(o => o.paymentStatus === 'paid');
      totalOrders = orders.length;
      grossVolume = orders.reduce((sum, o) => sum + o.amount, 0);
      platformFees = orders.reduce((sum, o) => sum + (o.feeAmount || 0), 0);
      openDisputes = store.getDisputes().filter(d => d.status === 'open').length;
    }

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        pendingListings,
        totalOrders,
        grossVolume: Number(grossVolume.toFixed(2)),
        platformFees: Number(platformFees.toFixed(2)),
        openDisputes
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get all pending approval listings
// @route GET /api/admin/pending-listings
const getPendingListings = async (req, res) => {
  try {
    let list;
    if (isConnected()) {
      list = await AccountListing.find({ status: 'pending_approval' }).sort({ createdAt: -1 });
    } else {
      list = store.getListings().filter(l => l.status === 'pending_approval');
    }
    return res.json({ success: true, count: list.length, listings: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Approve or reject listing
// @route PUT /api/admin/listings/:id/status
const approveOrRejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'approved' or 'rejected'." });
    }

    let updated;
    if (isConnected()) {
      updated = await AccountListing.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      updated = store.updateListing(id, { status });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    return res.json({
      success: true,
      message: `Listing status updated to ${status}.`,
      listing: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get all platform users
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    let list;
    if (isConnected()) {
      list = await User.find().select('-password').sort({ createdAt: -1 });
    } else {
      list = store.getUsers().map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
    }
    return res.json({ success: true, count: list.length, users: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Suspend or activate a user
// @route PUT /api/admin/users/:id/ban
const toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    let user;

    if (isConnected()) {
      user = await User.findById(id);
      if (user) {
        user.isBanned = !user.isBanned;
        await user.save();
      }
    } else {
      user = store.getUsers().find(u => u._id.toString() === id.toString());
      if (user) {
        user.isBanned = !user.isBanned;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: `User is now ${user.isBanned ? 'Suspended / Banned' : 'Active'}.`,
      isBanned: user.isBanned
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Verify or reject seller KYC
// @route PUT /api/admin/users/:id/kyc
const toggleVerifyKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { kycStatus } = req.body; // 'verified', 'unverified', 'pending'

    let user;
    if (isConnected()) {
      user = await User.findByIdAndUpdate(id, { kycStatus }, { new: true });
    } else {
      user = store.updateUser(id, { kycStatus });
    }

    return res.json({
      success: true,
      message: `KYC status updated to ${kycStatus}.`,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStats,
  getPendingListings,
  approveOrRejectListing,
  getUsers,
  toggleBanUser,
  toggleVerifyKYC
};
