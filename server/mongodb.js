const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://nirnaymittal:myself5430@cluster0.gzoaymz.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://aryangarg:polling123@aryan.bej9llo.mongodb.net/?retryWrites=true&w=majority";

async function connectToMongoDB() {
    try {
        const client = await MongoClient.connect(uri);
        console.log('Connected to MongoDB');
        return client;
    }

    catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

module.exports = connectToMongoDB;