const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AccountListing', 
    required: true 
  },
  listingTitle: { type: String, required: true },
  listingCategory: { type: String, required: true },
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { type: Number, required: true },
  feeAmount: { type: Number, required: true }, // e.g. 5% platform escrow commission
  sellerPayoutAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { 
    type: String, 
    enum: ['wallet', 'crypto_usdt', 'stripe_card', 'paypal', 'aba_khqr'], 
    default: 'wallet' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'paid' 
  },
  // Escrow Engine Status
  escrowStatus: { 
    type: String, 
    enum: ['holding', 'released', 'disputed'], 
    default: 'holding' 
  },
  // Delivered Credentials revealed to the buyer
  deliveredCredentials: {
    loginIdentifier: String,
    password: String,
    backupCodes: String,
    emailAccess: String,
    secretInstructions: String
  },
  warrantyExpiresAt: { type: Date },
  buyerConfirmedAt: { type: Date },
  disputeReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Performance & Escrow Audit Indexes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ escrowStatus: 1 });
orderSchema.index({ listing: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
