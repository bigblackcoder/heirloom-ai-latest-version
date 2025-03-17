// A simple Node.js script to test the face verification API

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_HOST = 'localhost';
const API_PORT = 5000;
const API_PATH = '/api/verification/face';
const IMAGE_PATH = path.join(__dirname, 'sample_face.jpg');
const USER_ID = 1;

// Read the image file
console.log(`Reading image file: ${IMAGE_PATH}`);
const imageBuffer = fs.readFileSync(IMAGE_PATH);
const base64Image = imageBuffer.toString('base64');
const imageData = `data:image/jpeg;base64,${base64Image}`;

// Prepare the request options
const requestOptions = {
  hostname: API_HOST,
  port: API_PORT,
  path: API_PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

// Test function to make the request
function makeRequest(saveToDb, callback) {
  const postData = JSON.stringify({
    image: imageData,
    userId: USER_ID,
    saveToDb
  });

  const req = http.request(requestOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(responseData);
        callback(null, parsedData);
      } catch (e) {
        callback(e, null);
      }
    });
  });
  
  req.on('error', (error) => {
    callback(error, null);
  });
  
  req.write(postData);
  req.end();
}

// Run tests
console.log('Test 1: Verifying and saving face to database');
makeRequest(true, (error, response) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log('Response:', JSON.stringify(response, null, 2));
  
  console.log('\nWaiting for database to update...');
  setTimeout(() => {
    console.log('\nTest 2: Verifying face against database');
    makeRequest(false, (error, response) => {
      if (error) {
        console.error('Error:', error.message);
        return;
      }
      
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('\nTest complete!');
    });
  }, 1000);
});