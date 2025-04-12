/**
 * Fix Package.json script
 * Attempts to repair common JSON syntax issues in package.json
 */
const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

console.log('🔍 Checking package.json for syntax errors...');

try {
  // Read the file as text
  const fileContent = fs.readFileSync(packageJsonPath, 'utf8');
  
  // Try to parse the JSON to validate it
  try {
    JSON.parse(fileContent);
    console.log('✅ package.json is valid JSON! No fixes needed.');
    process.exit(0);
  } catch (parseError) {
    console.log('❌ Found JSON syntax error:', parseError.message);
    console.log('🔧 Attempting to fix...');
    
    // Common fixes for package.json syntax errors
    let fixedContent = fileContent
      // Fix trailing commas in objects
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix missing commas between properties
      .replace(/("[^"]+"\s*:\s*"[^"]+")(\s+")/, '$1,$2')
      // Fix duplicate commas
      .replace(/,\s*,/g, ',')
      // Fix unquoted property names
      .replace(/([{,]\s*)([a-zA-Z0-9_-]+)(\s*:)/g, '$1"$2"$3');
    
    // Try again with the fixed content
    try {
      JSON.parse(fixedContent);
      console.log('✅ Successfully fixed JSON syntax issues!');
      
      // Write the fixed content back to the file
      fs.writeFileSync(packageJsonPath, fixedContent);
      console.log('💾 Updated package.json saved.');
      process.exit(0);
    } catch (secondError) {
      console.log('❌ Automated fixes were not sufficient. Manual intervention required.');
      
      // Create a backup and provide a clean template
      const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
      const backupPath = `${packageJsonPath}.backup-${timestamp}`;
      fs.writeFileSync(backupPath, fileContent);
      console.log(`📄 Original file backed up to: ${backupPath}`);
      
      // Create a clean template
      const template = {
        "name": "backend",
        "version": "1.0.0",
        "description": "Backend API for EMCON",
        "main": "server.js",
        "scripts": {
          "start": "node server.js",
          "dev": "nodemon server.js",
          "check-deps": "node scripts/check-deps.js"
        },
        "dependencies": {
          "bcrypt": "^5.1.0",
          "cors": "^2.8.5",
          "dotenv": "^16.0.3",
          "express": "^4.18.2",
          "jsonwebtoken": "^9.0.0",
          "mongodb": "^6.15.0",
          "mongoose": "^7.0.3",
          "validator": "^13.9.0"
        },
        "devDependencies": {
          "nodemon": "^2.0.22"
        }
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(template, null, 2));
      console.log('📝 Created a clean package.json template');
      console.log('⚠️ Please review and add any missing scripts or dependencies!');
    }
  }
} catch (fileError) {
  console.error('❌ Error reading package.json file:', fileError.message);
  process.exit(1);
}
