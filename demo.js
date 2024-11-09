const express = require('express');
const FtpSrv = require('ftp-srv');
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

    origin:"*",
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true 
  }));

  app.options('*', cors());  // Preflight OPTIONS request for all routes

app.use(express.json());

const startServer = async () => {
    await connectDb(); // Call the database connection function
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

// Create FTP Server
const ftpServer = new FtpSrv({
    url: "ftp://0.0.0.0:2121",
    anonymous: false,
    pasv: true, // Enable passive mode
    whitelist: ['USER', 'PASS', 'PASV', 'STOR', 'RETR', 'LIST', 'MKD', 'RMD', 'TYPE', 'CWD', 'STRU', 'OPTS', 'EPSV', 'FEAT'], // Allow specific commands
});

// Handle FTP client connections
ftpServer.on('client', (client) => {
    console.log("FTP client connected");
});

// Handle user login
ftpServer.on('login', ({ username, password }, resolve, reject) => {
    if (username === 'user' && password === 'pass') {
        console.log(`User ${username} logged in successfully.`);
        resolve({ root: path.join(__dirname, 'uploads') }); // Set root directory for the user
    } else {
        console.log(`Failed login attempt for user: ${username}`);
        reject(new Error('Invalid username or password.'));
    }
});

// Handle file uploads
ftpServer.on('STOR', async (error, fileName, stream) => {
    if (error) {
        console.error('Upload error:', error);
        return;
    }

    const modelNo = fileName.split('_')[0]; // Assuming modelNo is part of the filename
    const modelFolderPath = path.join(__dirname, 'uploads', modelNo);

    try {
        // Ensure the modelNo folder exists
        if (!fs.existsSync(modelFolderPath)) {
            fs.mkdirSync(modelFolderPath, { recursive: true });
            console.log(`Folder created for modelNo: ${modelNo}`);
        }

        const filePath = path.join(modelFolderPath, fileName);
        const writeStream = fs.createWriteStream(filePath);

        // Pipe the file stream from FTP to local file system
        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            console.log(`File saved successfully at: ${filePath}`);

            // Upload the file content to MongoDB after saving it locally
            const db = mongoClient.db(dbName);
            const collection = db.collection(collectionName);
            const fileContent = fs.readFileSync(filePath); // Read the file content

            await collection.insertOne({
                filename: fileName,
                fileContent: fileContent,
                createdAt: new Date(),
            });

            console.log('File uploaded to MongoDB successfully!');

            fs.unlinkSync(filePath);
            console.log(`Local file deleted: ${filePath}`);
        });

    } catch (error) {
        console.error('Error writing file or uploading to MongoDB:', error);
    }
});

// Start the FTP server
ftpServer.listen().then(() => {
    console.log(`FTP server is running on port 2121`);
}).catch((error) => {
    console.error('Error starting FTP server:', error);
});

// Start the Express server
app.listen(PORT, () => {
    const localIP = Object.values(require('os').networkInterfaces())
        .flat()
        .find((address) => address.family === 'IPv4' && !address.internal)?.address || 'localhost';

    console.log(`Server is running on http://${localIP}:${PORT}`);
});

