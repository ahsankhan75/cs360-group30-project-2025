require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Atlas connection...');

// Get the connection string from .env
const MONGO_URI = process.env.MONGO_URI;

// Don't log the full connection string to protect credentials
const sanitizedUri = MONGO_URI.includes('@') ? 
  MONGO_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@') : 
  MONGO_URI;

console.log(`📌 Attempting to connect to: ${sanitizedUri}`);

// Test mongoose connection
async function testConnection() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Connection details:');
    console.log(`   Database name: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    await mongoose.disconnect();
    console.log('✅ Connection test complete and connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection test failed!');
    console.error(`   Error: ${error.message}`);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('ENOTFOUND') || error.message.includes('failed to connect')) {
      console.error('\n🔍 Troubleshooting for connection failures:');
      console.error('1️⃣  Check your network connection');
      console.error('2️⃣  Verify the hostname in your MongoDB Atlas connection string');
      console.error('3️⃣  Make sure your IP address is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n🔍 Authentication error troubleshooting:');
      console.error('1️⃣  Double check your username and password in the connection string');
      console.error('2️⃣  Verify that the database user exists with correct permissions');
    }
    
    console.error('\n📝 General MongoDB Atlas troubleshooting:');
    console.error('1️⃣  Log in to MongoDB Atlas dashboard at https://cloud.mongodb.com');
    console.error('2️⃣  Make sure your cluster is active and running');
    console.error('3️⃣  Check Network Access settings and add your current IP address');
    console.error('4️⃣  Verify the correct connection string from MongoDB Atlas UI');
    console.error('5️⃣  Create a new database user if necessary');
    
    process.exit(1);
  }
}

testConnection();
