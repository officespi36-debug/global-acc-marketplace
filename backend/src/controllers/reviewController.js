const store = require('../services/store');
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const { isConnected } = require('../config/db');

// @desc Add a review for a completed order
// @route POST /api/reviews
const addReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const buyerId = req.user._id;

    if (!orderId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'orderId, rating (1-5), and comment are required.' });
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
      return res.status(403).json({ success: false, message: 'Only the buyer can review this order.' });
    }

    const reviewData = {
      order: order._id,
      listing: order.listing,
      seller: order.seller,
      buyer: buyerId,
      buyerName: req.user.name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
      createdAt: new Date()
    };

    let newReview;
    if (isConnected()) {
      newReview = await Review.create(reviewData);
      // Update seller rating stats
      const allSellerReviews = await Review.find({ seller: order.seller });
      const avg = allSellerReviews.reduce((acc, curr) => acc + curr.rating, 0) / allSellerReviews.length;
      await User.findByIdAndUpdate(order.seller, {
        rating: Number(avg.toFixed(2)),
        reviewCount: allSellerReviews.length
      });
    } else {
      reviewData._id = '66' + Date.now().toString(16).padEnd(22, '0');
      newReview = store.addReview(reviewData);
      const allSellerReviews = store.getReviews().filter(r => r.seller.toString() === order.seller.toString());
      const avg = allSellerReviews.reduce((acc, curr) => acc + curr.rating, 0) / allSellerReviews.length;
      store.updateUser(order.seller, {
        rating: Number(avg.toFixed(2)),
        reviewCount: allSellerReviews.length
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Review posted successfully. Thank you for your feedback!',
      review: newReview
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get reviews for a listing or seller
// @route GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const { listingId, sellerId } = req.query;
    let list;

    if (isConnected()) {
      const query = {};
      if (listingId) query.listing = listingId;
      if (sellerId) query.seller = sellerId;
      list = await Review.find(query).sort({ createdAt: -1 });
    } else {
      list = store.getReviews().filter(r => {
        if (listingId && r.listing && r.listing.toString() !== listingId.toString()) return false;
        if (sellerId && r.seller && r.seller.toString() !== sellerId.toString()) return false;
        return true;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({ success: true, count: list.length, reviews: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addReview,
  getReviews
};
