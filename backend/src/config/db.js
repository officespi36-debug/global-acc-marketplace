const mongoose = require('mongoose');

let isConnected = false;
let useMemoryFallback = true; // Default to true so all routes are immediately ready

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/global_acc_marketplace';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    useMemoryFallback = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[DB] MongoDB is not reachable (${error.message}).`);
    console.info(`[DB] Operating seamlessly in In-Memory Resilient Store mode.`);
    useMemoryFallback = true;
    return false;
  }
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  isMemoryMode: () => useMemoryFallback
};
