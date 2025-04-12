/**
 * Development startup script to run both frontend and backend servers
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

// Check if backend .env exists
const backendEnvPath = path.join(backendPath, '.env');
if (!fs.existsSync(backendEnvPath)) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Backend .env file missing!');
  console.log('Please create a .env file in the backend directory with:');
  console.log('  PORT=4000');
  console.log('  MONGO_URI=mongodb+srv://...');
  console.log('  SECRET=your_jwt_secret');
  process.exit(1);
}

// Check if frontend .env exists, create if not
const frontendEnvPath = path.join(frontendPath, '.env');
if (!fs.existsSync(frontendEnvPath)) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️ Frontend .env file missing, creating default...');
  fs.writeFileSync(frontendEnvPath, 'REACT_APP_API_URL=http://localhost:4000\nREACT_APP_ENV=development\n');
}

// Check if package.json files exist
if (!fs.existsSync(path.join(backendPath, 'package.json'))) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Backend package.json missing!');
  process.exit(1);
}

if (!fs.existsSync(path.join(frontendPath, 'package.json'))) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Frontend package.json missing!');
  process.exit(1);
}

// Check if frontend has proxy configured in package.json
const frontendPackageJson = require(path.join(frontendPath, 'package.json'));
if (!frontendPackageJson.proxy || frontendPackageJson.proxy !== 'http://localhost:4000') {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️ Frontend proxy not configured correctly!');
  console.log('Adding proxy to package.json...');
  
  frontendPackageJson.proxy = 'http://localhost:4000';
  fs.writeFileSync(
    path.join(frontendPath, 'package.json'),
    JSON.stringify(frontendPackageJson, null, 2)
  );
}

// Function to start a process
function startProcess(name, dir, command, args = []) {
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 Starting ${name}...`);
  
  const proc = spawn(command, args, {
    cwd: dir,
    shell: true,
    stdio: 'pipe'
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`\x1b[32m[${name}]\x1b[0m ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`\x1b[31m[${name}]\x1b[0m ${data.toString().trim()}`);
  });
  
  proc.on('error', (error) => {
    console.error(`\x1b[31m[${name}] Failed to start: ${error.message}\x1b[0m`);
  });
  
  proc.on('close', (code) => {
    console.log(`\x1b[33m[${name}] Process exited with code ${code}\x1b[0m`);
    if (name === 'Backend' && code !== 0) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Backend server failed to start!');
      console.log('This will cause PROXY ERRORS in the frontend.');
      console.log('Please check the backend logs above for errors.');
    }
  });
  
  return proc;
}

// Start backend server
const backend = startProcess('Backend', backendPath, 'npm', ['run', 'start']);

// Give backend some time to start before starting frontend
setTimeout(() => {
  // Start frontend server
  const frontend = startProcess('Frontend', frontendPath, 'npm', ['start']);
  
  // Handle termination
  process.on('SIGINT', () => {
    console.log('\n\x1b[36m%s\x1b[0m', '🛑 Stopping servers...');
    backend.kill();
    frontend.kill();
    process.exit();
  });
}, 5000);

console.log('\x1b[36m%s\x1b[0m', '⏳ Waiting for backend to start before launching frontend...');
console.log('\x1b[36m%s\x1b[0m', '💡 Press Ctrl+C to stop both servers');
