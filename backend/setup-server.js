/**
 * Server setup and verification script
 * Validates environment and dependencies before starting server
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check for .env file
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

// Required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'SECRET'];

// Create .env file if it doesn't exist
if (!envExists) {
  console.log('❓ .env file not found. Let\'s create one.');
  
  const envQuestions = [
    {
      name: 'PORT',
      message: 'Server port (default: 4000):',
      default: '4000'
    },
    {
      name: 'MONGO_URI',
      message: 'MongoDB connection string:',
      required: true
    },
    {
      name: 'SECRET',
      message: 'JWT secret key:',
      default: () => require('crypto').randomBytes(32).toString('hex')
    },
    {
      name: 'ADMIN_SECRET',
      message: 'Admin signup secret code:',
      default: () => require('crypto').randomBytes(8).toString('hex')
    }
  ];

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(`${question.message} `, (answer) => {
        if (!answer && question.required) {
          console.log('This field is required. Please provide a value.');
          resolve(askQuestion(question));
        } else {
          resolve(answer || question.default);
        }
      });
    });
  };

  (async () => {
    const answers = {};
    
    for (const question of envQuestions) {
      if (typeof question.default === 'function') {
        question.default = question.default();
      }
      
      answers[question.name] = await askQuestion(question);
    }
    
    const envContent = Object.entries(answers)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    
    // Continue with dependency check and server start
    checkDependencies();
  })();
} else {
  // Check existing .env file
  require('dotenv').config();
  
  // Validate required variables
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please update your .env file with these variables.');
    
    rl.question('Do you want to update your .env file now? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        // Read existing .env
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n');
        const envVars = {};
        
        // Parse existing variables
        envLines.forEach(line => {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            envVars[match[1]] = match[2];
          }
        });
        
        // Add missing variables
        const askMissingVars = async () => {
          for (const varName of missingVars) {
            const defaultValue = varName === 'PORT' ? '4000' : 
                               varName === 'SECRET' ? require('crypto').randomBytes(32).toString('hex') : '';
            
            const value = await new Promise(resolve => {
              rl.question(`${varName} (${defaultValue ? `default: ${defaultValue}` : 'required'}): `, answer => {
                resolve(answer || defaultValue);
              });
            });
            
            envVars[varName] = value;
          }
          
          // Write updated .env file
          const newEnvContent = Object.entries(envVars)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
          
          fs.writeFileSync(envPath, newEnvContent);
          console.log('✅ .env file updated successfully!');
          
          // Continue with dependency check and server start
          checkDependencies();
        };
        
        askMissingVars();
      } else {
        console.log('Please update your .env file manually and try again.');
        rl.close();
        process.exit(1);
      }
    });
  } else {
    // Continue with dependency check and server start
    checkDependencies();
  }
}

// Check and install dependencies
function checkDependencies() {
  console.log('📦 Checking for required dependencies...');
  
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
  
  // Read package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found!');
    rl.close();
    process.exit(1);
  }
  
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    rl.close();
    process.exit(1);
  }
  
  // Check for missing dependencies
  const installedDeps = Object.keys(packageJson.dependencies || {});
  const missingPackages = requiredPackages.filter(pkg => !installedDeps.includes(pkg));
  
  // Install missing dependencies if any
  if (missingPackages.length > 0) {
    console.log(`🔍 Missing dependencies detected: ${missingPackages.join(', ')}`);
    rl.question('Install missing dependencies? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('🔧 Installing missing dependencies...');
        
        try {
          execSync(`npm install --save ${missingPackages.join(' ')}`, { 
            stdio: 'inherit',
            cwd: __dirname
          });
          console.log('✅ Dependencies installed successfully!');
          startServer();
        } catch (error) {
          console.error('❌ Failed to install dependencies:', error.message);
          rl.close();
          process.exit(1);
        }
      } else {
        console.log('❌ Cannot start server without required dependencies.');
        rl.close();
        process.exit(1);
      }
    });
  } else {
    console.log('✅ All required dependencies are installed.');
    startServer();
  }
}

// Start the server
function startServer() {
  console.log('🚀 Starting the server...');
  rl.close();
  require('./server');
}
