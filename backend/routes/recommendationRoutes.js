const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  predictDemand,
} = require('../controllers/recommendationController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

router.get('/', protect, getRecommendations);
router.post('/predict-demand', protect, admin, predictDemand);

module.exports = router;