import { spawn } from 'child_process';
import path from 'path';

export interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  message?: string;
  results?: {
    age?: number;
    gender?: string;
    dominant_race?: string;
    dominant_emotion?: string;
  };
  details?: string;
}

export async function verifyFace(imageBase64: string): Promise<FaceVerificationResult> {
  return new Promise((resolve, reject) => {
    // Path to the Python script (relative to server directory)
    const scriptPath = path.join(__dirname, 'face_verification.py');
    
    // Spawn the Python process
    const pythonProcess = spawn('python3', [scriptPath]);
    
    let dataReceived = '';
    let errorReceived = '';
    
    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      dataReceived += data.toString();
    });
    
    // Collect errors from stderr
    pythonProcess.stderr.on('data', (data) => {
      errorReceived += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error: ${errorReceived}`);
        resolve({
          success: false,
          confidence: 0,
          message: `Python process failed with code ${code}`,
          details: errorReceived
        });
        return;
      }
      
      try {
        // Parse the JSON output from the Python script
        const result = JSON.parse(dataReceived);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', error);
        console.error('Raw output:', dataReceived);
        resolve({
          success: false,
          confidence: 0,
          message: 'Failed to parse Python output',
          details: dataReceived
        });
      }
    });
    
    // Handle errors in the spawned process
    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      resolve({
        success: false,
        confidence: 0,
        message: `Failed to start Python process: ${error.message}`
      });
    });
    
    // Send the base64 image data to the Python script
    const inputData = JSON.stringify({ image: imageBase64 });
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();
  });
}