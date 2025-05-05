require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const hospitalRoutes = require("./routes/emCon");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const medicalCardRoutes = require("./routes/digitalMedicalCardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require('./routes/admin');
const hospitalAdminRoutes = require('./routes/hospitalAdmin');
const path = require('path');
const profilePhotoRoutes = require('./routes/profilePhotoRoutes'); // Included from actual-anser-finaledits-1

// Check for required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'SECRET', 'FRONTEND_URL']; // Added FRONTEND_URL check
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please ensure your .env file has these variables defined');
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

// CORS configuration - Using main branch version for deployment compatibility
try {
  const cors = require('cors');
  const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"]; // Includes deployment URL
  console.log(`✅ Configuring CORS for origins: ${allowedOrigins.join(', ')}`);
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  }));
  console.log('✅ CORS middleware enabled');
} catch (error) {
  console.error('❌ CORS module not available. API access might be restricted.');
  console.error('   Run: npm install cors --save');

  // Minimal CORS implementation as fallback (Less robust, use with caution)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Only allow specific origins in fallback too
    if (origin === process.env.FRONTEND_URL || origin === "http://localhost:3000") {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Added OPTIONS
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204); // Use 204 No Content for OPTIONS success
    }
    next();
  });
}

// Middleware for request parsing
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development', // Default to development if NODE_ENV not set
    apis: [
      '/api/hospitals',
      '/api/user',
      '/api/blood-requests',
      '/api/medical-card',
      '/api/reviews',
      '/api/admin',
      '/api/hospital-admin',
      '/api/profile-photos' // Added profile photos API
    ]
  });
});

// API route for checking admin connectivity (can be removed if unused)
app.get('/api/admin/health', (req, res) => {
  res.status(200).json({
    status: 'Admin API path is available',
    time: new Date().toISOString()
  });
});

// Routes
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/medical-card", medicalCardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospital-admin', hospitalAdminRoutes);
app.use('/api/profile-photos', profilePhotoRoutes); // Included from actual-anser-finaledits-1

// Refresh token route
app.post('/api/token/refresh', (req, res) => {
  // It's generally better to have this within user routes, but keeping structure for now
  try {
      const { refreshToken } = require('./controllers/userController');
      return refreshToken(req, res);
  } catch (controllerError) {
      console.error("Error loading refreshToken controller:", controllerError);
      res.status(500).json({ error: "Internal server error during token refresh setup." });
  }
});

// Static file serving for production (Ensure frontend build path is correct)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../frontend/build'); // Use path.resolve for robustness
  console.log(`📦 Serving static files from: ${buildPath}`);

  if (require('fs').existsSync(buildPath)) {
      app.use(express.static(buildPath));

      // Handle React routing by serving index.html for non-API, non-file requests
      app.get('*', (req, res, next) => {
          // If the request is not for an API endpoint
          if (!req.path.startsWith('/api/')) {
              // Check if the path corresponds to a file in the static build directory
              const potentialFilePath = path.join(buildPath, req.path);
              if (require('fs').existsSync(potentialFilePath) && require('fs').lstatSync(potentialFilePath).isFile()) {
                  // If it's a file, let express.static handle it (or it might already have)
                  return next();
              }
              // Otherwise, serve index.html for client-side routing
              res.sendFile(path.join(buildPath, 'index.html'), err => {
                  if (err) {
                      console.error("Error sending index.html:", err);
                      res.status(500).send(err);
                  }
              });
          } else {
              // If it's an API request, let it fall through to the 404 handler if not matched
              next();
          }
      });
  } else {
      console.warn(`⚠️ Production mode enabled, but build directory not found at ${buildPath}. Frontend will not be served.`);
  }
}

// Error handling middleware (ensure this is after all routes)
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err); // Log the full error object
  // Handle specific error types if needed (e.g., Mongoose validation errors)
  // if (err.name === 'ValidationError') {
  //     return res.status(400).json({ error: 'Validation Failed', details: err.errors });
  // }
  res.status(err.status || 500).json({ // Use error status if available, otherwise 500
    error: 'Something went wrong!',
    message: err.message || 'An unexpected error occurred.'
  });
});

// 404 handler (ensure this is the last middleware)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.path} does not exist`
  });
});

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
  socketTimeoutMS: 45000, // 45 seconds timeout for socket inactivity
};

// Connect to MongoDB
console.log('📡 Attempting to connect to MongoDB...');
const sanitizedUri = MONGO_URI.includes('@') ?
  MONGO_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:<password>@') : // Improved sanitization
  MONGO_URI;
console.log(`🔗 Using connection string: ${sanitizedUri}`);

mongoose
  .connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

    // Start listening for requests only after successful DB connection
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      // Use 0.0.0.0 to listen on all available network interfaces, important for containers/deployment
      console.log(`🌐 API accessible at http://localhost:${PORT} (and potentially other interfaces)`);
      console.log(`💡 Health check: http://localhost:${PORT}/health`);
      if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
        console.log(`🔗 Frontend expected at: ${process.env.FRONTEND_URL}`);
      }
    });

    // Handle server startup errors (like port in use)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        console.error('   Please stop the process using this port or change the PORT in your .env file.');
      } else {
        console.error('❌ Server startup error:', error);
      }
      process.exit(1); // Exit if server can't start
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message); // Log only the error message initially
    console.error('\n🔍 MongoDB Atlas Troubleshooting:');
    console.error(' 1. Network Connectivity: Ensure the server can reach MongoDB Atlas (check firewalls, proxies).');
    console.error(' 2. IP Whitelisting: Verify the server\'s IP address is whitelisted in Atlas Network Access.');
    console.error(' 3. Credentials: Double-check MONGO_URI for correct username, password, and cluster hostname.');
    console.error(' 4. Cluster Status: Ensure your Atlas cluster is active and not paused.');
    console.error(' 5. DNS Issues: Try connecting using `nslookup <your-cluster-hostname>` from the server.');
    console.error(' 6. Mongoose Version: Ensure Mongoose is up-to-date (`npm update mongoose`).');
    // console.error('   Full Error:', error); // Optionally log the full error for detailed debugging
    process.exit(1); // Exit if DB connection fails
  });

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🚦 Received ${signal}. Shutting down gracefully...`);
  // Close server first to stop accepting new connections
  server.close(() => { // Ensure server is defined before calling close
    console.log('✅ HTTP server closed.');
    // Then close MongoDB connection
    mongoose.connection.close(false, () => { // Set force to false for graceful close
      console.log('✅ MongoDB connection closed.');
      process.exit(0); // Exit cleanly
    });
  });

  // Force shutdown after a timeout if graceful shutdown fails
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcing shutdown.');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Listen for termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT')); // Catches Ctrl+C

// Handle uncaught exceptions (should ideally not happen with proper error handling)
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Attempt graceful shutdown, but might fail if error is severe
  // shutdown('uncaughtException'); // Consider if shutdown is safe here
  process.exit(1); // Exit with error code
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚫 Unhandled Rejection at:', promise, 'reason:', reason);
  // Depending on the reason, you might want to shutdown or just log
  // shutdown('unhandledRejection'); // Consider if shutdown is appropriate
  process.exit(1); // Exit with error code as it indicates a programming error
});