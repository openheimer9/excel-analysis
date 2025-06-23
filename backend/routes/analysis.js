const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const File = require('../models/File');

// Save analysis
router.post('/:fileId', protect, async (req, res) => {
    try {
        const { chartType, xAxis, yAxis } = req.body;
        
        const file = await File.findOne({ _id: req.params.fileId, user: req.user.id });
        
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        file.analysisHistory.push({
            chartType,
            xAxis,
            yAxis
        });

        await file.save();

        res.status(201).json(file.analysisHistory[file.analysisHistory.length - 1]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get analysis history for a file
router.get('/:fileId/history', protect, async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.params.fileId, user: req.user.id });
        
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.status(200).json(file.analysisHistory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all analysis history for user
router.get('/history', protect, async (req, res) => {
    try {
        const files = await File.find({ user: req.user.id })
            .select('originalName analysisHistory')
            .sort('-uploadDate');

        const history = files.map(file => ({
            fileName: file.originalName,
            analyses: file.analysisHistory
        }));

        res.status(200).json(history);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 