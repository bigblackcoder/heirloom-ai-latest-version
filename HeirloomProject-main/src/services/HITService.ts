import { ContractConfig } from '../config/contracts';
import { AuthService } from './AuthService';
import { FaceVerificationService } from './FaceVerificationService';
import { ethers, ContractTransactionResponse } from 'ethers';

export class HITService {
  private contractConfig: ContractConfig;
  private authService: AuthService;
  private faceVerification: FaceVerificationService;

  constructor() {
    this.contractConfig = new ContractConfig();
    this.authService = new AuthService();
    this.faceVerification = new FaceVerificationService();
  }

  async issueHIT(userId: string, walletAddress: string): Promise<boolean> {
    try {
      // Get verification status from Supabase
      const verificationStatus = await this.authService.getVerificationStatus(userId);

      if (!verificationStatus) {
        throw new Error('No verification data found');
      }

      // Check both Plaid and face verification status
      if (verificationStatus.combined_status !== 'complete') {
        throw new Error('Verification incomplete. Both Plaid and face verification must be completed.');
      }

      // Get HIT contract
      const hitContract = this.contractConfig.getHITContract();

      // Check if user already has a HIT
      const existingToken = await hitContract.hasIdentityToken(walletAddress);
      if (existingToken) {
        throw new Error('User already has a HIT token');
      }

      // Generate token URI with verification data
      const tokenURI = `ipfs://heirloom/${userId}`;

      // Issue HIT token
      const tx = await hitContract.issueHIT(walletAddress, tokenURI, {
        maxFeePerGas: ethers.parseUnits('120', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('96', 'gwei')
      }) as ContractTransactionResponse;

      // Wait for confirmation
      const receipt = await this.contractConfig.provider.waitForTransaction(tx.hash);
      
      if (!receipt || receipt.status === 0) {
        throw new Error('Transaction failed');
      }

      // Verify HIT token was issued
      const tokenVerified = await hitContract.hasIdentityToken(walletAddress);
      if (!tokenVerified) {
        throw new Error('HIT token issuance verification failed');
      }

      return true;
    } catch (error) {
      console.error('Error issuing HIT:', error);
      throw error;
    }
  }

  async verifyHITEligibility(userId: string): Promise<{
    eligible: boolean;
    plaidVerified: boolean;
    faceVerified: boolean;
    message: string;
  }> {
    try {
      const verificationStatus = await this.authService.getVerificationStatus(userId);

      if (!verificationStatus) {
        return {
          eligible: false,
          plaidVerified: false,
          faceVerified: false,
          message: 'No verification data found'
        };
      }

      const plaidVerified = verificationStatus.status === 'success';
      const faceVerified = verificationStatus.face_verified;

      return {
        eligible: verificationStatus.combined_status === 'complete',
        plaidVerified,
        faceVerified,
        message: verificationStatus.combined_status === 'complete'
          ? 'Eligible for HIT token'
          : `Verification incomplete: ${!plaidVerified ? 'Plaid verification required. ' : ''}${!faceVerified ? 'Face verification required.' : ''}`
      };
    } catch (error) {
      console.error('Error checking HIT eligibility:', error);
      throw error;
    }
  }
}
