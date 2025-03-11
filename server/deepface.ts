import { spawn } from 'child_process';

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

/**
 * Helper function to save a base64 image to a temporary file
 */
async function runPythonScript(scriptPath: string, input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath]);
    let outputData = '';
    let errorData = '';

    // Send input to the script
    pythonProcess.stdin.write(input);
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
        resolve(outputData.trim());
      } else {
        reject(new Error(`Python script exited with code ${code}: ${errorData}`));
      }
    });
  });
}

/**
 * Verifies if an image contains a human face
 * @param imageBase64 Base64 encoded image data
 * @returns Promise with verification result
 */
export async function verifyFace(imageBase64: string): Promise<FaceVerificationResult> {
  try {
    // Run the Python script with the image data
    const result = await runPythonScript('./server/face_verification.py', imageBase64);
    
    // Parse the JSON result
    const verificationResult = JSON.parse(result) as FaceVerificationResult;
    return verificationResult;
  } catch (error) {
    console.error('Face verification error:', error);
    return {
      success: false,
      confidence: 0,
      message: 'Error running face verification',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}