#!/usr/bin/env node

/**
 * Test script for the face verification API
 * 
 * Usage:
 *   node test_face_api.js [save_to_db]
 * 
 * Arguments:
 *   save_to_db - Set to 'true' to save the detected face to the database
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// Configuration
const API_URL = 'http://localhost:5000/api/verification/face';
const TEST_IMAGE = 'sample_face.jpg';
const USER_ID = 1;
const TIMEOUT_MS = 60000; // 60 seconds

// Parse command line arguments
const saveToDb = process.argv[2] === 'true';

console.log('\x1b[33;1m=== Face Verification API Test ===\x1b[0m');
console.log(`Save to database: ${saveToDb}`);
console.log(`User ID: ${USER_ID}`);

// Check if test image exists, download it if not
if (!fs.existsSync(TEST_IMAGE)) {
  console.log('\x1b[33;1mTest image not found, downloading sample image...\x1b[0m');
  downloadSampleImage(TEST_IMAGE, () => makeRequest(saveToDb, displayResult));
} else {
  makeRequest(saveToDb, displayResult);
}

/**
 * Read the test image and convert to base64
 * @param {string} imagePath - Path to the image file
 * @returns {string} - Base64 encoded image data
 */
function readTestImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`Error reading image file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Make an HTTP request to the face verification API
 * @param {boolean} saveToDb - Whether to save the face to the database
 * @param {Function} callback - Callback function for the result
 */
function makeRequest(saveToDb, callback) {
  console.log('\x1b[33;1mMaking request to face verification API...\x1b[0m');
  console.log('This may take a while as DeepFace loads models and processes the image.');
  console.log(`Request timeout set to ${TIMEOUT_MS / 1000} seconds.`);

  // Determine if we should use the simplified API test
  const useSimpleTest = process.env.USE_SIMPLE_TEST === 'true';
  
  if (useSimpleTest) {
    console.log('\x1b[33;1mUsing simplified API test...\x1b[39m');
    // This is a lightweight test without image processing
    const reqData = JSON.stringify({
      userId: USER_ID,
      useBasicDetection: true,
      checkDbOnly: true
    });
    
    makeHttpRequest(reqData, callback);
    return;
  }

  // Read and encode the test image
  const imageBase64 = readTestImage(TEST_IMAGE);
  
  // Prepare the request data
  const reqData = JSON.stringify({
    imageData: imageBase64,
    userId: USER_ID,
    saveToDb: saveToDb
  });

  makeHttpRequest(reqData, callback);
}

/**
 * Make the actual HTTP request
 * @param {string} reqData - JSON string of request data
 * @param {Function} callback - Callback function for the response
 */
function makeHttpRequest(reqData, callback) {
  // Options for the HTTP request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': reqData.length
    },
    timeout: TIMEOUT_MS
  };

  // Make the request
  const req = http.request(API_URL, options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        callback(null, result);
      } catch (error) {
        callback(new Error(`Failed to parse response: ${error.message}`), null);
      }
    });
  });
  
  req.on('error', (error) => {
    callback(error, null);
  });
  
  req.on('timeout', () => {
    req.destroy();
    callback(new Error(`Request timed out after ${TIMEOUT_MS / 1000} seconds`), null);
  });
  
  req.write(reqData);
  req.end();
}

/**
 * Download a sample image for testing
 * @param {string} outputPath - Where to save the downloaded image
 * @param {Function} callback - Function to call when download is complete
 */
function downloadSampleImage(outputPath, callback) {
  // Public domain sample images
  const sampleImageUrl = 'https://source.unsplash.com/random/300x300/?face';
  
  const file = fs.createWriteStream(outputPath);
  
  https.get(sampleImageUrl, (response) => {
    if (response.statusCode !== 200) {
      fs.unlink(outputPath, () => {});
      console.error(`Failed to download image: ${response.statusCode}`);
      process.exit(1);
    }
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close(() => {
        console.log(`Downloaded sample image to ${outputPath}`);
        callback();
      });
    });
  }).on('error', (error) => {
    fs.unlink(outputPath, () => {});
    console.error(`Error downloading image: ${error.message}`);
    process.exit(1);
  });
}

/**
 * Display the result of the API request
 * @param {Error} error - Error object if request failed
 * @param {Object} result - Result object from the API
 */
function displayResult(error, result) {
  if (error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
    process.exit(1);
  }
  
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\x1b[32mFace verification successful!\x1b[0m');
    
    if (result.matched) {
      console.log(`\x1b[32mFace matched with confidence: ${result.confidence.toFixed(2)}%\x1b[0m`);
      console.log(`Face ID: ${result.face_id}`);
    } else {
      console.log(`\x1b[33mFace verified but no match found. Confidence: ${result.confidence.toFixed(2)}%\x1b[0m`);
      
      if (result.face_id) {
        console.log(`New face ID: ${result.face_id}`);
      }
    }
    
    if (result.results) {
      console.log('\nDetected attributes:');
      if (result.results.age) console.log(`  Age: ~${result.results.age} years`);
      if (result.results.gender) console.log(`  Gender: ${typeof result.results.gender === 'string' ? result.results.gender : Object.keys(result.results.gender).reduce((a, b) => result.results.gender[a] > result.results.gender[b] ? a : b)}`);
      if (result.results.dominant_race) console.log(`  Dominant race: ${result.results.dominant_race}`);
      if (result.results.dominant_emotion) console.log(`  Dominant emotion: ${result.results.dominant_emotion}`);
    }
  } else {
    console.log(`\x1b[31mFace verification failed: ${result.message}\x1b[0m`);
  }
  
  console.log('\x1b[33m=== Test complete ===\x1b[0m');
}