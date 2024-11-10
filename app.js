const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const connectDb = require('./config/db'); // Your MongoDB connection logic
const mongoClient = require('./config/db');
const authRoutes = require('./Routes/authRoutes');
const fileUploadRoutes = require('./Routes/fileUploadRoutes');
require('dotenv').config(); // For loading environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 7000;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true 
}));

app.options('*', cors());  
app.use(express.json());

const startServer = async () => {
    await connectDb(); 
};
  
// Call the startServer function to initialize
startServer().catch(err => {
    console.error('Server failed to start:', err.message);  
});

// Set up routes
app.use('/api', authRoutes);
app.use('/api/file', fileUploadRoutes);

app.use(express.static(path.join(__dirname, 'client/build')));

// Serve the React app on all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Handle 404 responses
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint not found'
    });
});

// Start the Express server
app.listen(PORT, () => {
    const localIP = process.env.NODE_ENV === 'development' 
        ? Object.values(require('os').networkInterfaces())
              .flat()
              .find((address) => address.family === 'IPv4' && !address.internal)?.address || 'localhost'
        : '0.0.0.0'; // In production, listen on all available network interfaces.

    console.log(`Server is running on http://${localIP}:${PORT}`);
    console.log('PORT : ',PORT)
});
