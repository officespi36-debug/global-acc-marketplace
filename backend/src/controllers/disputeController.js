const store = require('../services/store');
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { isConnected } = require('../config/db');

// @desc Get all disputes (Admin or involved user)
// @route GET /api/disputes
const getDisputes = async (req, res) => {
  try {
    let list;
    const isAdmin = req.user.role === 'admin';

    if (isConnected()) {
      if (isAdmin) {
        list = await Dispute.find()
          .populate('order')
          .populate('buyer', 'name email')
          .populate('seller', 'name email')
          .sort({ createdAt: -1 });
      } else {
        list = await Dispute.find({
          $or: [{ buyer: req.user._id }, { seller: req.user._id }]
        }).sort({ createdAt: -1 });
      }
    } else {
      if (isAdmin) {
        list = store.getDisputes().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        list = store.getDisputes().filter(d => 
          d.buyer.toString() === req.user._id.toString() || 
          d.seller.toString() === req.user._id.toString()
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    return res.json({ success: true, count: list.length, disputes: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Admin resolves dispute (Refund Buyer OR Payout Seller)
// @route PUT /api/disputes/:id/resolve
const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, adminDecision = 'Standard arbitration decision' } = req.body;
    // resolution: 'refund_buyer' or 'payout_seller'

    if (!['refund_buyer', 'payout_seller'].includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: "resolution must be 'refund_buyer' or 'payout_seller'."
      });
    }

    let dispute;
    let order;

    if (isConnected()) {
      dispute = await Dispute.findById(id);
      if (dispute) order = await Order.findById(dispute.order);
    } else {
      dispute = store.getDisputes().find(d => d._id.toString() === id.toString());
      if (dispute) order = store.getOrders().find(o => o._id.toString() === dispute.order.toString());
    }

    if (!dispute || !order) {
      return res.status(404).json({ success: false, message: 'Dispute or associated order not found.' });
    }

    if (dispute.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This dispute has already been resolved.' });
    }

    const buyerId = dispute.buyer;
    const sellerId = dispute.seller;
    const refundAmount = order.amount;
    const sellerPayout = order.sellerPayoutAmount;

    if (resolution === 'refund_buyer') {
      // Refund money to buyer, remove escrow hold from seller
      if (isConnected()) {
        const buyer = await User.findById(buyerId);
        const seller = await User.findById(sellerId);

        const newBuyerBalance = (buyer.walletBalance || 0) + refundAmount;
        const newSellerHold = Math.max(0, (seller.escrowHoldingBalance || 0) - sellerPayout);

        await User.findByIdAndUpdate(buyerId, { walletBalance: newBuyerBalance });
        await User.findByIdAndUpdate(sellerId, { escrowHoldingBalance: newSellerHold });
        await Order.findByIdAndUpdate(order._id, { escrowStatus: 'disputed', paymentStatus: 'refunded' });
        await Dispute.findByIdAndUpdate(id, {
          status: 'resolved_refund_buyer',
          adminDecision,
          resolvedAt: new Date()
        });

        await Transaction.create({
          user: buyerId,
          orderId: order._id,
          type: 'refund',
          amount: refundAmount,
          balanceAfter: newBuyerBalance,
          status: 'completed',
          note: `Dispute Resolution: Full refund issued for Order #${order.orderNumber}`
        });
      } else {
        const buyer = store.getUsers().find(u => u._id.toString() === buyerId.toString());
        const seller = store.getUsers().find(u => u._id.toString() === sellerId.toString());

        const newBuyerBalance = (buyer ? buyer.walletBalance : 0) + refundAmount;
        const newSellerHold = Math.max(0, ((seller ? seller.escrowHoldingBalance : 0) - sellerPayout));

        store.updateUser(buyerId, { walletBalance: newBuyerBalance });
        store.updateUser(sellerId, { escrowHoldingBalance: newSellerHold });
        store.updateOrder(order._id, { escrowStatus: 'disputed', paymentStatus: 'refunded' });
        store.updateDispute(id, {
          status: 'resolved_refund_buyer',
          adminDecision,
          resolvedAt: new Date()
        });

        store.addTransaction({
          _id: '66' + Date.now().toString(16).padEnd(22, '0'),
          user: buyerId,
          orderId: order._id,
          type: 'refund',
          amount: refundAmount,
          balanceAfter: newBuyerBalance,
          status: 'completed',
          note: `Dispute Resolution: Full refund issued for Order #${order.orderNumber}`,
          createdAt: new Date()
        });
      }
    } else {
      // Payout seller
      if (isConnected()) {
        const seller = await User.findById(sellerId);
        const newHold = Math.max(0, (seller.escrowHoldingBalance || 0) - sellerPayout);
        const newBalance = (seller.walletBalance || 0) + sellerPayout;

        await User.findByIdAndUpdate(sellerId, { escrowHoldingBalance: newHold, walletBalance: newBalance });
        await Order.findByIdAndUpdate(order._id, { escrowStatus: 'released' });
        await Dispute.findByIdAndUpdate(id, {
          status: 'resolved_payout_seller',
          adminDecision,
          resolvedAt: new Date()
        });

        await Transaction.create({
          user: sellerId,
          orderId: order._id,
          type: 'escrow_release',
          amount: sellerPayout,
          balanceAfter: newBalance,
          status: 'completed',
          note: `Dispute Decision: Seller ruled in favor for Order #${order.orderNumber}`
        });
      } else {
        const seller = store.getUsers().find(u => u._id.toString() === sellerId.toString());
        const newHold = Math.max(0, (seller ? seller.escrowHoldingBalance : 0) - sellerPayout);
        const newBalance = (seller ? seller.walletBalance : 0) + sellerPayout;

        store.updateUser(sellerId, { escrowHoldingBalance: newHold, walletBalance: newBalance });
        store.updateOrder(order._id, { escrowStatus: 'released' });
        store.updateDispute(id, {
          status: 'resolved_payout_seller',
          adminDecision,
          resolvedAt: new Date()
        });

        store.addTransaction({
          _id: '66' + Date.now().toString(16).padEnd(22, '0'),
          user: sellerId,
          orderId: order._id,
          type: 'escrow_release',
          amount: sellerPayout,
          balanceAfter: newBalance,
          status: 'completed',
          note: `Dispute Decision: Seller ruled in favor for Order #${order.orderNumber}`,
          createdAt: new Date()
        });
      }
    }

    return res.json({
      success: true,
      message: `Dispute resolved successfully: ${resolution === 'refund_buyer' ? 'Buyer Refunded' : 'Seller Paid'}`,
      resolution
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDisputes,
  resolveDispute
};
