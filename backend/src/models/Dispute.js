const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountListing' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  evidenceDescription: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'resolved_refund_buyer', 'resolved_payout_seller'], 
    default: 'open' 
  },
  adminDecision: { type: String, default: '' },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

disputeSchema.index({ order: 1 });
disputeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.Dispute || mongoose.model('Dispute', disputeSchema);
