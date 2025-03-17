// Simple test script for face verification API
import http from 'http';

// Make a simple test request that doesn't use DeepFace or large images
const test = () => {
  console.log('=== Simple Face Verification Test (Lightweight Mode) ===');
  
  // Create test request data with test mode enabled
  const requestData = JSON.stringify({
    // Skip sending actual image data
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==',
    useBasicDetection: true,  // Force basic detection
    checkDbOnly: true        // Just return test data
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/verification/face',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': requestData.length
    }
  };
  
  console.log('Making test request...');
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('--- API Response ---');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('✅ API is working correctly in test mode');
        } else {
          console.log(`❌ API test failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
      console.log('=== Test complete ===');
    });
  });
  
  req.on('error', (error) => {
    console.error(`Error making request: ${error.message}`);
  });
  
  req.write(requestData);
  req.end();
};

// Run the test
test();