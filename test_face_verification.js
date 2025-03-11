// Test client for face verification
const { spawn } = require('child_process');
const { createCanvas } = require('canvas');
const fs = require('fs');

// Function to directly test the Python face verification
function verifyFaceWithPython(imageData) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', ['./server/face_verification.py']);
    let outputData = '';
    let errorData = '';

    // Send input to the script
    pythonProcess.stdin.write(imageData);
    pythonProcess.stdin.end();

    // Collect output from the script
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect error output from the script
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse the JSON result
          const result = JSON.parse(outputData.trim());
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}. Output: ${outputData}`));
        }
      } else {
        reject(new Error(`Python script exited with code ${code}: ${errorData}`));
      }
    });
  });
}

// Function to generate a test face image
async function generateTestFaceImage() {
  // Create a simple canvas with a "face-like" circle
  const width = 400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Draw "face"
  ctx.fillStyle = '#ffd0b0';
  ctx.beginPath();
  ctx.arc(width/2, height/2, 150, 0, Math.PI * 2);
  ctx.fill();

  // Draw "eyes"
  ctx.fillStyle = '#404040';
  ctx.beginPath();
  ctx.arc(width/2 - 50, height/2 - 30, 20, 0, Math.PI * 2);
  ctx.arc(width/2 + 50, height/2 - 30, 20, 0, Math.PI * 2);
  ctx.fill();

  // Draw "mouth"
  ctx.beginPath();
  ctx.arc(width/2, height/2 + 50, 70, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.lineWidth = 10;
  ctx.stroke();

  // Save the image to a file for reference
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync('./test_face.jpg', buffer);
  
  // Return as base64
  return buffer.toString('base64');
}

// Run the test
async function runTest() {
  try {
    console.log('Generating test face image...');
    const imageBase64 = await generateTestFaceImage();
    
    console.log('Verifying face with Python script...');
    const result = await verifyFaceWithPython(imageBase64);
    
    console.log('Face verification result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Face verification successful!');
      console.log(`Confidence score: ${result.confidence}`);
      if (result.results) {
        console.log('Extracted attributes:');
        console.log(`- Age: ${result.results.age}`);
        console.log(`- Gender: ${result.results.gender}`);
        console.log(`- Dominant race: ${result.results.dominant_race}`);
        console.log(`- Dominant emotion: ${result.results.dominant_emotion}`);
      }
    } else {
      console.log('\n❌ Face verification failed!');
      console.log(`Confidence score: ${result.confidence}`);
      console.log(`Message: ${result.message}`);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests
runTest();