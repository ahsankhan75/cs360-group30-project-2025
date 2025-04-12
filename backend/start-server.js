require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Check if environment variables are set
if (!process.env.PORT) {
  console.error('Error: PORT is not defined in environment variables');
  console.log('Make sure you have a .env file with PORT=4000 defined');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in environment variables');
  console.log('Make sure you have a .env file with MONGO_URI defined');
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

console.log('Starting server with the following configuration:');
console.log(`PORT: ${process.env.PORT}`);
console.log(`MONGO_URI: ${MONGO_URI.substring(0, 20)}...`);

// Start the server process
const serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
