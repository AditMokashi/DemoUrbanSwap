const Listing = require('../models/Listing');
const User = require('../models/User');

const createListing = async (req, res) => {
  try {
    const { title, description, category, location, price, swap_preferences } = req.body;
    const userId = req.user.id;
    
    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/images/uploads/${req.file.filename}`;
    }

    const listing = await Listing.create({
      user_id: userId,
      title,
      description,
      category,
      location,
      price,
      swap_preferences,
      image_url,
      status: 'active'
    });

    // Award points for creating a listing
    const currentUser = await User.findById(userId);
    await User.updatePoints(userId, (currentUser.points || 0) + 20);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: {
        listing
      }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message
    });
  }
};

const getListings = async (req, res) => {
  try {
    const { category, location, search, page = 1, limit = 12 } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (search) filters.search = search;

    const listings = await Listing.findAll(filters);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: listings.length
        }
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get listings',
      error: error.message
    });
  }
};

const getListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: {
        listing
      }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get listing',
      error: error.message
    });
  }
};

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Handle image upload
    if (req.file) {
      updates.image_url = `/images/uploads/${req.file.filename}`;
    }

    const listing = await Listing.update(id, updates, userId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: {
        listing
      }
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update listing',
      error: error.message
    });
  }
};

const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await Listing.delete(id, userId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete listing',
      error: error.message
    });
  }
};

const getUserListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const listings = await Listing.findByUserId(userId);

    res.json({
      success: true,
      data: {
        listings
      }
    });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user listings',
      error: error.message
    });
  }
};

const getFeaturedListings = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const listings = await Listing.getFeatured(parseInt(limit));

    res.json({
      success: true,
      data: {
        listings
      }
    });
  } catch (error) {
    console.error('Get featured listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured listings',
      error: error.message
    });
  }
};

module.exports = {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getUserListings,
  getFeaturedListings
};