const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// For Node.js >=18, we can use the built-in fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3001';

// Function to generate a test face image
async function generateTestFaceImage() {
  return new Promise((resolve, reject) => {
    console.log('Generating test face image...');
    // Generate a simple face-like image
    const pythonProcess = spawn('python3', ['./server/face_verification.py', '--generate-test-image']);
    
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Read the image file
          const imageBuffer = fs.readFileSync('./test_face.jpg');
          const base64Image = imageBuffer.toString('base64');
          resolve(base64Image);
        } catch (error) {
          reject(new Error(`Failed to read test image: ${error.message}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}: ${errorData}`));
      }
    });
  });
}

// Function to test the API
async function testAPI() {
  try {
    console.log('Starting API test...');
    
    // 1. Test server is running
    console.log('Testing server connection...');
    const healthResponse = await fetch(`${API_BASE_URL}/healthcheck`);
    if (!healthResponse.ok) {
      throw new Error(`Server health check failed with status: ${healthResponse.status}`);
    }
    console.log('✅ Server is running!');
    
    // 2. Test registration
    console.log('Testing user registration...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    };
    
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!registerResponse.ok) {
      const registerError = await registerResponse.json();
      console.log('❌ Registration failed:', registerError);
      
      if (registerError.error === 'Username already exists') {
        console.log('User already exists. Trying to login instead...');
      } else {
        throw new Error(`Registration failed: ${registerError.error}`);
      }
    } else {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful!', registerData.user.id);
    }
    
    // 3. Test login
    console.log('Testing user login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'Password123'
      })
    });
    
    if (!loginResponse.ok) {
      const loginError = await loginResponse.json();
      throw new Error(`Login failed: ${loginError.error}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful!', loginData.user.id);
    
    // Extract cookies from login response for session
    const cookies = loginResponse.headers.get('set-cookie');
    
    // 4. Test face verification
    console.log('Testing face verification...');
    const imageBase64 = await generateTestFaceImage();
    
    const verifyResponse = await fetch(`${API_BASE_URL}/api/verification/face`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ imageBase64 })
    });
    
    if (!verifyResponse.ok) {
      const verifyError = await verifyResponse.json();
      throw new Error(`Face verification failed: ${verifyError.error}`);
    }
    
    const verifyData = await verifyResponse.json();
    console.log('✅ Face verification result:', verifyData);
    
    if (verifyData.success) {
      console.log(`✅ Verification confidence: ${verifyData.confidence * 100}%`);
      if (verifyData.results) {
        console.log('✅ Detected attributes:');
        console.log(`- Age: ${verifyData.results.age}`);
        console.log(`- Gender: ${verifyData.results.gender}`);
        console.log(`- Dominant race: ${verifyData.results.dominant_race}`);
        console.log(`- Dominant emotion: ${verifyData.results.dominant_emotion}`);
      }
    } else {
      console.log('❌ Verification failed:', verifyData.message);
    }
    
    // 5. Test current user retrieval
    console.log('Testing current user retrieval...');
    const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Cookie': cookies }
    });
    
    if (!userResponse.ok) {
      const userError = await userResponse.json();
      throw new Error(`Getting current user failed: ${userError.error}`);
    }
    
    const userData2 = await userResponse.json();
    console.log('✅ Current user:', userData2.user.id);
    console.log('✅ Is verified:', userData2.user.isVerified);
    
    console.log('✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testAPI();