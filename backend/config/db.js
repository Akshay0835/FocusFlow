const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL ERROR: process.env.MONGODB_URI is undefined! Please configure it in your Vercel Project Settings.');
    return;
  }

  // Mask password for secure logging
  let maskedUri = uri;
  try {
    if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
      const parts = uri.split('@');
      if (parts.length > 1) {
        const protocolAndAuth = parts[0];
        const hostAndQuery = parts[1];
        const authParts = protocolAndAuth.split('://');
        const credentials = authParts[1].split(':');
        const username = credentials[0];
        maskedUri = `${authParts[0]}://${username}:****@${hostAndQuery}`;
      }
    }
  } catch (_) {
    maskedUri = 'Invalid URI format';
  }

  console.log(`Attempting to connect to MongoDB: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error Details:');
    console.error(error); // Logs the full error stack
    console.log('Ensure your MongoDB server is running or the MONGODB_URI is correct.');
  }
};

module.exports = connectDB;
