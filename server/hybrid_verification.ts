
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { verifyFace } from './deepface';
import { recordVerificationOnBlockchain } from './blockchain-verification';
import { Request, Response } from 'express';

/**
 * Hybrid Verification Service
 * Combines DeepFace with native biometric verification
 */

interface VerificationResult {
  success: boolean;
  verified: boolean;
  confidence: number;
  method: string;
  message?: string;
  details?: any;
  blockchain_data?: any;
}

/**
 * Handle verification using DeepFace
 */
export async function handleDeepFaceVerification(req: Request, res: Response) {
  try {
    const userId = req.body.user_id;
    const imageData = req.file?.buffer.toString('base64') || req.body.image_data;
    
    if (!userId || !imageData) {
      return res.status(400).json({
        success: false,
        error: 'User ID and image data are required'
      });
    }
    
    // Call DeepFace verification
    const result = await verifyFace(
      `data:image/jpeg;base64,${imageData}`, 
      parseInt(userId), 
      false // Do not save new face, just verify
    );
    
    return res.json({
      success: true,
      verified: result.success,
      confidence: result.confidence,
      method: 'DeepFace',
      model: 'hybrid',
      distance: result.confidence ? (100 - result.confidence) / 100 : 1.0,
      threshold: 0.6,
      blockchain_data: result.blockchain_data,
      details: result.results
    });
    
  } catch (error) {
    console.error('DeepFace verification error:', error);
    return res.status(500).json({
      success: false,
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Handle native device verification (Apple FaceID or Google Biometric)
 */
export async function handleNativeVerification(req: Request, res: Response) {
  try {
    const { user_id, platform, auth_token } = req.body;
    
    if (!user_id || !platform || !auth_token) {
      return res.status(400).json({
        success: false,
        error: 'User ID, platform, and auth token are required'
      });
    }
    
    // In a real implementation, we would validate the auth token
    // For now, we'll simulate successful verification
    
    // Generate simulated confidence score (90-99%)
    const confidence = 90 + Math.floor(Math.random() * 10);
    
    // Record verification on blockchain
    let blockchainData;
    try {
      blockchainData = await recordVerificationOnBlockchain(
        user_id,
        platform === 'apple' ? 'faceid' : 'biometric',
        confidence / 100,
        {
          type: platform === 'apple' ? 'AppleFaceID' : 'GoogleBiometric',
          device: req.headers['user-agent'] || 'unknown'
        }
      );
    } catch (blockchainError) {
      console.error('Blockchain recording error:', blockchainError);
      // Continue even if blockchain recording fails
    }
    
    return res.json({
      success: true,
      verified: true,
      method: platform === 'apple' ? 'Apple FaceID' : 'Google Biometric',
      confidence,
      blockchainData
    });
    
  } catch (error) {
    console.error('Native verification error:', error);
    return res.status(500).json({
      success: false,
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Register a new face
 */
export async function registerFace(req: Request, res: Response) {
  try {
    const userId = req.body.user_id;
    const imageData = req.file?.buffer.toString('base64') || req.body.image_data;
    
    if (!userId || !imageData) {
      return res.status(400).json({
        success: false,
        error: 'User ID and image data are required'
      });
    }
    
    // Create face_db directory if it doesn't exist
    const dbDir = path.join(process.cwd(), 'face_db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create user directory
    const userDir = path.join(dbDir, userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    // Generate a unique ID for this face
    const faceId = crypto.randomUUID();
    
    // Save the image
    const imagePath = path.join(userDir, `${faceId}.jpg`);
    const imageBuffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(imagePath, imageBuffer);
    
    // Save metadata
    const metadataPath = path.join(userDir, `${faceId}.json`);
    const metadata = {
      user_id: userId,
      face_id: faceId,
      registered_at: new Date().toISOString(),
      method: 'DeepFace'
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Record on blockchain
    let blockchainData;
    try {
      blockchainData = await recordVerificationOnBlockchain(
        userId,
        'registration',
        0.95, // High confidence for registration
        {
          type: 'FaceRegistration',
          faceId
        }
      );
    } catch (blockchainError) {
      console.error('Blockchain recording error:', blockchainError);
      // Continue even if blockchain recording fails
    }
    
    return res.json({
      success: true,
      user_id: userId,
      face_id: faceId,
      message: 'Face registered successfully',
      blockchain_data: blockchainData
    });
    
  } catch (error) {
    console.error('Face registration error:', error);
    return res.status(500).json({
      success: false,
      error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * List registered users
 */
export async function listUsers(req: Request, res: Response) {
  try {
    const dbDir = path.join(process.cwd(), 'face_db');
    
    if (!fs.existsSync(dbDir)) {
      return res.json({
        success: true,
        users: []
      });
    }
    
    const users = fs.readdirSync(dbDir)
      .filter(item => fs.statSync(path.join(dbDir, item)).isDirectory());
    
    return res.json({
      success: true,
      users
    });
    
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to list users: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}
