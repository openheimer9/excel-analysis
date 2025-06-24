// createAdmin.js

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

// ✅ CONFIGURE YOUR ADMIN DETAILS HERE:
const ADMIN_EMAIL = 'admin1@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_ROLE = 'admin';

// ✅ CONNECT TO MONGODB USING YOUR .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  createAdminUser();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ✅ FUNCTION TO CREATE ADMIN
const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.email);
    } else {
      const adminUser = await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: ADMIN_ROLE
      });
      console.log('✅ Admin user created successfully:', adminUser.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};
