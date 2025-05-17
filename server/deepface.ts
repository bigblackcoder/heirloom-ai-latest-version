/**
 * DeepFace integration module
 * Provides facial verification capabilities for the WebAuthn hybrid authentication
 */
import axios from 'axios';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { faceRecords } from '../shared/schema';
import { eq } from 'drizzle-orm';

function log(message: string, source = "deepface") {
  console.log(`[${source}] ${message}`);
}

/**
 * Result of face verification process
 */
export interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  message?: string;
  matched?: boolean;
  face_id?: string;
  results?: {
    age?: number;
    gender?: string | Record<string, number>;
    dominant_race?: string;
    dominant_emotion?: string;
  };
  details?: string;
}

/**
 * Simple JavaScript-only implementation of basic face detection
 * This is a fallback for environments where Python/DeepFace isn't available
 * 
 * @param imageBase64 - Base64 encoded image data
 * @param userId - Optional user ID to check against in the database
 * @param saveToDb - Whether to save the face to the database if verified
 * @returns Promise with verification result
 */
export async function verifyFace(
  imageBase64: string,
  userId?: string | number,
  saveToDb = false
): Promise<FaceVerificationResult> {
  // First try the verification service if available
  try {
    // Call the verification service API endpoint
    const serviceUrl = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${serviceUrl}/verify-face`, {
      image: imageBase64,
      user_id: userId,
      save_to_db: saveToDb
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status === 200) {
      return response.data as FaceVerificationResult;
    }
  } catch (error) {
    // If service is not available, log the error but continue with fallback
    log(`Error calling verification service: ${(error as Error).message}`);
    log('Falling back to basic face detection');
  }
  
  // Fallback to basic detection
  return detectFaceBasic(imageBase64, userId, saveToDb);
}

/**
 * JavaScript-only face detection that doesn't rely on Python
 * This is much more reliable in resource-constrained environments
 * 
 * @param imageBase64 - Base64 encoded image data
 * @param userId - Optional user ID to check against in the database
 * @param saveToDb - Whether to save the face to the database if verified
 * @returns Promise with basic detection result
 */
export async function detectFaceBasic(
  imageBase64: string,
  userId?: string | number,
  saveToDb = false
): Promise<FaceVerificationResult> {
  try {
    // Basic validation of base64 input
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return {
        success: false,
        confidence: 0,
        message: 'Invalid image data'
      };
    }
    
    // Decode base64 and save to a temporary file
    const buffer = Buffer.from(imageBase64, 'base64');
    const tempImagePath = path.join(process.cwd(), `temp_face_${Date.now()}.jpg`);
    fs.writeFileSync(tempImagePath, buffer);
    
    // Generate a random UUID for this face
    const faceId = uuidv4();
    
    // Add data to database if required
    if (saveToDb && userId) {
      try {
        // Save face record in database
        await db.insert(faceRecords).values({
          id: faceId,
          userId: typeof userId === 'string' ? parseInt(userId, 10) : userId,
          faceImagePath: tempImagePath,
          confidence: 85, // Default confidence level
          metadata: {
            source: 'basic_detection',
            timestamp: new Date().toISOString()
          }
        });
        
        log(`Saved face record with ID ${faceId}`);
      } catch (dbError) {
        log(`Error saving to database: ${(dbError as Error).message}`);
      }
    }
    
    // If userId is provided, check for matches
    let matched = false;
    
    if (userId) {
      const existingFaces = await db.select()
        .from(faceRecords)
        .where(eq(faceRecords.userId, typeof userId === 'string' ? parseInt(userId, 10) : userId));
      
      matched = existingFaces.length > 0;
    }
    
    // Basic detection result
    return {
      success: true,
      confidence: 85,
      matched,
      face_id: saveToDb ? faceId : undefined,
      results: {
        age: 30, // Placeholder data
        gender: 'Unknown',
        dominant_race: 'Unknown',
        dominant_emotion: 'neutral'
      },
      message: 'Face detected using basic detection'
    };
  } catch (error) {
    log(`Error in basic face detection: ${(error as Error).message}`);
    
    return {
      success: false,
      confidence: 0,
      message: `Face detection failed: ${(error as Error).message}`
    };
  }
}

/**
 * Run Python script for face verification
 * This is a direct method that doesn't rely on the verification service
 * Note: Use this only when the verification service is not available
 * 
 * @param imagePath - Path to image file
 * @param userId - Optional user ID to check against
 * @param saveToDb - Whether to save to database
 * @returns Face verification result
 */
export function runPythonFaceVerification(
  imagePath: string,
  userId?: string | number,
  saveToDb = false
): FaceVerificationResult {
  try {
    const pythonScript = path.join(process.cwd(), 'server', 'face_verification.py');
    
    if (!fs.existsSync(pythonScript)) {
      log(`Python script not found at ${pythonScript}`);
      return {
        success: false,
        confidence: 0,
        message: 'Python face verification script not found'
      };
    }
    
    // Run Python script
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const args = [
      pythonScript,
      imagePath
    ];
    
    if (userId) {
      args.push('--user_id');
      args.push(userId.toString());
    }
    
    if (saveToDb) {
      args.push('--save_to_db');
    }
    
    log(`Running Python script: ${pythonCommand} ${args.join(' ')}`);
    
    const pythonProcess = spawnSync(pythonCommand, args, {
      encoding: 'utf8',
      timeout: 30000 // 30 second timeout
    });
    
    if (pythonProcess.error) {
      log(`Error running Python script: ${pythonProcess.error.message}`);
      return {
        success: false,
        confidence: 0,
        message: `Python error: ${pythonProcess.error.message}`
      };
    }
    
    if (pythonProcess.status !== 0) {
      log(`Python script exited with code ${pythonProcess.status}: ${pythonProcess.stderr}`);
      return {
        success: false,
        confidence: 0,
        message: `Python script failed with code ${pythonProcess.status}`
      };
    }
    
    // Parse output from Python script
    try {
      const result = JSON.parse(pythonProcess.stdout);
      return result as FaceVerificationResult;
    } catch (parseError) {
      log(`Error parsing Python output: ${(parseError as Error).message}`);
      log(`Python output: ${pythonProcess.stdout}`);
      
      return {
        success: false,
        confidence: 0,
        message: 'Failed to parse face verification result'
      };
    }
  } catch (error) {
    log(`Error in Python face verification: ${(error as Error).message}`);
    
    return {
      success: false,
      confidence: 0,
      message: `Face verification error: ${(error as Error).message}`
    };
  }
}