require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const hospitalRoutes = require("./routes/emCon");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const medicalCardRoutes = require("./routes/digitalMedicalCardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require('./routes/admin');
const path = require('path');

// Check for required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file with these variables defined');
  process.exit(1);
}

// Validate MongoDB URI format
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://')) {
  console.error('Error: Invalid MongoDB URI format');
  console.error('The MONGO_URI must start with "mongodb://" or "mongodb+srv://"');
  console.error(`Current value: ${MONGO_URI}`);
  process.exit(1);
}

// Initialize express app
const app = express();

// CORS configuration with fallback for missing module
try {
  const cors = require('cors');
  app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  }));
  console.log('✅ CORS middleware enabled');
} catch (error) {
  console.error('❌ CORS module not available. API will only be accessible from same origin.');
  console.error('   Run: npm install cors --save');
  
  // Minimal CORS implementation as fallback
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Middleware for request parsing
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running', 
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    apis: [
      '/api/hospitals',
      '/api/user',
      '/api/blood-requests',
      '/api/medical-card',
      '/api/reviews',
      '/api/admin'
    ]
  });
});

// API route for checking admin connectivity
app.get('/api/admin/health', (req, res) => {
  res.status(200).json({ 
    status: 'Admin API is available',
    time: new Date().toISOString()
  });
});

// routes
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/medical-card", medicalCardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use('/api/admin', adminRoutes);

// Static file serving for production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  
  app.use(express.static(buildPath));
  
  // Handle React routing by serving index.html for non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.path} does not exist`
  });
});

// MongoDB connection options for Atlas
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increase timeout for Atlas connections
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Connect to MongoDB
console.log('📡 Attempting to connect to MongoDB...');
// Sanitize the URI before logging to protect credentials
const sanitizedUri = MONGO_URI.includes('@') ? 
  MONGO_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@') : 
  MONGO_URI;
console.log(`🔗 Using connection string: ${sanitizedUri}`);

mongoose
  .connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // listen for requests
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API accessible at http://localhost:${PORT}/api/`);
      console.log(`💡 Health check: http://localhost:${PORT}/health`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please:
1. Stop any running server instances
2. Or change the PORT value in your .env file`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.error('\n🔍 MongoDB Atlas troubleshooting steps:');
    console.error('1️⃣  Check your network connection');
    console.error('2️⃣  Make sure your IP address is whitelisted in MongoDB Atlas');
    console.error('3️⃣  Verify the username, password, and cluster name in your connection string');
    console.error('4️⃣  Check if your Atlas cluster is active');
    console.error('5️⃣  Try using the MongoDB Atlas connection string from the Atlas UI');
    console.error(`   Example: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>`);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
