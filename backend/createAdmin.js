const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin1@gmail.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }
        
        // Create admin user
        const adminUser = await User.create({
            email: 'admin1@gmail.com',
            password: 'admin123',
            role: 'admin'
        });
        
        console.log('Admin user created successfully:', adminUser);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();
