/**
 * Blockchain Biometric Service
 * 
 * This service handles the integration between device biometrics and blockchain contracts.
 * It stores ONLY metadata about verifications, never the actual biometric data.
 */

import { log } from '../vite';
import { storage } from '../storage';
import { blockchainService } from './service';

// Types for the biometric metadata
interface BiometricCredentialMetadata {
  credentialId: string;
  authenticatorType: string;
  registrationTime: string;
  deviceId?: string;
}

interface BiometricVerificationMetadata {
  credentialId: string;
  verificationType: string;
  verificationTime: string;
  authenticatorType?: string;
}

/**
 * Register a new biometric credential and store metadata on the blockchain
 */
export async function registerBiometricCredential(
  userId: number,
  metadata: BiometricCredentialMetadata
) {
  try {
    log(`Registering biometric credential for user ${userId}`, 'blockchain');
    
    // First, create a record in our database
    const credentialRecord = await storage.createBiometricCredential({
      userId,
      credentialId: metadata.credentialId,
      type: metadata.authenticatorType,
      metadata: JSON.stringify(metadata)
    });
    
    // Then register it on the blockchain
    const contractResult = await blockchainService.registerContract({
      owner: userId.toString(),
      contractType: 'BIOMETRIC_CREDENTIAL',
      data: {
        credentialId: metadata.credentialId,
        authenticatorType: metadata.authenticatorType,
        registrationTime: metadata.registrationTime,
        // No actual biometric data is stored
      }
    });
    
    // Update the credential record with the contract address
    if (contractResult.contractAddress) {
      await storage.updateBiometricCredential(
        credentialRecord.id,
        { contractAddress: contractResult.contractAddress }
      );
    }
    
    // Log this activity
    await storage.createActivity({
      userId,
      type: 'biometric-registered',
      description: 'Biometric credential registered with blockchain',
      metadata: {
        credentialId: metadata.credentialId,
        contractAddress: contractResult.contractAddress
      }
    });
    
    return {
      success: true,
      credentialId: metadata.credentialId,
      contractAddress: contractResult.contractAddress,
      transactionHash: contractResult.transactionHash
    };
  } catch (error) {
    log(`Error registering biometric credential: ${error}`, 'blockchain-error');
    throw error;
  }
}

/**
 * Record a biometric verification event on the blockchain
 */
export async function recordBiometricVerification(
  userId: number,
  metadata: BiometricVerificationMetadata
) {
  try {
    log(`Recording biometric verification for user ${userId}`, 'blockchain');
    
    // Get the credential record from our database
    const credential = await storage.getBiometricCredentialByCredentialId(
      metadata.credentialId
    );
    
    if (!credential || credential.userId !== userId) {
      throw new Error('Invalid credential ID or credential does not belong to user');
    }
    
    // Record the verification on blockchain
    const verificationResult = await blockchainService.verifyIdentity({
      subjectId: userId.toString(),
      verificationType: 'BIOMETRIC',
      verifierId: 'DEVICE_NATIVE', // The device itself is the verifier
      data: {
        credentialId: metadata.credentialId,
        verificationType: metadata.verificationType,
        verificationTime: metadata.verificationTime,
        authenticatorType: metadata.authenticatorType
      }
    });
    
    // Log this activity
    await storage.createActivity({
      userId,
      type: 'biometric-verified',
      description: 'Identity verified using biometrics',
      metadata: {
        credentialId: metadata.credentialId,
        transactionHash: verificationResult.transactionHash
      }
    });
    
    return {
      success: true,
      verified: true,
      transactionHash: verificationResult.transactionHash
    };
  } catch (error) {
    log(`Error recording biometric verification: ${error}`, 'blockchain-error');
    throw error;
  }
}

/**
 * Get all biometric credentials for a user
 */
export async function getUserBiometricCredentials(userId: number) {
  try {
    const credentials = await storage.getBiometricCredentialsByUserId(userId);
    
    // Format the response
    return {
      credentials: credentials.map(cred => ({
        id: cred.credentialId,
        type: cred.type,
        registrationTime: JSON.parse(cred.metadata || '{}').registrationTime,
        contractAddress: cred.contractAddress
      }))
    };
  } catch (error) {
    log(`Error getting user biometric credentials: ${error}`, 'blockchain-error');
    throw error;
  }
}