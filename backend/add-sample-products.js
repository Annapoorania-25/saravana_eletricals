const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const sampleProducts = [
  {
    name: 'Claw Hammer',
    description: '16 oz steel claw hammer with comfortable grip',
    price: 15.99,
    category: 'Tools',
    stock: 50,
    brand: 'Stanley',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/hammer.jpg',
    sku: 'TOL-001'
  },
  {
    name: 'Ball Peen Hammer',
    description: '8 oz ball peen hammer for metalwork',
    price: 12.99,
    category: 'Tools',
    stock: 30,
    brand: 'Estwing',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/ball-peen.jpg',
    sku: 'TOL-002'
  },
  {
    name: 'Rubber Mallet',
    description: '16 oz rubber mallet for delicate work',
    price: 9.99,
    category: 'Tools',
    stock: 25,
    brand: 'Stanley',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/mallet.jpg',
    sku: 'TOL-003'
  },
  {
    name: 'Sledge Hammer',
    description: '10 lb sledge hammer for heavy demolition',
    price: 29.99,
    category: 'Tools',
    stock: 15,
    brand: 'Stanley',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sledge.jpg',
    sku: 'TOL-004'
  },
  {
    name: 'Electric Drill',
    description: '18V cordless drill with battery and charger',
    price: 89.99,
    category: 'Tools',
    stock: 20,
    brand: 'Bosch',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/drill.jpg',
    sku: 'TOL-005'
  },
  {
    name: 'LED Light Bulb',
    description: '60W equivalent LED bulb, energy saving',
    price: 4.99,
    category: 'Electrical',
    stock: 200,
    brand: 'Philips',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/bulb.jpg',
    sku: 'ELE-001'
  },
  {
    name: 'Extension Cord',
    description: '10 ft 3-prong extension cord',
    price: 12.99,
    category: 'Electrical',
    stock: 75,
    brand: 'GE',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/cord.jpg',
    sku: 'ELE-002'
  },
  {
    name: 'Paint Brush Set',
    description: '5-piece paint brush set, various sizes',
    price: 14.99,
    category: 'Paint',
    stock: 40,
    brand: 'Purdy',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/brushes.jpg',
    sku: 'PNT-001'
  },
  {
    name: 'Adjustable Wrench',
    description: '10 inch adjustable wrench',
    price: 18.99,
    category: 'Hardware',
    stock: 35,
    brand: 'Crescent',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/wrench.jpg',
    sku: 'HRD-001'
  },
  {
    name: 'Pipe Wrench',
    description: '14 inch pipe wrench for plumbing',
    price: 24.99,
    category: 'Hardware',
    stock: 20,
    brand: 'Ridgid',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/pipe-wrench.jpg',
    sku: 'HRD-002'
  }
];

const addSampleProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional - remove if you want to keep existing)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add sample products
    const result = await Product.insertMany(sampleProducts);
    console.log(`✅ Added ${result.length} sample products`);

    console.log('\n📦 Sample products added:');
    result.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - $${p.price} - ${p.category}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

addSampleProducts();