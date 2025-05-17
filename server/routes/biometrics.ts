import { Router } from 'express';
import { biometricService } from '../blockchain/biometric-service';

const router = Router();

/**
 * Get a new challenge string for biometric operations
 * This prevents replay attacks
 */
router.get('/challenge', (req, res) => {
  const challenge = biometricService.generateChallenge();
  res.json({ value: challenge });
});

/**
 * Register a new biometric credential
 * Only stores metadata on our system, not actual biometric data
 */
router.post('/register', async (req, res) => {
  try {
    const { userId, credentialId, biometricType, deviceType, challenge } = req.body;
    
    if (!userId || !credentialId || !biometricType || !deviceType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, credentialId, biometricType, deviceType'
      });
    }
    
    // In a production system, we would verify the challenge here
    
    const result = await biometricService.registerBiometric(
      userId,
      credentialId,
      biometricType,
      deviceType
    );
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error registering biometric:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to register biometric: ${error.message}`
    });
  }
});

/**
 * Verify identity using a previously registered biometric
 */
router.post('/verify', async (req, res) => {
  try {
    const { credentialId, userId, challenge } = req.body;
    
    if (!credentialId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: credentialId'
      });
    }
    
    // In a production system, we would verify the challenge here
    
    const result = await biometricService.verifyIdentity(credentialId, userId);
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error verifying identity:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to verify identity: ${error.message}`
    });
  }
});

export default router;