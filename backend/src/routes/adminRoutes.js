const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getPendingListings, 
  approveOrRejectListing, 
  getUsers, 
  toggleBanUser, 
  toggleVerifyKYC 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/pending-listings', getPendingListings);
router.put('/listings/:id/status', approveOrRejectListing);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/kyc', toggleVerifyKYC);

module.exports = router;
