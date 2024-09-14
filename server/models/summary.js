const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputText: { type: String, required: true },
    summary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now } // Automatically set to current date and time
});

const Summary = mongoose.model('Summary', summarySchema);

module.exports = Summary;
