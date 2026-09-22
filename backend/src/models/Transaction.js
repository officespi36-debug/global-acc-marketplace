const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  type: { 
    type: String, 
    enum: ['deposit', 'escrow_lock', 'escrow_release', 'commission', 'payout', 'refund', 'withdrawal'], 
    required: true 
  },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
