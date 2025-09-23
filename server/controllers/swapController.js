const Swap = require('../models/Swap');
const User = require('../models/User');
const Listing = require('../models/Listing');

const createSwapRequest = async (req, res) => {
  try {
    const { listing_id, message, offer_type, offer_details } = req.body;
    const requesterId = req.user.id;

    // Get listing details
    const listing = await Listing.findById(listing_id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Prevent users from requesting their own listings
    if (listing.user_id === requesterId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a swap for your own listing'
      });
    }

    const swap = await Swap.create({
      listing_id,
      requester_id: requesterId,
      owner_id: listing.user_id,
      message,
      offer_type,
      offer_details,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: {
        swap
      }
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create swap request',
      error: error.message
    });
  }
};

const getUserSwaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const swaps = await Swap.findByUserId(userId);

    res.json({
      success: true,
      data: {
        swaps
      }
    });
  } catch (error) {
    console.error('Get user swaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user swaps',
      error: error.message
    });
  }
};

const updateSwapStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const swap = await Swap.updateStatus(id, status, userId);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found or you do not have permission to update it'
      });
    }

    // Award points for completed swaps
    if (status === 'completed') {
      const swapDetails = await Swap.findById(id);
      
      // Award points to both users
      const requesterUser = await User.findById(swapDetails.requester_id);
      const ownerUser = await User.findById(swapDetails.owner_id);
      
      await User.updatePoints(swapDetails.requester_id, (requesterUser.points || 0) + 50);
      await User.updatePoints(swapDetails.owner_id, (ownerUser.points || 0) + 50);
    }

    res.json({
      success: true,
      message: 'Swap status updated successfully',
      data: {
        swap
      }
    });
  } catch (error) {
    console.error('Update swap status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update swap status',
      error: error.message
    });
  }
};

const getSwap = async (req, res) => {
  try {
    const { id } = req.params;
    const swap = await Swap.findById(id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user has permission to view this swap
    if (swap.requester_id !== req.user.id && swap.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this swap'
      });
    }

    res.json({
      success: true,
      data: {
        swap
      }
    });
  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get swap',
      error: error.message
    });
  }
};

module.exports = {
  createSwapRequest,
  getUserSwaps,
  updateSwapStatus,
  getSwap
};