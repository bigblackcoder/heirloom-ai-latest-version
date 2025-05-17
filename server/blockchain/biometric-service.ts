import crypto from 'crypto';
import { storage } from '../storage';
import { db } from '../db';
import { users } from '@shared/schema';
import { FaceRecord } from '@shared/schema';

/**
 * Represents metadata for biometric credentials
 * This is stored in our system while actual biometric data stays on device
 */
type BiometricMetadata = {
  credentialId: string;
  deviceType: string;
  biometricType: string;
  registeredAt: string;
  lastVerified?: string;
};

/**
 * Result of a biometric verification attempt
 */
interface VerificationResult {
  success: boolean;
  userId?: number;
  credentialId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Service to handle blockchain-based biometric operations
 * Keeps actual biometric data on the device while only storing
 * verification metadata in our system
 */
export class BlockchainBiometricService {
  /**
   * Register a new biometric credential
   * @param userId User ID to associate with the biometric
   * @param credentialId Credential ID from device's biometric system
   * @param biometricType Type of biometric (face, fingerprint, etc.)
   * @param deviceType Type of device (iOS, Android, Web)
   */
  async registerBiometric(
    userId: number,
    credentialId: string,
    biometricType: string,
    deviceType: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Store only metadata, not actual biometric data
      const metadataObj: BiometricMetadata = {
        credentialId,
        deviceType,
        biometricType,
        registeredAt: new Date().toISOString(),
      };

      // Store as a face record (using existing table for simplicity)
      await storage.createFaceRecord({
        userId,
        metadata: metadataObj as unknown as Record<string, any>,
        faceEmbedding: null, // No actual biometric data stored
        confidence: 100, // Native biometrics are highly confident
      });

      // Log the registration activity
      await storage.createActivity({
        userId,
        type: 'BIOMETRIC_REGISTERED',
        description: `Registered ${biometricType} biometric on ${deviceType} device`,
        metadata: { credentialId: [credentialId] } as Record<string, any>,
      });

      return {
        success: true,
        message: `Successfully registered ${biometricType} biometric`,
      };
    } catch (error: any) {
      console.error('Error registering biometric:', error);
      return {
        success: false,
        message: `Failed to register biometric: ${error.message}`,
      };
    }
  }

  /**
   * Verify a user's identity using their device biometric
   * @param credentialId Credential ID from the device
   * @param userId Optional user ID to check against
   */
  async verifyIdentity(
    credentialId: string,
    userId?: number
  ): Promise<VerificationResult> {
    try {
      // Get relevant face records based on user ID
      let faceRecords: FaceRecord[] = [];
      
      if (userId) {
        // More efficient - only check specific user's records
        faceRecords = await storage.getFaceRecordsByUserId(userId);
      } else {
        // Less efficient - check all users
        const allUsers = await db.select().from(users);
        
        for (const user of allUsers) {
          const userRecords = await storage.getFaceRecordsByUserId(user.id);
          faceRecords = [...faceRecords, ...userRecords];
        }
      }

      // Find matching credential
      const matchingRecord = faceRecords.find(record => 
        record.metadata?.credentialId === credentialId
      );

      if (!matchingRecord) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Update verification metadata
      const updatedMetadata = {
        ...matchingRecord.metadata,
        lastVerified: new Date().toISOString(),
      };

      // Log verification activity
      await storage.createActivity({
        userId: matchingRecord.userId,
        type: 'BIOMETRIC_VERIFIED',
        description: 'Verified identity using device biometric',
        metadata: { 
          credentialId: [credentialId],
          verifiedAt: [new Date().toISOString()]
        } as Record<string, any>,
      });

      return {
        success: true,
        userId: matchingRecord.userId,
        credentialId,
        timestamp: new Date().toISOString(),
        metadata: updatedMetadata,
      };
    } catch (error: any) {
      console.error('Error verifying identity:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate a challenge for biometric verification
   * Used to prevent replay attacks
   */
  generateChallenge(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Export singleton instance
export const biometricService = new BlockchainBiometricService();