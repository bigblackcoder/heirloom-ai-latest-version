import { Router } from 'express';
import { randomBytes } from 'crypto';
import { db } from '../db';

const router = Router();

// Store challenges temporarily
const challenges = new Map<string, { value: string, expires: number }>();

// Clean up expired challenges every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, challenge] of challenges.entries()) {
    if (challenge.expires < now) {
      challenges.delete(id);
    }
  }
}, 10 * 60 * 1000);

// Generate a new challenge for secure biometric operations
router.get('/challenge', (req, res) => {
  // Generate a random challenge
  const value = randomBytes(32).toString('hex');
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
  
  // Store the challenge with an ID
  const challengeId = randomBytes(16).toString('hex');
  challenges.set(challengeId, { value, expires });
  
  res.json({ 
    id: challengeId,
    value,
    expires
  });
});

// Register a biometric credential
router.post('/register', async (req, res) => {
  try {
    const { userId, credentialId, biometricType, deviceType, challenge } = req.body;
    
    // Validate required fields
    if (!userId || !credentialId || !biometricType || !challenge) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Verify the challenge
    let validChallenge = false;
    for (const [id, storedChallenge] of challenges.entries()) {
      if (storedChallenge.value === challenge && storedChallenge.expires > Date.now()) {
        validChallenge = true;
        challenges.delete(id); // Use challenge only once
        break;
      }
    }
    
    if (!validChallenge) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired challenge' 
      });
    }
    
    // Store the credential in the database
    // In a production environment, this would be stored in the biometric_credentials table
    // Only store metadata, not the actual biometric data
    const timestamp = new Date();
    
    // For demonstration purposes, we're storing in a simple data structure
    // In production, this would be a database insert
    console.log(`Registered biometric credential: ${credentialId} for user ${userId}`);

    // Insert into database - this is simplified for the demo
    // In actual implementation, we'd use proper table structure
    await db.query(
      `INSERT INTO biometric_credentials 
       (user_id, credential_id, biometric_type, device_type, created_at, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, credentialId, biometricType, deviceType || 'unknown', timestamp, true]
    );
    
    res.json({
      success: true,
      credentialId,
      timestamp: timestamp.toISOString(),
      message: 'Biometric credential registered successfully'
    });
  } catch (error) {
    console.error('Error registering biometric:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register biometric credential'
    });
  }
});

// Verify a biometric credential
router.post('/verify', async (req, res) => {
  try {
    const { credentialId, userId, challenge } = req.body;
    
    // Validate required fields
    if (!challenge) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing challenge' 
      });
    }
    
    // Either credentialId or userId must be provided
    if (!credentialId && !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either credentialId or userId must be provided' 
      });
    }
    
    // Verify the challenge
    let validChallenge = false;
    for (const [id, storedChallenge] of challenges.entries()) {
      if (storedChallenge.value === challenge && storedChallenge.expires > Date.now()) {
        validChallenge = true;
        challenges.delete(id); // Use challenge only once
        break;
      }
    }
    
    if (!validChallenge) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired challenge' 
      });
    }
    
    // Verify the credential against the database
    // In a production environment, this would query the biometric_credentials table
    // In our demo, we're simulating this with a successful response
    const timestamp = new Date();
    
    // Log the verification attempt
    console.log(`Verified biometric credential: ${credentialId || 'auto-detect'} for user ${userId || 'unknown'}`);
    
    // For a real implementation, we would verify against the database
    // For now, we'll simulate a successful verification
    
    res.json({
      success: true,
      userId: userId || 1001, // Mock user ID if not provided
      timestamp: timestamp.toISOString(),
      message: 'Identity verified successfully'
    });
  } catch (error) {
    console.error('Error verifying biometric:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify identity'
    });
  }
});

// List registered biometrics for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // In a production environment, this would query the database
    // For our demo, we'll return a simulated response
    
    // In a real implementation, we would query the database like:
    // const result = await db.query(
    //   'SELECT * FROM biometric_credentials WHERE user_id = $1 AND is_active = true',
    //   [userId]
    // );
    
    res.json({
      success: true,
      credentials: [
        {
          id: 'simulated_credential_1',
          biometricType: 'face',
          deviceType: 'web',
          registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching biometric credentials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch biometric credentials'
    });
  }
});

export default router;