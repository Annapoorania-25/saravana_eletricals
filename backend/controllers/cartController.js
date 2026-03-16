const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name price imageUrl stock');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [],
        totalPrice: 0,
        totalItems: 0,
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [],
        totalPrice: 0,
        totalItems: 0,
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.cartItems.push({
        product: productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity,
      });
    }

    cart.calculateTotals();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name price imageUrl stock');

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex >= 0) {
      // Check stock
      const product = await Product.findById(cart.cartItems[itemIndex].product);
      if (product && product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      if (quantity <= 0) {
        cart.cartItems.splice(itemIndex, 1);
      } else {
        cart.cartItems[itemIndex].quantity = quantity;
      }

      cart.calculateTotals();
      await cart.save();

      const updatedCart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name price imageUrl stock');
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.cartItems = cart.cartItems.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    cart.calculateTotals();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name price imageUrl stock');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.cartItems = [];
      cart.totalPrice = 0;
      cart.totalItems = 0;
      await cart.save();
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};