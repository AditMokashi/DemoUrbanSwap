const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createSwapRequest,
  getUserSwaps,
  updateSwapStatus,
  getSwap
} = require('../controllers/swapController');

// All swap routes require authentication
router.use(authenticateToken);

router.post('/', createSwapRequest);
router.get('/', getUserSwaps);
router.get('/:id', getSwap);
router.put('/:id/status', updateSwapStatus);

module.exports = router;