const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Correct path if needed
const Summary = require("../models/summary"); // Import the Summary model
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

router.post('/upload-file', verifyToken, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        let text;
        const filePath = req.file.path;

        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else if (req.file.mimetype === 'text/plain') {
            text = fs.readFileSync(filePath, 'utf8');
        } else {
            return res.status(400).send('Unsupported file type.');
        }

        // Delete the file after processing
        fs.unlinkSync(filePath);

        res.json({ text });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file.');
    }
});

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
