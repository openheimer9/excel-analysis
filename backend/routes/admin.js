const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const File = require('../models/File');

// Get platform statistics (admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments() - 1;
        const totalFiles = await File.countDocuments();
        
        // Calculate total analyses by summing up analysisHistory arrays
        const files = await File.find();
        const totalAnalyses = files.reduce((sum, file) => sum + file.analysisHistory.length, 0);

        res.status(200).json({
            totalUsers,
            totalFiles,
            totalAnalyses
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 