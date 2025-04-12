/**
 * Dependency checker and installer script
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

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read package.json
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found!');
  process.exit(1);
}

try {
  // Read and parse the package.json file
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  let packageJson;
  
  try {
    packageJson = JSON.parse(packageJsonContent);
  } catch (parseError) {
    console.error('❌ Error parsing package.json. Running fix script first...');
    
    try {
      // Try to run the fix script first
      execSync('node scripts/fix-package-json.js', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      // Try parsing again after fix
      const fixedContent = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(fixedContent);
    } catch (fixError) {
      console.error('❌ Could not auto-fix package.json. Please fix it manually.');
      process.exit(1);
    }
  }
  
  // Check for missing dependencies
  const dependencies = packageJson.dependencies || {};
  const missingPackages = requiredPackages.filter(pkg => !dependencies[pkg]);
  
  if (missingPackages.length > 0) {
    console.log(`🔍 Missing dependencies: ${missingPackages.join(', ')}`);
    console.log('🔧 Installing missing dependencies...');
    
    try {
      execSync(`npm install --save ${missingPackages.join(' ')}`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Dependencies installed successfully!');
    } catch (installError) {
      console.error('❌ Failed to install dependencies:', installError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ All required dependencies are present in package.json');
  }
  
  // Check if node_modules exist for all dependencies
  console.log('🔍 Checking node_modules...');
  let missingModules = false;
  
  for (const pkg of requiredPackages) {
    const modulePath = path.join(__dirname, '..', 'node_modules', pkg);
    if (!fs.existsSync(modulePath)) {
      console.log(`❓ Module directory missing for: ${pkg}`);
      missingModules = true;
    }
  }
  
  if (missingModules) {
    console.log('🔧 Running npm install to restore modules...');
    try {
      execSync('npm install', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Modules installed successfully!');
    } catch (installError) {
      console.error('❌ Failed to install modules:', installError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ All required modules appear to be installed');
  }
  
  console.log('✨ Dependency check complete!');
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
  process.exit(1);
}
