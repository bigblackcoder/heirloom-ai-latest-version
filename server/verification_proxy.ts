/**
 * Proxy module for the Python-based face verification service
 * This acts as a bridge between the Express backend and the FastAPI verification service
 */

import axios, { AxiosResponse } from 'axios';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Interface for the verification request
export interface FaceVerificationRequest {
  image: string;
  userId?: string | number;
  saveToDb?: boolean;
  requestId?: string;
  checkDbOnly?: boolean;
  useBasicDetection?: boolean;
}

// Interface for the verification response
export interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  message?: string;
  matched?: boolean;
  face_id?: string;
  debug_session?: string;
  results?: {
    age?: number;
    gender?: string;
    dominant_race?: string;
    dominant_emotion?: string;
  };
  details?: string;
  error?: string;
}

// Configuration for the verification service
const VERIFICATION_SERVICE_URL = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:8000';
const VERIFICATION_PROCESS_TIMEOUT = 30000; // 30 seconds
let verificationProcess: ChildProcess | null = null;

/**
 * Starts the Python-based verification service as a subprocess
 * @returns Promise that resolves when the service is ready
 */
export async function startVerificationService(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Don't start if already running
    if (verificationProcess) {
      console.log('Verification service already running');
      resolve();
      return;
    }

    console.log('Starting Python-based face verification service...');
    
    // Path to the start script
    const scriptPath = path.join(process.cwd(), 'verification_service', 'start.sh');
    
    // Make sure the script exists and is executable
    if (!fs.existsSync(scriptPath)) {
      reject(new Error(`Verification service start script not found at ${scriptPath}`));
      return;
    }
    
    // Start the service
    verificationProcess = spawn(scriptPath, [], {
      stdio: 'inherit',
      shell: false,
      env: { ...process.env },
    });
    
    // Handle process events
    verificationProcess.on('error', (error) => {
      console.error('Failed to start verification service:', error);
      verificationProcess = null;
      reject(error);
    });
    
    verificationProcess.on('exit', (code, signal) => {
      console.log(`Verification service exited with code ${code} and signal ${signal}`);
      verificationProcess = null;
      
      // Only reject if exited unexpectedly during startup
      if (code !== 0) {
        reject(new Error(`Verification service exited with code ${code}`));
      }
    });
    
    // Wait for the service to start
    let retries = 0;
    const maxRetries = process.env.NODE_ENV === 'production' ? 30 : 10; // More retries in production
    const checkInterval = process.env.NODE_ENV === 'production' ? 2000 : 1000; // Longer interval in production
    
    const checkServiceStatus = async () => {
      try {
        const response = await axios.get(`${VERIFICATION_SERVICE_URL}/api/verification/status`, {
          timeout: 5000 // 5 second timeout for the request
        });
        if (response.status === 200) {
          console.log('Verification service started successfully');
          resolve();
          return;
        }
      } catch (error) {
        // Service not ready yet
        if (retries < maxRetries) {
          retries++;
          console.log(`Verification service not ready yet, retrying (${retries}/${maxRetries})...`);
          setTimeout(checkServiceStatus, checkInterval);
        } else {
          const err = new Error(`Verification service failed to start within timeout period after ${maxRetries} attempts`);
          console.error(err);
          
          // In production, resolve anyway to prevent blocking app startup
          if (process.env.NODE_ENV === 'production') {
            console.warn('Continuing application startup without verification service in production');
            resolve();
          } else {
            reject(err);
          }
        }
      }
    };
    
    // Give the service a moment to start, then check status
    setTimeout(checkServiceStatus, 2000);
  });
}

/**
 * Stops the verification service if it's running
 */
export function stopVerificationService(): void {
  if (verificationProcess) {
    console.log('Stopping verification service...');
    verificationProcess.kill();
    verificationProcess = null;
  }
}

/**
 * Verifies a face using the FastAPI service
 * @param request Face verification request
 * @returns Promise with verification result
 */
export async function verifyFace(request: FaceVerificationRequest): Promise<FaceVerificationResult> {
  try {
    // Try to reach the verification service
    const serviceUrl = `${VERIFICATION_SERVICE_URL}/api/verification/face`;
    
    // Prepare request data
    const requestBody = {
      image: request.image,
      user_id: request.userId,
      save_to_db: request.saveToDb || false,
      request_id: request.requestId,
      check_db_only: request.checkDbOnly || false,
      use_basic_detection: request.useBasicDetection || false
    };
    
    // Make request to the service
    const response: AxiosResponse = await axios.post(serviceUrl, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: VERIFICATION_PROCESS_TIMEOUT
    });
    
    // Process the response
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Verification service responded with status ${response.status}`);
    }
  } catch (error) {
    // If service is not available, fall back to local verification
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Verification service not available, falling back to local verification');
      // Use fallback method
      return fallbackVerification(request);
    }
    
    // If service returned an error response
    if (error.response) {
      const errorData = error.response.data;
      return {
        success: false,
        confidence: 0,
        message: errorData.message || 'Verification service error',
        error: JSON.stringify(errorData),
        debug_session: request.requestId || `error-${Date.now()}`
      };
    }
    
    // Generic error handling
    return {
      success: false,
      confidence: 0,
      message: `Verification error: ${error.message}`,
      error: error.message,
      debug_session: request.requestId || `error-${Date.now()}`
    };
  }
}

/**
 * Fallback verification method when FastAPI service is unavailable
 * Uses the existing Node.js verification methods
 * @param request Face verification request
 * @returns Promise with verification result
 */
async function fallbackVerification(request: FaceVerificationRequest): Promise<FaceVerificationResult> {
  try {
    // Import the local verification module using dynamic import
    const deepfaceModule = await import('./deepface.js');
    const { detectFaceBasic } = deepfaceModule;
    
    // Use the basic detection method
    const result = await detectFaceBasic(
      request.image,
      request.userId?.toString(),
      request.saveToDb
    );
    
    return {
      ...result,
      debug_session: request.requestId || result.debug_session || `fallback-${Date.now()}`
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      message: `Fallback verification error: ${error.message}`,
      error: error.message,
      debug_session: request.requestId || `fallback-error-${Date.now()}`
    };
  }
}

/**
 * Verifies a video for liveness detection
 * @param videoFile Path to the video file
 * @param userId Optional user ID to check against
 * @param saveToDb Whether to save the face to the database
 * @returns Promise with verification result
 */
export async function verifyVideo(
  videoFile: string,
  userId?: string | number,
  saveToDb: boolean = false
): Promise<FaceVerificationResult> {
  try {
    // Create a form with the video file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(videoFile));
    
    if (userId) {
      formData.append('user_id', userId.toString());
    }
    
    formData.append('save_to_db', saveToDb.toString());
    formData.append('request_id', `video-verify-${Date.now()}`);
    
    // Make request to the service
    const serviceUrl = `${VERIFICATION_SERVICE_URL}/api/verification/video`;
    const response: AxiosResponse = await axios.post(serviceUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000  // 60 seconds for video processing
    });
    
    // Process the response
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Video verification failed with status ${response.status}`);
    }
  } catch (error) {
    // Handle errors
    console.error('Video verification error:', error);
    
    return {
      success: false,
      confidence: 0,
      message: `Video verification error: ${error.message}`,
      error: error.message,
      debug_session: `video-error-${Date.now()}`
    };
  }
}

// Start the verification service on module load
startVerificationService().catch(error => {
  console.error('Failed to start verification service:', error);
});

// Handle process exit
process.on('exit', () => {
  stopVerificationService();
});