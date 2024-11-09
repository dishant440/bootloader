// const mongoose = require("mongoose");
// require("dotenv").config();

// const connectDb = async () => {
//   try {
//     console.log(process.env.MONGO_URI);
//     const connection = await mongoose.connect(`${process.env.MONGO_URI}`);
    
//     console.log("MongoDB connected successfully");
//   } catch (error) {
//     console.log("MongoDB connection error: ", error.message); 
    
//     setTimeout(() => process.exit(1), 3000); 
//   }
// };

// module.exports = connectDb;const mongoose = require("mongoose");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
  const maxRetries = 5; // Maximum retry attempts
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      console.log("MongoDB URI:", process.env.MONGO_URI);
      const connection = await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully");
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB connection lost. Attempting to reconnect...');
        connectWithRetry(); 
      });

      mongoose.connection.on('error', (error) => {
        console.error(`MongoDB connection error: ${error.message}`);
      });

    } catch (error) {
      console.log(`MongoDB connection error: ${error.message}`);
      
      retryCount += 1;
      if (retryCount < maxRetries) {
        console.log(`Retrying connection... (${retryCount}/${maxRetries})`);
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
      } else {
        console.error("Maximum retry limit reached. Could not connect to MongoDB.");
        
      }
    }
  };

  connectWithRetry();
};

module.exports = connectDb;
