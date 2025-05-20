/**
 * Verification Test API Routes
 * 
 * These endpoints provide a testing ground for biometric verification and blockchain integration.
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { blockchainService } from '../blockchain/service';
import { recordVerificationOnBlockchain } from '../blockchain-verification';

const router = express.Router();

/**
 * Test biometric authentication integration
 */
router.post('/biometric', async (req, res) => {
  try {
    const { userId, device_info } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Simulate successful biometric verification
    const verificationId = uuidv4();
    
    return res.status(200).json({
      success: true,
      message: 'Biometric verification test successful',
      verification_id: verificationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Biometric test error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * Test blockchain integration for biometric verification
 */
router.post('/blockchain', async (req, res) => {
  try {
    const { userId, verificationMethod, confidence } = req.body;
    
    if (!userId || !verificationMethod) {
      return res.status(400).json({
        success: false,
        message: 'User ID and verification method are required'
      });
    }
    
    // Record the verification on blockchain
    const blockchainResult = await recordVerificationOnBlockchain(
      userId,
      verificationMethod as 'face' | 'fingerprint' | 'device',
      confidence || 0.95,
      {
        type: 'TestVerification',
        platform: req.headers['user-agent'] || 'Unknown'
      }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Blockchain verification test successful',
      blockchain_data: blockchainResult
    });
  } catch (error) {
    console.error('Blockchain test error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * Combined test for both biometric and blockchain verification
 */
router.post('/combined', async (req, res) => {
  try {
    const { userId, verificationMethod, deviceInfo } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Simulate verification process
    const method = verificationMethod || 'device';
    const confidence = Math.random() * 0.15 + 0.85; // Random confidence between 0.85 and 1.0
    
    // Record the verification on blockchain
    const blockchainResult = await recordVerificationOnBlockchain(
      userId,
      method as 'face' | 'fingerprint' | 'device',
      confidence,
      {
        type: deviceInfo?.type || 'Unknown',
        platform: deviceInfo?.platform || req.headers['user-agent'] || 'Unknown',
        browser: deviceInfo?.browser
      }
    );
    
    return res.status(200).json({
      success: true,
      verification: {
        method,
        confidence,
        timestamp: new Date().toISOString(),
        device_verified: true
      },
      blockchain_data: blockchainResult
    });
  } catch (error) {
    console.error('Combined test error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;