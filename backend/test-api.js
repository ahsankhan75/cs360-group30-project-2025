// Simple script to test the blood requests API
const fetch = require('node-fetch');

async function testBloodRequestsAPI() {
  try {
    console.log('Testing blood requests API...');
    const response = await fetch(`http://localhost:${process.env.PORT || 4000}/api/blood-requests`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} blood requests`);
    console.log('First request:', data[0]);
    
    return data;
  } catch (error) {
    console.error('Error testing blood requests API:', error);
    throw error;
  }
}

// Run the test
testBloodRequestsAPI()
  .then(data => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
