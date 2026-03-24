const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  predictDemand,
} = require('../controllers/recommendationController');
const { protect, protectOptional } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

// Use optional auth for recommendations - allows both authenticated and unauthenticated users
// For authenticated users, provides personalized recommendations; for others, shows fallback
router.get('/', protectOptional, getRecommendations);

// Predict demand requires full authentication and admin role
router.post('/predict-demand', protect, admin, predictDemand);

module.exports = router;