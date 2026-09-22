const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getSellerSales, 
  confirmReceiptAndReleaseEscrow, 
  reportOrderIssue 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/seller-sales', protect, authorize('seller', 'admin'), getSellerSales);
router.put('/:id/confirm', protect, confirmReceiptAndReleaseEscrow);
router.post('/:id/dispute', protect, reportOrderIssue);

module.exports = router;
