const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({createdAt: -1});
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get user by ID (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update user (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ban/unban user (admin only)
router.patch('/:id/ban', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent banning admin users
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot ban admin users' });
        }

        // Toggle ban status
        user.banned = !user.banned;
        await user.save();

        res.status(200).json({ 
            message: user.banned ? 'User banned successfully' : 'User unbanned successfully',
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                banned: user.banned,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get user activity (admin only)
router.get('/:id/activity', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            lastActive: user.lastActive,
            activityLog: user.activityLog || []
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;