const express = require('express');
const router = express.Router();
const { getDisputes, resolveDispute } = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getDisputes);
router.put('/:id/resolve', protect, authorize('admin'), resolveDispute);

module.exports = router;
