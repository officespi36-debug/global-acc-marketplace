const store = require('../services/store');
const AccountListing = require('../models/AccountListing');
const { isConnected } = require('../config/db');

// @desc Get all public approved listings with filters
// @route GET /api/accounts
const getListings = async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      region, 
      search, 
      minPrice, 
      maxPrice, 
      sort = 'newest',
      featured
    } = req.query;

    let items;

    if (isConnected()) {
      const query = { status: 'approved' };
      if (category && category !== 'All') query.category = category;
      if (subcategory) query.subcategory = new RegExp(subcategory, 'i');
      if (region && region !== 'All') query.region = region;
      if (featured === 'true') query.featured = true;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { subcategory: new RegExp(search, 'i') }
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price_asc') sortOptions = { price: 1 };
      if (sort === 'price_desc') sortOptions = { price: -1 };
      if (sort === 'popular') sortOptions = { views: -1 };

      items = await AccountListing.find(query)
        .select('-credentialsVault') // Never leak credentials in public listings
        .sort(sortOptions);
    } else {
      let filtered = store.getListings().filter(l => l.status === 'approved');

      if (category && category !== 'All') {
        filtered = filtered.filter(l => l.category.toLowerCase() === category.toLowerCase());
      }
      if (subcategory) {
        filtered = filtered.filter(l => l.subcategory.toLowerCase().includes(subcategory.toLowerCase()));
      }
      if (region && region !== 'All') {
        filtered = filtered.filter(l => l.region.toLowerCase() === region.toLowerCase());
      }
      if (featured === 'true') {
        filtered = filtered.filter(l => l.featured === true);
      }
      if (minPrice) {
        filtered = filtered.filter(l => l.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(l => l.price <= Number(maxPrice));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(l => 
          l.title.toLowerCase().includes(q) || 
          l.description.toLowerCase().includes(q) ||
          l.subcategory.toLowerCase().includes(q)
        );
      }

      if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'popular') {
        filtered.sort((a, b) => b.views - a.views);
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Strip credentialsVault
      items = filtered.map(l => {
        const { credentialsVault, ...safeItem } = l;
        return safeItem;
      });
    }

    return res.json({
      success: true,
      count: items.length,
      listings: items
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single listing detail by ID
// @route GET /api/accounts/:id
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    let listing;

    if (isConnected()) {
      listing = await AccountListing.findById(id).select('-credentialsVault');
      if (listing) {
        await AccountListing.findByIdAndUpdate(id, { $inc: { views: 1 } });
      }
    } else {
      const found = store.getListings().find(l => l._id.toString() === id.toString());
      if (found) {
        found.views = (found.views || 0) + 1;
        const { credentialsVault, ...safeListing } = found;
        listing = safeListing;
      }
    }

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Account listing not found.' });
    }

    return res.json({
      success: true,
      listing
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create new listing with credentials vault (Seller)
// @route POST /api/accounts
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      price,
      region = 'Global',
      warrantyHours = 48,
      deliveryType = 'instant_auto',
      credentialsVault = {},
      specs = [],
      images = []
    } = req.body;

    if (!title || !description || !category || !subcategory || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, subcategory, and price.'
      });
    }

    if (deliveryType === 'instant_auto' && (!credentialsVault.loginIdentifier || !credentialsVault.password)) {
      return res.status(400).json({
        success: false,
        message: 'For Instant Auto-Delivery, Login Identifier and Password must be stored in the credentials vault.'
      });
    }

    const defaultImg = images && images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'];

    const newListingData = {
      title,
      description,
      category,
      subcategory,
      price: Number(price),
      currency: 'USD',
      region,
      warrantyHours: Number(warrantyHours) || 48,
      deliveryType,
      credentialsVault: {
        loginIdentifier: credentialsVault.loginIdentifier || '',
        password: credentialsVault.password || '',
        backupCodes: credentialsVault.backupCodes || '',
        emailAccess: credentialsVault.emailAccess || '',
        secretInstructions: credentialsVault.secretInstructions || ''
      },
      specs: Array.isArray(specs) ? specs : [],
      images: defaultImg,
      seller: req.user._id,
      sellerSnapshot: {
        name: req.user.name,
        rating: req.user.rating || 5.0,
        reviewCount: req.user.reviewCount || 0
      },
      status: 'approved', // Auto-approved for verified/demo sellers
      featured: false,
      views: 0,
      createdAt: new Date()
    };

    let created;
    if (isConnected()) {
      created = await AccountListing.create(newListingData);
    } else {
      newListingData._id = '66' + Date.now().toString(16).padEnd(22, '0');
      created = store.addListing(newListingData);
    }

    const { credentialsVault: hidden, ...safeResponse } = created.toObject ? created.toObject() : created;

    return res.status(201).json({
      success: true,
      message: 'Account listed successfully with auto-delivery credential vault secured.',
      listing: safeResponse
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get summary statistics of available accounts by category
// @route GET /api/accounts/categories/summary
const getCategoriesSummary = async (req, res) => {
  try {
    const categories = ['Gaming', 'Social Media', 'Streaming', 'Business', 'Email', 'Ecommerce'];
    let allListings;

    if (isConnected()) {
      allListings = await AccountListing.find({ status: 'approved' });
    } else {
      allListings = store.getListings().filter(l => l.status === 'approved');
    }

    const summary = categories.map(cat => {
      const count = allListings.filter(l => l.category.toLowerCase() === cat.toLowerCase()).length;
      return { category: cat, count };
    });

    return res.json({ success: true, summary, total: allListings.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  getCategoriesSummary
};
