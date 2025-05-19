/**
 * Blockchain Verification Integration
 * 
 * This module integrates biometric verification with blockchain recording,
 * creating an auditable trail of identity verification events.
 */

import { blockchainService } from './blockchain/service';
import { v4 as uuidv4 } from 'uuid';

export interface BlockchainVerificationResult {
  success: boolean;
  message?: string;
  verified: boolean;
  hitToken?: string;
  prvnToken?: string;
  metadata?: {
    verificationMethod: string;
    verificationTimestamp: string;
    confidence: number;
    deviceInfo?: {
      type: string;
      verified: boolean;
    };
    blockchainInfo?: {
      chainId: number;
      contractAddress: string;
      tokenId: string;
    };
  };
}

/**
 * Records a biometric verification event on the blockchain
 * 
 * @param userId User ID who performed the verification
 * @param verificationMethod 'face' | 'fingerprint' | 'device' - Method used for verification
 * @param confidence Confidence score of the verification (0-1)
 * @param deviceInfo Additional device information
 * @returns Blockchain verification result
 */
export async function recordVerificationOnBlockchain(
  userId: string,
  verificationMethod: 'face' | 'fingerprint' | 'device',
  confidence: number,
  deviceInfo?: {
    type: string;
    platform?: string;
    browser?: string;
  }
): Promise<BlockchainVerificationResult> {
  try {
    // Create metadata for this verification
    const verificationTimestamp = new Date().toISOString();
    const verificationId = uuidv4();
    
    // Check if user already has an HIT token
    let userHIT = blockchainService.getHITByOwner(userId);
    
    if (!userHIT) {
      // If not, create a new HIT token for the user
      const metadataURI = JSON.stringify({
        userId,
        username: `user_${userId.substring(0, 8)}`,
        createdAt: verificationTimestamp,
        type: 'identity'
      });
      
      userHIT = blockchainService.issueHIT(userId, metadataURI);
    }
    
    // Create a PRVN token for this verification event
    const verificationMetadata = JSON.stringify({
      verificationId,
      userId,
      method: verificationMethod,
      timestamp: verificationTimestamp,
      confidence,
      deviceInfo: deviceInfo || null,
      status: 'verified'
    });
    
    const prvnToken = blockchainService.issuePRVN(
      userId,
      verificationId,
      verificationMetadata
    );
    
    // Link the verification PRVN to the user's HIT
    blockchainService.linkHITToPRVN(userHIT.tokenId, prvnToken.tokenId);
    
    // Verify on chain
    const hitVerification = blockchainService.verifyOnChain(userHIT.tokenId, 'HIT');
    const prvnVerification = blockchainService.verifyOnChain(prvnToken.tokenId, 'PRVN');
    
    if (!hitVerification.verified || !prvnVerification.verified) {
      throw new Error('Blockchain verification failed');
    }
    
    // Return success result with tokens and metadata
    return {
      success: true,
      verified: true,
      hitToken: userHIT.tokenId,
      prvnToken: prvnToken.tokenId,
      metadata: {
        verificationMethod,
        verificationTimestamp,
        confidence,
        deviceInfo: {
          type: deviceInfo?.type || 'unknown',
          verified: true
        },
        blockchainInfo: {
          chainId: hitVerification.chainId,
          contractAddress: hitVerification.contractAddress,
          tokenId: userHIT.tokenId
        }
      }
    };
  } catch (error) {
    console.error('Error recording verification on blockchain:', error);
    return {
      success: false,
      verified: false,
      message: error instanceof Error ? error.message : 'Failed to record verification on blockchain'
    };
  }
}

/**
 * Get verification history for a user from the blockchain
 * 
 * @param userId User ID to get verification history for
 * @returns Array of verification events
 */
export async function getVerificationHistory(userId: string): Promise<any[]> {
  try {
    // Get user's HIT token
    const userHIT = blockchainService.getHITByOwner(userId);
    
    if (!userHIT) {
      return [];
    }
    
    // Get all PRVNs linked to this HIT
    const linkedPRVNs = blockchainService.getPRVNsLinkedToHIT(userHIT.tokenId);
    
    // Get details for each PRVN
    const verifications = linkedPRVNs.map(prvnId => {
      const prvn = blockchainService.getPRVN(prvnId);
      if (!prvn) return null;
      
      try {
        // Parse metadata
        const metadata = JSON.parse(prvn.metadataURI);
        return {
          id: prvn.tokenId,
          timestamp: metadata.timestamp,
          method: metadata.method,
          confidence: metadata.confidence,
          deviceInfo: metadata.deviceInfo,
          status: metadata.status
        };
      } catch (e) {
        console.error('Error parsing PRVN metadata:', e);
        return null;
      }
    }).filter(Boolean);
    
    return verifications;
  } catch (error) {
    console.error('Error getting verification history:', error);
    return [];
  }
}