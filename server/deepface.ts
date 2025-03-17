import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { log } from './vite';

/**
 * Result of face verification process
 */
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
 * Verifies a face using the Python DeepFace library
 * @param imageBase64 - Base64 encoded image data
 * @returns Promise with verification result
 */
export async function verifyFace(imageBase64: string): Promise<FaceVerificationResult> {
  return new Promise<FaceVerificationResult>((resolve) => {
    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // Create a temporary file for the captured face
      const tempFilename = `temp_face_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
      const tempFilePath = path.join(process.cwd(), tempFilename);
      
      // Write base64 data to temporary file
      fs.writeFileSync(tempFilePath, base64Data, { encoding: 'base64' });
      
      // Create a Python script to call face verification
      const scriptPath = path.join(process.cwd(), 'server', 'face_verification.py');
      const pythonCommand = `python3 ${scriptPath} "${tempFilePath}"`;
      
      log(`Executing face verification with Python: ${pythonCommand}`);
      
      // Execute the Python script
      exec(pythonCommand, (error, stdout, stderr) => {
        try {
          // Clean up the temporary file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          
          if (error) {
            log(`Face verification error: ${error.message}`);
            log(`Stderr: ${stderr}`);
            
            // Try fallback to basic detection if DeepFace fails
            return resolve({
              success: false,
              confidence: 0,
              message: 'Face verification failed with an error',
              details: error.message
            });
          }
          
          const result = JSON.parse(stdout.trim());
          log(`Face verification result: ${JSON.stringify(result)}`);
          
          return resolve({
            success: result.success,
            confidence: result.confidence || 0,
            message: result.message,
            results: result.results || {}
          });
        } catch (parseError) {
          log(`Error parsing face verification result: ${parseError}`);
          return resolve({
            success: false,
            confidence: 0,
            message: 'Error processing face verification result',
            details: `${parseError}`
          });
        }
      });
    } catch (error) {
      log(`Face verification processing error: ${error}`);
      return resolve({
        success: false,
        confidence: 0,
        message: 'Error processing face data',
        details: `${error}`
      });
    }
  });
}

/**
 * Fallback method for basic face detection
 * @param imageBase64 - Base64 encoded image data
 * @returns Promise with basic detection result
 */
export async function detectFaceBasic(imageBase64: string): Promise<FaceVerificationResult> {
  // This function could implement a simpler detection method if DeepFace fails
  // For now, it delegates to the main verification method
  return verifyFace(imageBase64);
}