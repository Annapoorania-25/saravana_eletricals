const Product = require('../models/Product');
const { validateProduct } = require('../utils/validation');
const { cloudinary } = require('../config/cloudinary');

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
    const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};

    const filter = { ...keyword, ...category, ...minPrice, ...maxPrice };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, brand } = req.body;
    
    // Validation
    const errors = validateProduct({ name, price, category, stock });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }

    const imageFile = req.files?.image?.[0];
    const modelFile = req.files?.model?.[0];

    if (!imageFile) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const imageUpload = await uploadToCloudinary(imageFile.buffer, {
      folder: 'hardware-store',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });

    let modelUrl = '';
    let modelCloudinaryId = '';

    if (modelFile) {
      const modelUpload = await uploadToCloudinary(modelFile.buffer, {
        folder: 'hardware-store-models',
        resource_type: 'raw',
      });
      modelUrl = modelUpload.secure_url || modelUpload.url;
      modelCloudinaryId = modelUpload.public_id;
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      brand,
      imageUrl: imageUpload.secure_url || imageUpload.url,
      cloudinaryId: imageUpload.public_id,
      modelUrl,
      modelCloudinaryId,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, brand } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.brand = brand || product.brand;

      const imageFile = req.files?.image?.[0];
      const modelFile = req.files?.model?.[0];

      if (imageFile) {
        if (product.cloudinaryId) {
          await cloudinary.uploader.destroy(product.cloudinaryId);
        }
        const imageUpload = await uploadToCloudinary(imageFile.buffer, {
          folder: 'hardware-store',
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        });
        product.imageUrl = imageUpload.secure_url || imageUpload.url;
        product.cloudinaryId = imageUpload.public_id;
      }

      if (modelFile) {
        if (product.modelCloudinaryId) {
          await cloudinary.uploader.destroy(product.modelCloudinaryId, { resource_type: 'raw' });
        }
        const modelUpload = await uploadToCloudinary(modelFile.buffer, {
          folder: 'hardware-store-models',
          resource_type: 'raw',
        });
        product.modelUrl = modelUpload.secure_url || modelUpload.url;
        product.modelCloudinaryId = modelUpload.public_id;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Delete image from cloudinary
      if (product.cloudinaryId) {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      }
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Return a fixed list based on the schema enum so admin can always create
    // products for all supported categories (even if none exist yet).
    const schemaCategories = Product.schema.path('category').enumValues || [];

    // Also include any categories currently in the database, in case there are
    // custom categories not yet reflected in the schema enum.
    const dbCategories = await Product.distinct('category');
    const categories = Array.from(new Set([...schemaCategories, ...dbCategories]));

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.stock = quantity;
      await product.save();
      res.json({ message: 'Stock updated', stock: product.stock });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  updateStock,
};