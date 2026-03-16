const axios = require('axios');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get product recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  // Keep purchase history available for fallback logic even if ML call fails early
  let purchaseHistory = [];

  try {
    // Get user's purchase history
    const userOrders = await Order.find({ user: req.user._id })
      .populate('orderItems.product');

    // Extract purchased products and categories
    purchaseHistory = [];
    const categoryCount = {};

    userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        purchaseHistory.push({
          productId: item.product._id,
          category: item.product.category,
          price: item.product.price,
          quantity: item.qty,
        });
        categoryCount[item.product.category] = (categoryCount[item.product.category] || 0) + 1;
      });
    });

    // Get all products for potential recommendations
    const allProducts = await Product.find({});

    // Prepare data for ML service
    const mlInput = {
      user_id: req.user._id.toString(),
      purchase_history: purchaseHistory,
      category_preferences: categoryCount,
      all_products: allProducts.map(p => ({
        product_id: p._id.toString(),
        category: p.category,
        price: p.price,
        name: p.name,
      })),
    };

    // Call Python ML service
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/recommend`,
      mlInput,
      { timeout: 5000 }
    );

    if (mlResponse.data && mlResponse.data.recommendations) {
      const recommendedIds = mlResponse.data.recommendations.map(r => r.product_id);

      // Recommended IDs may be Mongo ObjectIds or some other identifiers (e.g., SKU).
      // Handle both by querying using _id when valid, and falling back to sku.
      const mongoose = require('mongoose');
      const validObjectIds = recommendedIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      const nonObjectIds = recommendedIds.filter(id => !mongoose.Types.ObjectId.isValid(id));

      const queryClauses = [];
      if (validObjectIds.length) queryClauses.push({ _id: { $in: validObjectIds } });
      if (nonObjectIds.length) queryClauses.push({ sku: { $in: nonObjectIds } });

      const recommendedProducts = await Product.find(
        queryClauses.length ? { $or: queryClauses } : {}
      );

      // Sort products according to recommendation order
      const sortedRecommendations = recommendedIds.map(id => 
        recommendedProducts.find(p => p._id.toString() === id || p.sku === id)
      ).filter(p => p);

      res.json({
        recommendations: sortedRecommendations,
        explanation: mlResponse.data.explanation || 'Based on your purchase history',
      });
    } else {
      // Fallback: return popular products
      const popularProducts = await Product.find().sort({ numReviews: -1 }).limit(10);
      res.json({
        recommendations: popularProducts,
        explanation: 'Popular products',
      });
    }
  } catch (error) {
    console.error('Recommendation error:', error.message);

    // Fallback: compute "also bought" recommendations based on co-purchase history
    try {
      const userProductIds = purchaseHistory.map((item) => item.productId);
      const mongoose = require('mongoose');
      const objectIds = userProductIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (objectIds.length > 0) {
        const coPurchase = await Order.aggregate([
          { $match: { 'orderItems.product': { $in: objectIds }, user: { $ne: new mongoose.Types.ObjectId(req.user._id) } } },
          { $unwind: '$orderItems' },
          { $match: { 'orderItems.product': { $nin: objectIds } } },
          {
            $group: {
              _id: '$orderItems.product',
              count: { $sum: '$orderItems.qty' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]);

        const recommendedIds = coPurchase.map((c) => c._id);
        const recommendedProducts = await Product.find({ _id: { $in: recommendedIds } });

        // Preserve ranking based on co-purchase frequency
        const sortedRecommendations = recommendedIds
          .map((id) => recommendedProducts.find((p) => p._id.toString() === id.toString()))
          .filter(Boolean);

        if (sortedRecommendations.length > 0) {
          return res.json({
            recommendations: sortedRecommendations,
            explanation: 'Customers who bought similar items also bought these',
          });
        }
      }

      // Fallback to new arrivals if co-purchase doesn't exist
      const fallbackProducts = await Product.find().sort({ createdAt: -1 }).limit(10);
      res.json({
        recommendations: fallbackProducts,
        explanation: 'New arrivals',
      });
    } catch (fallbackError) {
      console.error('Fallback recommendation error:', fallbackError.message);
      res.status(500).json({ message: 'Error getting recommendations' });
    }
  }
};

// @desc    Get demand prediction
// @route   POST /api/recommendations/predict-demand
// @access  Private/Admin
const predictDemand = async (req, res) => {
  try {
    const { productId, months = 3 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get historical sales data
    const orders = await Order.find({
      'orderItems.product': productId,
      status: { $in: ['Delivered', 'Shipped'] },
    }).sort({ createdAt: -1 }).limit(100);

    const salesData = orders.map(order => {
      const item = order.orderItems.find(i => i.product.toString() === productId);
      return {
        date: order.createdAt,
        quantity: item ? item.qty : 0,
      };
    });

    // Prepare data for ML service
    const mlInput = {
      product_id: productId.toString(),
      category: product.category,
      price: product.price,
      current_stock: product.stock,
      sales_history: salesData,
      months_to_predict: months,
    };

    // Call Python ML service
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict-demand`,
      mlInput,
      { timeout: 5000 }
    );

    res.json(mlResponse.data);
  } catch (error) {
    console.error('Demand prediction error:', error.message);
    res.status(500).json({ message: 'Error predicting demand' });
  }
};

module.exports = {
  getRecommendations,
  predictDemand,
};