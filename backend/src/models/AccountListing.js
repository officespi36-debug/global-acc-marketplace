const mongoose = require('mongoose');

const accountListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Gaming', 'Social Media', 'Streaming', 'Business', 'Email', 'Ecommerce'] 
  },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'USD' },
  region: { type: String, default: 'Global' },
  warrantyHours: { type: Number, default: 48 }, // 48 hours warranty
  deliveryType: { 
    type: String, 
    enum: ['instant_auto', 'manual_transfer'], 
    default: 'instant_auto' 
  },
  // Encrypted / secured in credentials vault until purchased and locked in escrow
  credentialsVault: {
    loginIdentifier: { type: String, default: '' },
    password: { type: String, default: '' },
    backupCodes: { type: String, default: '' },
    emailAccess: { type: String, default: '' },
    secretInstructions: { type: String, default: '' }
  },
  specs: [{ key: String, value: String }],
  images: [{ type: String }],
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sellerSnapshot: {
    name: String,
    rating: Number,
    reviewCount: Number
  },
  status: { 
    type: String, 
    enum: ['pending_approval', 'approved', 'sold', 'rejected'], 
    default: 'approved' 
  },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Performance & Text Search Indexes
accountListingSchema.index({ title: 'text', description: 'text', subcategory: 'text' });
accountListingSchema.index({ category: 1, status: 1, price: 1 });
accountListingSchema.index({ region: 1, status: 1 });
accountListingSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.models.AccountListing || mongoose.model('AccountListing', accountListingSchema);
