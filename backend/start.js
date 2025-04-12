/**
 * Simple start script that runs dependency and JSON checks before starting the server
 */

// First run the package.json fixer
try {
  require('./scripts/fix-package-json');
  // Then check dependencies
  require('./scripts/check-deps');
  // Finally start the server
  require('./server');
} catch (error) {
  console.error('Error during startup:', error);
  process.exit(1);
}
