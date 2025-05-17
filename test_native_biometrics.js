/**
 * Test script for native biometric verification with blockchain integration
 * This script tests the WebAuthn integration with blockchain metadata storage
 */

const axios = require('axios');

// Constants
const API_BASE_URL = 'http://localhost:5000';
const USER_ID = 'test-user-123';

// Helper function to simulate the WebAuthn credential creation process
// In a real implementation, this would use the actual WebAuthn API
async function simulateWebAuthnRegistration() {
  console.log('Simulating WebAuthn credential registration...');
  
  // This would normally use window.navigator.credentials.create()
  // Generate a random credential ID to simulate the process
  const credentialId = Buffer.from(
    Array.from({length: 16}, () => Math.floor(Math.random() * 256))
  ).toString('base64');
  
  return {
    id: credentialId,
    type: 'public-key',
    authenticatorAttachment: 'platform', // Indicates built-in biometric authenticator
    metadata: {
      registrationTime: new Date().toISOString(),
      userAgent: 'Test Environment',
      authenticatorType: 'faceId', // Could be faceId, touchId, or fingerprint
    }
  };
}

// Function to simulate verification with the registered credential
async function simulateWebAuthnVerification(credentialId) {
  console.log('Simulating WebAuthn verification...');
  
  // This would normally use window.navigator.credentials.get()
  // In a real implementation, this would verify with the actual authenticator
  return {
    success: true,
    verified: true,
    metadata: {
      verificationTime: new Date().toISOString(),
      authenticatorType: 'faceId',
    }
  };
}

// Function to register the biometric metadata with the blockchain 
async function registerBiometricMetadataWithBlockchain(userId, credentialData) {
  try {
    console.log(`Registering biometric metadata for user ${userId} with blockchain...`);
    
    // In a real implementation, this would call your API to register with the blockchain
    const response = await axios.post(`${API_BASE_URL}/api/blockchain/register-contract`, {
      userId,
      contractType: 'biometric-credential',
      metadata: {
        credentialId: credentialData.id,
        authenticatorType: credentialData.metadata.authenticatorType,
        registrationTime: credentialData.metadata.registrationTime,
        // Note: NO biometric data is stored, only metadata
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error registering with blockchain:', error.message);
    throw error;
  }
}

// Function to verify and log the verification on the blockchain
async function verifyAndLogWithBlockchain(userId, credentialId) {
  try {
    console.log(`Verifying biometric for user ${userId} and logging to blockchain...`);
    
    // First simulate the verification with WebAuthn
    const verificationResult = await simulateWebAuthnVerification(credentialId);
    
    if (!verificationResult.success) {
      console.error('Biometric verification failed');
      return { success: false };
    }
    
    // Log the successful verification to the blockchain
    const response = await axios.post(`${API_BASE_URL}/api/blockchain/verify-onchain`, {
      userId,
      credentialId,
      verificationType: 'biometric',
      verificationTime: verificationResult.metadata.verificationTime,
      // Again, only metadata is stored
    });
    
    return {
      success: true,
      blockchainResult: response.data
    };
  } catch (error) {
    console.error('Error during verification or blockchain logging:', error.message);
    throw error;
  }
}

// Main test function
async function runTest() {
  try {
    console.log('===== NATIVE BIOMETRIC + BLOCKCHAIN TEST =====');
    
    // Step 1: Register a biometric credential
    console.log('\n--- Step 1: Register biometric credential ---');
    const credential = await simulateWebAuthnRegistration();
    console.log('Credential created:', credential.id);
    
    // Step 2: Register the credential metadata with the blockchain
    console.log('\n--- Step 2: Register metadata with blockchain ---');
    const registrationResult = await registerBiometricMetadataWithBlockchain(
      USER_ID, 
      credential
    );
    console.log('Blockchain registration result:', registrationResult);
    
    // Step 3: Verify using the registered credential
    console.log('\n--- Step 3: Verify using registered credential ---');
    const verificationResult = await verifyAndLogWithBlockchain(
      USER_ID,
      credential.id
    );
    console.log('Verification and blockchain logging result:', verificationResult);
    
    console.log('\n===== TEST COMPLETE =====');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
runTest();