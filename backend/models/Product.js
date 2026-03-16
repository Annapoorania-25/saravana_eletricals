const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add price'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please add category'],
      enum: ['Tools', 'Electrical', 'Plumbing', 'Paint', 'Hardware', 'Garden', 'Lumber', 'Other'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add image'],
    },
    cloudinaryId: String,
    modelUrl: {
      type: String,
      default: '',
    },
    modelCloudinaryId: {
      type: String,
      default: '',
    },
    brand: String,
    sku: {
      type: String,
      unique: true,
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', async function (next) {
  if (!this.sku) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000);
    this.sku = `${prefix}-${randomNum}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;