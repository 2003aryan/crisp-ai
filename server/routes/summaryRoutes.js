const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Correct path if needed
const Summary = require("../models/summary"); // Import the Summary model

// API endpoint to save summary
router.post('/save-summary', verifyToken, async (req, res) => {
    try {
        const { inputText, summary } = req.body;
        const newSummary = new Summary({
            userId: req.userId,
            inputText,
            summary
        });
        await newSummary.save();
        res.status(200).send({ message: 'Summary saved successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error saving summary', error: error.message });
    }
});

// API endpoint to fetch summaries for a user
router.get('/summaries', verifyToken, async (req, res) => {
    try {
        const summaries = await Summary.find({ userId: req.userId });
        res.status(200).json(summaries);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching summaries', error: error.message });
    }
});

module.exports = router;
