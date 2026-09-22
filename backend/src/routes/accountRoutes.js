const express = require('express');
const router = express.Router();
const { 
  getListings, 
  getListingById, 
  createListing, 
  getCategoriesSummary 
} = require('../controllers/accountController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getListings);
router.get('/categories/summary', getCategoriesSummary);
router.get('/:id', getListingById);
router.post('/', protect, authorize('seller', 'admin'), createListing);

module.exports = router;
