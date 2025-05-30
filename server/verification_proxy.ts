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
    gender?: string | Record<string, number>;
    dominant_race?: string;
    dominant_emotion?: string;
  };
  details?: string;
  error?: string;
  error_code?: string;
  errors?: {
    primary: string;
    fallback: string;
  };
  timestamp?: string;
}

// Configuration for the verification service
const VERIFICATION_SERVICE_URL = process.env.VERIFICATION_SERVICE_URL || 'http://127.0.0.1:8000';
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
    
    // In development, try to connect to existing service first
    if (process.env.NODE_ENV !== 'production') {
      const checkUrl = 'http://127.0.0.1:8000/api/verification/status';
      console.log(`Checking for existing service at ${checkUrl}`);
      axios.get(checkUrl, { timeout: 2000 })
        .then((response) => {
          console.log('Found existing verification service running:', response.data);
          resolve();
          return;
        })
        .catch((error) => {
          console.log('No existing verification service found:', error.message);
          startNewService();
        });
    } else {
      startNewService();
    }
    
    function startNewService() {

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
      shell: true,
      env: { ...process.env },
      cwd: path.join(process.cwd(), 'verification_service'),
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
    
    // Wait for the service to start with improved timing
    let retries = 0;
    const maxRetries = 15; // Reduced retries since service starts faster
    const checkInterval = 1000; // Faster checks
    
    const checkServiceStatus = async () => {
      try {
        const response = await axios.get(`${VERIFICATION_SERVICE_URL}/api/verification/status`, {
          timeout: 3000 // Shorter timeout for quicker failure detection
        });
        if (response.status === 200 && response.data?.status) {
          console.log('Verification service started successfully');
          resolve();
          return;
        }
      } catch (error) {
        // Service not ready yet
        if (retries < maxRetries) {
          retries++;
          if (retries % 3 === 0) { // Only log every 3rd attempt to reduce noise
            console.log(`Verification service not ready yet, retrying (${retries}/${maxRetries})...`);
          }
          setTimeout(checkServiceStatus, checkInterval);
        } else {
          console.warn(`Verification service failed to start after ${maxRetries} attempts. Continuing without verification service.`);
          // Always resolve to prevent blocking the main application
          resolve();
        }
      }
    };
    
    // Start checking status immediately after process starts
    setTimeout(checkServiceStatus, 2000);
    }
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
  // First check if we can reach the verification service
  try {
    const healthCheck = await axios.get(`${VERIFICATION_SERVICE_URL}/api/verification/status`, {
      timeout: 2000
    });
    
    if (healthCheck.status !== 200) {
      throw new Error('Verification service not available');
    }
  } catch (healthError) {
    console.warn('Verification service not available, falling back to basic detection');
    return await fallbackVerification(request);
  }

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
      timeout: 15000 // Shorter timeout for faster failure
    });
    
    // Process the response
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Verification service responded with status ${response.status}`);
    }
  } catch (error: any) {
    const reqId = request.requestId || `error-${Date.now()}`;
    console.error(`[${reqId}] Verification proxy error:`, error);
    
    // If service is not available, fall back to local verification
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      console.error(`[${reqId}] Verification service not available, falling back to local verification`);
      try {
        // Use fallback method
        return await fallbackVerification(request);
      } catch (fallbackError: any) {
        console.error(`[${reqId}] Fallback verification also failed:`, fallbackError);
        return {
          success: false,
          confidence: 0,
          message: 'Both verification services failed',
          error_code: 'FALLBACK_FAILED',
          error: fallbackError?.message || 'Unknown fallback error',
          debug_session: reqId,
          // Include both errors for debugging
          errors: {
            primary: error?.message || 'Unknown primary error',
            fallback: fallbackError?.message || 'Unknown fallback error'
          }
        };
      }
    }
    
    // If service returned an error response
    if (error?.response) {
      const errorData = error.response.data;
      const statusCode = error.response.status;
      
      // Format error response based on status code
      if (statusCode === 400) {
        return {
          success: false,
          confidence: 0,
          message: 'Invalid verification request',
          error_code: 'BAD_REQUEST',
          error: errorData?.message || 'Bad request parameters',
          debug_session: reqId,
          details: errorData
        };
      } else if (statusCode === 401 || statusCode === 403) {
        return {
          success: false,
          confidence: 0,
          message: 'Authentication required for verification',
          error_code: 'AUTH_ERROR',
          error: errorData?.message || 'Authentication error',
          debug_session: reqId
        };
      } else if (statusCode >= 500) {
        return {
          success: false,
          confidence: 0,
          message: 'Verification service internal error',
          error_code: 'SERVICE_ERROR',
          error: errorData?.message || 'Service error',
          debug_session: reqId,
          details: errorData
        };
      }
      
      // Default error response for other status codes
      return {
        success: false,
        confidence: 0,
        message: errorData?.message || 'Verification service error',
        error_code: `HTTP_${statusCode}`,
        error: JSON.stringify(errorData),
        debug_session: reqId
      };
    }
    
    // Check for specific error types
    if (error instanceof TypeError) {
      return {
        success: false,
        confidence: 0,
        message: 'Type error in verification service',
        error_code: 'TYPE_ERROR',
        error: error.message,
        debug_session: reqId
      };
    }
    
    if (error instanceof SyntaxError) {
      return {
        success: false,
        confidence: 0,
        message: 'Invalid response from verification service',
        error_code: 'SYNTAX_ERROR',
        error: 'The service returned an invalid response format',
        debug_session: reqId,
        details: error.message
      };
    }
    
    // Generic error handling
    return {
      success: false,
      confidence: 0,
      message: `Verification error: ${error?.message || 'Unknown error'}`,
      error_code: 'UNKNOWN_ERROR',
      error: error?.message || 'Unknown error',
      debug_session: reqId,
      timestamp: new Date().toISOString()
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
      typeof request.userId === 'number' ? request.userId : undefined,
      request.saveToDb
    );
    
    // Create a properly typed result with debug_session
    return {
      ...result,
      debug_session: request.requestId || (result as any).debug_session || `fallback-${Date.now()}`
    };
  } catch (error: any) {
    return {
      success: false,
      confidence: 0,
      message: `Fallback verification error: ${error?.message || 'Unknown error'}`,
      error: error?.message || 'Unknown error',
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
    
    // Read the file and convert to Buffer
    const fileBuffer = fs.readFileSync(videoFile);
    
    // Use Uint8Array for better compatibility with FormData in Node.js
    const uint8Array = new Uint8Array(fileBuffer);
    const file = new File([uint8Array], path.basename(videoFile), {
      type: 'video/webm'
    });
    formData.append('file', file);
    
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
  } catch (error: any) {
    // Handle errors
    console.error('Video verification error:', error);
    
    return {
      success: false,
      confidence: 0,
      message: `Video verification error: ${error?.message || 'Unknown error'}`,
      error: error?.message || 'Unknown error',
      debug_session: `video-error-${Date.now()}`
    };
  }
}

// Start the verification service on module load
// Temporarily disabled for debugging auth issues
// startVerificationService().catch(error => {
//   console.error('Failed to start verification service:', error);
// });

// Handle process exit
process.on('exit', () => {
  stopVerificationService();
});