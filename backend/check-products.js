const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const checkProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get total count
    const count = await Product.countDocuments();
    console.log(`\n📊 Total products in database: ${count}`);

    if (count === 0) {
      console.log('\n❌ No products found! You need to add sample products.');
      console.log('Run: node add-sample-products.js');
    } else {
      // Get all products
      const products = await Product.find().limit(20);
      console.log('\n📦 Products in database:');
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - $${p.price} - ${p.category}`);
      });

      // Get unique categories
      const categories = await Product.distinct('category');
      console.log('\n📋 Available categories:', categories);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkProducts();