/**
 * Dependency checker and installer script
 * This script verifies required dependencies and installs missing ones
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Required dependencies
const requiredPackages = [
  'cors',
  'express',
  'mongoose',
  'jsonwebtoken',
  'dotenv',
  'bcrypt',
  'validator'
];

console.log('📦 Checking for required dependencies...');

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found!');
  process.exit(1);
}

let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Check for missing dependencies
const installedDeps = Object.keys(packageJson.dependencies || {});
const missingPackages = requiredPackages.filter(pkg => !installedDeps.includes(pkg));

// Install missing dependencies if any
if (missingPackages.length > 0) {
  console.log(`🔍 Missing dependencies detected: ${missingPackages.join(', ')}`);
  console.log('🔧 Installing missing dependencies...');
  
  try {
    execSync(`npm install --save ${missingPackages.join(' ')}`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ All required dependencies are installed.');
}

// Start the server
console.log('🚀 Starting the server...');
require('./server');
