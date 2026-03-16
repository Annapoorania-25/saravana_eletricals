const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  updateStock,
} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getProducts)
  .post(
    protect,
    admin,
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'model', maxCount: 1 },
    ]),
    createProduct
  );

router.get('/categories', getCategories);

router.route('/:id')
  .get(getProductById)
  .put(
    protect,
    admin,
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'model', maxCount: 1 },
    ]),
    updateProduct
  )
  .delete(protect, admin, deleteProduct);

router.put('/:id/stock', protect, admin, updateStock);

module.exports = router;