// Simple test script for face verification API
import fs from 'fs';
import http from 'http';

// Configuration
const API_URL = 'http://localhost:5000/api/verification/face';
const TEST_IMAGE = './attached_assets/heirloom_white.png';
const USER_ID = 1;

console.log('=== Simple Face Verification Test ===');
console.log(`Using test image: ${TEST_IMAGE}`);

// Read the test image file
try {
  const imageBuffer = fs.readFileSync(TEST_IMAGE);
  const imageBase64 = imageBuffer.toString('base64');
  
  // Make simplified request with basic detection
  const requestData = JSON.stringify({
    image: `data:image/png;base64,${imageBase64}`,
    useBasicDetection: true,
    checkDbOnly: false,
    userId: USER_ID
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
  
  console.log('Making request to API with basic detection mode...');
  
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
          console.log('✅ Face verification successful!');
          if (response.matched) {
            console.log(`✅ Face matched with confidence: ${response.confidence}%`);
            console.log(`Face ID: ${response.face_id}`);
          } else {
            console.log(`❌ Face verified but no match found. Confidence: ${response.confidence}%`);
          }
        } else {
          console.log(`❌ Face verification failed: ${response.message}`);
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
  
} catch (error) {
  console.error(`Error reading image file: ${error.message}`);
}