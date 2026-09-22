const store = require('../services/store');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { isConnected } = require('../config/db');

// @desc Get current user wallet details and transaction history
// @route GET /api/wallet
const getWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    let user;
    let transactions;

    if (isConnected()) {
      user = await User.findById(userId);
      transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    } else {
      user = store.getUsers().find(u => u._id.toString() === userId.toString());
      transactions = store.getTransactions()
        .filter(t => t.user.toString() === userId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({
      success: true,
      wallet: {
        balance: user ? (user.walletBalance || 0) : 0,
        escrowHolding: user ? (user.escrowHoldingBalance || 0) : 0,
        currency: 'USD',
        transactions
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Deposit funds into wallet (Crypto USDT, Stripe Card, PayPal, ABA KHQR)
// @route POST /api/wallet/deposit
const depositFunds = async (req, res) => {
  try {
    const { amount, method = 'crypto_usdt', reference = '' } = req.body;
    const userId = req.user._id;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid deposit amount.' });
    }

    let user;
    let newBalance;

    if (isConnected()) {
      user = await User.findById(userId);
      newBalance = (user.walletBalance || 0) + numAmount;
      await User.findByIdAndUpdate(userId, { walletBalance: newBalance });

      await Transaction.create({
        user: userId,
        type: 'deposit',
        amount: numAmount,
        balanceAfter: newBalance,
        status: 'completed',
        note: `Wallet top-up via ${method.toUpperCase()} ${reference ? `(Ref: ${reference})` : ''}`
      });
    } else {
      user = store.getUsers().find(u => u._id.toString() === userId.toString());
      newBalance = (user ? user.walletBalance : 0) + numAmount;
      store.updateUser(userId, { walletBalance: newBalance });

      store.addTransaction({
        _id: '66' + Date.now().toString(16).padEnd(22, '0'),
        user: userId,
        type: 'deposit',
        amount: numAmount,
        balanceAfter: newBalance,
        status: 'completed',
        note: `Wallet top-up via ${method.toUpperCase()} ${reference ? `(Ref: ${reference})` : ''}`,
        createdAt: new Date()
      });
    }

    return res.json({
      success: true,
      message: `Successfully deposited $${numAmount.toFixed(2)} USD into your wallet!`,
      newBalance
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Request withdrawal of available balance
// @route POST /api/wallet/withdraw
const withdrawFunds = async (req, res) => {
  try {
    const { amount, payoutAddress, method = 'usdt_trc20' } = req.body;
    const userId = req.user._id;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify a valid withdrawal amount.' });
    }

    if (!payoutAddress) {
      return res.status(400).json({ success: false, message: 'Payout address / account is required.' });
    }

    let user;
    if (isConnected()) {
      user = await User.findById(userId);
    } else {
      user = store.getUsers().find(u => u._id.toString() === userId.toString());
    }

    if ((user.walletBalance || 0) < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient available funds. Your current balance is $${(user.walletBalance || 0).toFixed(2)} USD.`
      });
    }

    const newBalance = user.walletBalance - numAmount;

    if (isConnected()) {
      await User.findByIdAndUpdate(userId, { walletBalance: newBalance });
      await Transaction.create({
        user: userId,
        type: 'withdrawal',
        amount: -numAmount,
        balanceAfter: newBalance,
        status: 'completed',
        note: `Withdrawal of $${numAmount.toFixed(2)} to ${method.toUpperCase()} (${payoutAddress})`
      });
    } else {
      store.updateUser(userId, { walletBalance: newBalance });
      store.addTransaction({
        _id: '66' + Date.now().toString(16).padEnd(22, '0'),
        user: userId,
        type: 'withdrawal',
        amount: -numAmount,
        balanceAfter: newBalance,
        status: 'completed',
        note: `Withdrawal of $${numAmount.toFixed(2)} to ${method.toUpperCase()} (${payoutAddress})`,
        createdAt: new Date()
      });
    }

    return res.json({
      success: true,
      message: `Withdrawal request for $${numAmount.toFixed(2)} USD processed successfully!`,
      newBalance
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getWallet,
  depositFunds,
  withdrawFunds
};
