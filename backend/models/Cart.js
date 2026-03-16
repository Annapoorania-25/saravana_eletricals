const mongoose = require('mongoose');

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        name: String,
        price: Number,
        imageUrl: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        stockStatus: {
          type: String,
          default: 'In Stock',
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.methods.calculateTotals = function () {
  this.totalItems = this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  this.totalPrice = this.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return this.totalPrice;
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;