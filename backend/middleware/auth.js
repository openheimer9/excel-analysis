const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }
        
        // Check if user is banned
        if (user.banned) {
            return res.status(403).json({ message: 'Your account has been banned. Please contact an administrator.' });
        }
        
        // Update last active timestamp
        await User.findByIdAndUpdate(user._id, { lastActive: Date.now() });
        
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Helper function to log user activity
exports.logActivity = (user, action, details = {}) => {
    return User.findByIdAndUpdate(user._id, {
        $push: {
            activityLog: {
                action,
                timestamp: Date.now(),
                details
            }
        }
    });
};