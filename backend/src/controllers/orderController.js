const store = require('../services/store');
const Order = require('../models/Order');
const AccountListing = require('../models/AccountListing');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const { isConnected } = require('../config/db');

// Platform commission rate (5%)
const COMMISSION_PERCENT = Number(process.env.ESCROW_FEE_PERCENT) || 5;

// @desc Buy an account with instant auto-delivery & Escrow locking
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { listingId, paymentMethod = 'wallet' } = req.body;
    const buyerId = req.user._id;

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'listingId is required.' });
    }

    let listing;
    let buyer;
    let seller;

    if (isConnected()) {
      listing = await AccountListing.findById(listingId);
      buyer = await User.findById(buyerId);
    } else {
      listing = store.getListings().find(l => l._id.toString() === listingId.toString());
      buyer = store.getUsers().find(u => u._id.toString() === buyerId.toString());
    }

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Account listing not found.' });
    }

    if (listing.status === 'sold') {
      return res.status(400).json({ success: false, message: 'This account has already been purchased.' });
    }

    if (listing.seller.toString() === buyerId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot purchase your own account listing.' });
    }

    const sellerId = listing.seller;
    if (isConnected()) {
      seller = await User.findById(sellerId);
    } else {
      seller = store.getUsers().find(u => u._id.toString() === sellerId.toString());
    }

    const amount = listing.price;
    const feeAmount = Number(((amount * COMMISSION_PERCENT) / 100).toFixed(2));
    const sellerPayoutAmount = Number((amount - feeAmount).toFixed(2));

    // Wallet balance check if wallet payment
    if (paymentMethod === 'wallet') {
      if (buyer.walletBalance < amount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. You have $${buyer.walletBalance.toFixed(2)} USD, but total is $${amount.toFixed(2)} USD. Please deposit funds or choose another payment method.`
        });
      }

      // Deduct from buyer wallet
      const newBuyerBalance = buyer.walletBalance - amount;
      if (isConnected()) {
        await User.findByIdAndUpdate(buyerId, { walletBalance: newBuyerBalance });
      } else {
        store.updateUser(buyerId, { walletBalance: newBuyerBalance });
      }
    }

    // Escrow Engine: Auto-lock funds into seller's escrow holding balance
    const newSellerEscrow = (seller ? (seller.escrowHoldingBalance || 0) : 0) + sellerPayoutAmount;
    if (isConnected() && seller) {
      await User.findByIdAndUpdate(sellerId, { escrowHoldingBalance: newSellerEscrow });
    } else if (seller) {
      store.updateUser(sellerId, { escrowHoldingBalance: newSellerEscrow });
    }

    const orderNumber = `ACC-${Math.floor(10000 + Math.random() * 90000)}-${Date.now().toString().slice(-4)}`;
    const warrantyHours = listing.warrantyHours || 48;
    const warrantyExpiresAt = new Date(Date.now() + warrantyHours * 3600 * 1000);

    const orderData = {
      orderNumber,
      listing: listing._id,
      listingTitle: listing.title,
      listingCategory: listing.category,
      buyer: buyerId,
      seller: sellerId,
      amount,
      feeAmount,
      sellerPayoutAmount,
      currency: 'USD',
      paymentMethod,
      paymentStatus: 'paid',
      escrowStatus: 'holding', // In escrow holding until confirmed or warranty expires
      deliveredCredentials: {
        loginIdentifier: listing.credentialsVault ? listing.credentialsVault.loginIdentifier : 'DeliveredViaChat',
        password: listing.credentialsVault ? listing.credentialsVault.password : 'DeliveredViaChat',
        backupCodes: listing.credentialsVault ? listing.credentialsVault.backupCodes : '',
        emailAccess: listing.credentialsVault ? listing.credentialsVault.emailAccess : '',
        secretInstructions: listing.credentialsVault ? listing.credentialsVault.secretInstructions : 'Please change password immediately.'
      },
      warrantyExpiresAt,
      createdAt: new Date()
    };

    let newOrder;
    if (isConnected()) {
      newOrder = await Order.create(orderData);
      // Mark listing as sold
      await AccountListing.findByIdAndUpdate(listing._id, { status: 'sold' });

      // Transaction log
      await Transaction.create({
        user: buyerId,
        orderId: newOrder._id,
        type: 'escrow_lock',
        amount: -amount,
        balanceAfter: paymentMethod === 'wallet' ? (buyer.walletBalance - amount) : buyer.walletBalance,
        status: 'completed',
        note: `Escrow payment locked for Order #${orderNumber} (${paymentMethod.toUpperCase()})`
      });
    } else {
      orderData._id = '66' + Date.now().toString(16).padEnd(22, '0');
      newOrder = store.addOrder(orderData);
      store.updateListing(listing._id, { status: 'sold' });

      store.addTransaction({
        _id: '66' + (Date.now() + 1).toString(16).padEnd(22, '0'),
        user: buyerId,
        orderId: orderData._id,
        type: 'escrow_lock',
        amount: -amount,
        balanceAfter: paymentMethod === 'wallet' ? (buyer.walletBalance - amount) : buyer.walletBalance,
        status: 'completed',
        note: `Escrow payment locked for Order #${orderNumber} (${paymentMethod.toUpperCase()})`,
        createdAt: new Date()
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Payment verified! Escrow holds funds safely. Credentials unlocked in your vault.',
      order: newOrder
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get orders for current buyer
// @route GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user._id;
    let list;

    if (isConnected()) {
      list = await Order.find({ buyer: buyerId }).sort({ createdAt: -1 });
    } else {
      list = store.getOrders()
        .filter(o => o.buyer.toString() === buyerId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({ success: true, count: list.length, orders: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get sales for current seller
// @route GET /api/orders/seller-sales
const getSellerSales = async (req, res) => {
  try {
    const sellerId = req.user._id;
    let list;

    if (isConnected()) {
      list = await Order.find({ seller: sellerId })
        .select('-deliveredCredentials') // Don't need to re-expose credentials
        .sort({ createdAt: -1 });
    } else {
      list = store.getOrders()
        .filter(o => o.seller.toString() === sellerId.toString())
        .map(o => {
          const { deliveredCredentials, ...safeO } = o;
          return safeO;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({ success: true, count: list.length, orders: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Buyer confirms account delivery and releases escrow funds to seller
// @route PUT /api/orders/:id/confirm
const confirmReceiptAndReleaseEscrow = async (req, res) => {
  try {
    const orderId = req.params.id;
    const buyerId = req.user._id;

    let order;
    if (isConnected()) {
      order = await Order.findById(orderId);
    } else {
      order = store.getOrders().find(o => o._id.toString() === orderId.toString());
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.buyer.toString() !== buyerId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer of this order can confirm receipt.' });
    }

    if (order.escrowStatus === 'released') {
      return res.status(400).json({ success: false, message: 'Escrow has already been released for this order.' });
    }

    if (order.escrowStatus === 'disputed') {
      return res.status(400).json({ success: false, message: 'This order is currently locked under active dispute review.' });
    }

    const sellerId = order.seller;
    const payout = order.sellerPayoutAmount;

    // Release funds to seller wallet
    let seller;
    if (isConnected()) {
      seller = await User.findById(sellerId);
      const newHolding = Math.max(0, (seller.escrowHoldingBalance || 0) - payout);
      const newBalance = (seller.walletBalance || 0) + payout;

      await User.findByIdAndUpdate(sellerId, {
        escrowHoldingBalance: newHolding,
        walletBalance: newBalance
      });

      await Order.findByIdAndUpdate(orderId, {
        escrowStatus: 'released',
        buyerConfirmedAt: new Date()
      });

      await Transaction.create({
        user: sellerId,
        orderId: order._id,
        type: 'escrow_release',
        amount: payout,
        balanceAfter: newBalance,
        status: 'completed',
        note: `Escrow release payout for Order #${order.orderNumber}`
      });
    } else {
      seller = store.getUsers().find(u => u._id.toString() === sellerId.toString());
      if (seller) {
        const newHolding = Math.max(0, (seller.escrowHoldingBalance || 0) - payout);
        const newBalance = (seller.walletBalance || 0) + payout;
        store.updateUser(sellerId, {
          escrowHoldingBalance: newHolding,
          walletBalance: newBalance
        });
      }

      store.updateOrder(orderId, {
        escrowStatus: 'released',
        buyerConfirmedAt: new Date()
      });

      store.addTransaction({
        _id: '66' + Date.now().toString(16).padEnd(22, '0'),
        user: sellerId,
        orderId: order._id,
        type: 'escrow_release',
        amount: payout,
        balanceAfter: (seller ? seller.walletBalance : 0) + payout,
        status: 'completed',
        note: `Escrow release payout for Order #${order.orderNumber}`,
        createdAt: new Date()
      });
    }

    return res.json({
      success: true,
      message: 'Escrow released! $ ' + payout.toFixed(2) + ' has been transferred to seller wallet.',
      orderId,
      escrowStatus: 'released'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Report issue and raise dispute
// @route POST /api/orders/:id/dispute
const reportOrderIssue = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason, evidenceDescription } = req.body;
    const buyerId = req.user._id;

    if (!reason || !evidenceDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reason and evidence description for the dispute.'
      });
    }

    let order;
    if (isConnected()) {
      order = await Order.findById(orderId);
    } else {
      order = store.getOrders().find(o => o._id.toString() === orderId.toString());
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.buyer.toString() !== buyerId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can report an issue with this order.' });
    }

    if (order.escrowStatus === 'released') {
      return res.status(400).json({
        success: false,
        message: 'Escrow has already been completed and released for this order. Please contact support.'
      });
    }

    const disputeData = {
      order: order._id,
      listing: order.listing,
      buyer: buyerId,
      seller: order.seller,
      reason,
      evidenceDescription,
      status: 'open',
      createdAt: new Date()
    };

    let newDispute;
    if (isConnected()) {
      newDispute = await Dispute.create(disputeData);
      await Order.findByIdAndUpdate(orderId, {
        escrowStatus: 'disputed',
        disputeReason: reason
      });
    } else {
      disputeData._id = '66' + Date.now().toString(16).padEnd(22, '0');
      newDispute = store.addDispute(disputeData);
      store.updateOrder(orderId, {
        escrowStatus: 'disputed',
        disputeReason: reason
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Dispute opened. Escrow funds locked. AccGlobal arbitration team is notified.',
      dispute: newDispute
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerSales,
  confirmReceiptAndReleaseEscrow,
  reportOrderIssue
};
