require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('PORT:', process.env.PORT);

const express = require('express');
const summaryRoutes = require('./routes/summaryRoutes'); // Update path if needed
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Ensure this path is correct

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit process if connection fails
    });

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Ensure this is set in your .env file
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add methods as needed
}));
app.use(express.json()); // Parse JSON bodies
app.use('/api', summaryRoutes); // This should correctly prefix all routes in summaryRoutes with /api

// API routes
app.use('/api/auth', authRoutes); // Routes prefixed with /api/auth

// Serve static files from the React app
// app.use(express.static(path.join(__dirname, '../client/build')));

// Status check API
app.get('/api/status', (req, res) => {
    res.json({ message: 'API is operational' });
});

// Serve React's index.html for any route not handled by the API
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});
