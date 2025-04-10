require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const emConRoutes = require("./routes/emCon");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const medicalCardRoutes = require("./routes/digitalMedicalCardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Check for required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file with these variables defined');
  process.exit(1);
}

// express app
const app = express();

// middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running', 
    time: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// routes
app.use("/api/hospitals", emConRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/medical-card", medicalCardRoutes);
app.use("/api/reviews", reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.path} does not exist`
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    const server = app.listen(process.env.PORT, () => {
      console.log("✅ Connected to database");
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
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
