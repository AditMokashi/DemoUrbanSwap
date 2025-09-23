const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateListing } = require('../middleware/validation');
const upload = require('../middleware/upload');
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getUserListings,
  getFeaturedListings
} = require('../controllers/listingController');

// Public routes
router.get('/', optionalAuth, getListings);
router.get('/featured', getFeaturedListings);
router.get('/:id', optionalAuth, getListing);

// Protected routes
router.post('/', authenticateToken, upload.single('image'), validateListing, createListing);
router.put('/:id', authenticateToken, upload.single('image'), updateListing);
router.delete('/:id', authenticateToken, deleteListing);
router.get('/user/my-listings', authenticateToken, getUserListings);

module.exports = router;