/**
 * Heirloom Identity Platform - Biometric Implementation
 * 
 * This file demonstrates the workflow for device-native biometric authentication
 * where biometric data stays on the device and only metadata is recorded on the blockchain.
 */

// Simulated Device-Native Biometric Flow (Web)
class DeviceNativeBiometricAuth {
  /**
   * Initialize with user information
   */
  constructor(userId) {
    this.userId = userId;
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.registeredCredentials = [];
  }
  
  /**
   * Check if device supports biometrics (using WebAuthn)
   */
  async checkDeviceSupport() {
    console.log('Checking device biometric support...');
    
    // In a real implementation, this would use WebAuthn
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return {
          supported: available,
          biometricType: this._detectBiometricType()
        };
      } catch (err) {
        console.error('Error checking platform authenticator:', err);
        return { supported: false };
      }
    }
    
    return { supported: false };
  }
  
  /**
   * Detect likely biometric type based on device
   * Note: WebAuthn doesn't expose this directly, so we make a best guess
   */
  _detectBiometricType() {
    if (typeof navigator !== 'undefined') {
      // iOS detection
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        return window.innerHeight > 800 ? 'faceId' : 'touchId';
      } 
      // Android detection
      else if (/Android/.test(navigator.userAgent)) {
        return 'fingerprint'; // Could be fingerprint or face
      }
    }
    
    return 'unknown';
  }
  
  /**
   * Register a new biometric credential
   * This keeps the actual biometric data on the device
   * and only stores metadata on the blockchain
   */
  async registerBiometric() {
    console.log('Registering new biometric credential...');
    
    try {
      // 1. Trigger native biometric authentication
      // In a real implementation this would use WebAuthn's navigator.credentials.create()
      const biometricResult = await this._triggerNativeBiometric('register');
      
      if (!biometricResult.success) {
        throw new Error('Biometric verification failed');
      }
      
      // 2. Generate credential metadata
      const credentialMetadata = {
        credentialId: biometricResult.credentialId,
        authenticatorType: biometricResult.authenticatorType,
        registrationTime: new Date().toISOString(),
        deviceInfo: {
          platform: navigator.platform,
          // No actual device fingerprints or biometric templates are stored
        }
      };
      
      // 3. Register with blockchain (sending only metadata, not biometric data)
      const response = await fetch(`${this.apiBaseUrl}/blockchain/register-contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          contractType: 'biometric-credential',
          metadata: credentialMetadata
        })
      });
      
      if (!response.ok) {
        throw new Error(`Blockchain registration failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 4. Store credential reference locally
      this.registeredCredentials.push({
        id: credentialMetadata.credentialId,
        contractAddress: result.contractAddress
      });
      
      return {
        success: true,
        credentialId: credentialMetadata.credentialId,
        contractAddress: result.contractAddress
      };
    } catch (error) {
      console.error('Error registering biometric:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verify identity using previously registered biometric
   */
  async verifyIdentity() {
    console.log('Verifying identity with biometrics...');
    
    try {
      // Ensure we have a registered credential
      if (this.registeredCredentials.length === 0) {
        throw new Error('No registered biometric credentials found');
      }
      
      const credential = this.registeredCredentials[0];
      
      // 1. Trigger native biometric verification
      // In a real implementation this would use WebAuthn's navigator.credentials.get()
      const biometricResult = await this._triggerNativeBiometric('verify', credential.id);
      
      if (!biometricResult.success) {
        throw new Error('Biometric verification failed');
      }
      
      // 2. Create verification metadata
      const verificationMetadata = {
        credentialId: credential.id,
        verificationType: 'device-biometric',
        verificationTime: new Date().toISOString(),
        authenticatorType: biometricResult.authenticatorType
      };
      
      // 3. Record verification on blockchain
      const response = await fetch(`${this.apiBaseUrl}/blockchain/verify-onchain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          credentialId: credential.id,
          verificationType: 'biometric',
          verificationTime: verificationMetadata.verificationTime
        })
      });
      
      if (!response.ok) {
        throw new Error(`Blockchain verification failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        verified: true,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Error verifying identity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Mock function to simulate device biometric operations
   * In a real implementation, this would interact with WebAuthn
   */
  async _triggerNativeBiometric(action, credentialId = null) {
    console.log(`Triggering ${action} with native biometrics...`);
    
    // Simulate the device biometric prompt
    console.log('Waiting for user to authenticate with device biometrics...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // This would be the result of the actual biometric verification
    // In a real implementation, this would come from the device's secure element
    return {
      success: true,
      credentialId: credentialId || `biometric-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      authenticatorType: this._detectBiometricType()
    };
  }
}

// Simulated Mobile Native Biometric Flow (React Native)
class MobileNativeBiometricAuth {
  /**
   * Initialize with user information
   */
  constructor(userId) {
    this.userId = userId;
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.registeredCredentials = [];
  }
  
  /**
   * Check if device supports biometrics using LocalAuthentication or BiometricManager
   */
  async checkDeviceSupport() {
    console.log('Checking mobile device biometric support...');
    
    // In a real implementation, this would use:
    // - iOS: LocalAuthentication framework
    // - Android: BiometricManager
    
    // Simulating the response from native biometric check
    return {
      supported: true,
      biometricType: this._detectBiometricType(),
      hardware: true
    };
  }
  
  /**
   * Detect biometric type based on device platform
   */
  _detectBiometricType() {
    // This is a simplified version - real implementation would use:
    // - iOS: LAContext.biometryType
    // - Android: BiometricManager.Authenticators
    
    const platform = 'ios'; // Simulated platform
    if (platform === 'ios') {
      return 'faceId'; // Or touchId based on device
    } else {
      return 'fingerprint'; // Android could be BIOMETRIC_STRONG or BIOMETRIC_WEAK
    }
  }
  
  /**
   * Register a new biometric credential
   */
  async registerBiometric() {
    console.log('Registering new mobile biometric credential...');
    
    try {
      // 1. Trigger native biometric authentication
      // In a real implementation this would use:
      // - iOS: LAContext.evaluatePolicy
      // - Android: BiometricPrompt
      const biometricResult = await this._triggerNativeBiometric('register');
      
      if (!biometricResult.success) {
        throw new Error('Biometric verification failed');
      }
      
      // 2. Generate credential metadata (NO actual biometric data)
      const credentialMetadata = {
        credentialId: biometricResult.credentialId,
        authenticatorType: biometricResult.authenticatorType,
        registrationTime: new Date().toISOString(),
        deviceInfo: {
          platform: 'mobile',
          os: 'ios' // simulated
        }
      };
      
      // 3. Register with blockchain (only metadata)
      const response = {
        success: true,
        contractAddress: '0x' + Math.random().toString(16).slice(2, 42)
      };
      
      // 4. Store credential reference locally in secure storage
      // In real implementation, use:
      // - iOS: Keychain Services
      // - Android: EncryptedSharedPreferences
      this.registeredCredentials.push({
        id: credentialMetadata.credentialId,
        contractAddress: response.contractAddress
      });
      
      return {
        success: true,
        credentialId: credentialMetadata.credentialId,
        contractAddress: response.contractAddress
      };
    } catch (error) {
      console.error('Error registering mobile biometric:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verify identity using previously registered biometric
   */
  async verifyIdentity() {
    console.log('Verifying identity with mobile biometrics...');
    
    try {
      // Ensure we have a registered credential
      if (this.registeredCredentials.length === 0) {
        throw new Error('No registered biometric credentials found');
      }
      
      const credential = this.registeredCredentials[0];
      
      // 1. Trigger native biometric verification
      const biometricResult = await this._triggerNativeBiometric('verify', credential.id);
      
      if (!biometricResult.success) {
        throw new Error('Biometric verification failed');
      }
      
      // 2. Create verification metadata
      const verificationMetadata = {
        credentialId: credential.id,
        verificationType: 'mobile-biometric',
        verificationTime: new Date().toISOString(),
        authenticatorType: biometricResult.authenticatorType
      };
      
      // 3. Record verification on blockchain
      const result = {
        success: true,
        verified: true,
        transactionHash: '0x' + Math.random().toString(16).slice(2, 66)
      };
      
      return result;
    } catch (error) {
      console.error('Error verifying identity with mobile biometrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Mock function to simulate native biometric operations
   */
  async _triggerNativeBiometric(action, credentialId = null) {
    console.log(`Triggering ${action} with mobile native biometrics...`);
    
    // Simulate the device biometric prompt
    console.log('Waiting for user to authenticate with device biometrics...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      credentialId: credentialId || `mobile-bio-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      authenticatorType: this._detectBiometricType()
    };
  }
}

// Example usage
async function testBiometricImplementation() {
  console.log('\n==== TESTING DEVICE-NATIVE BIOMETRIC IMPLEMENTATION ====\n');
  
  const userId = 123; // Example user ID
  
  // Test web implementation
  console.log('\n=== Testing Web Implementation ===\n');
  const webBiometrics = new DeviceNativeBiometricAuth(userId);
  
  const webSupport = await webBiometrics.checkDeviceSupport();
  console.log('Web Biometric Support:', webSupport);
  
  if (webSupport.supported) {
    const webRegResult = await webBiometrics.registerBiometric();
    console.log('Web Registration Result:', webRegResult);
    
    if (webRegResult.success) {
      const webVerifyResult = await webBiometrics.verifyIdentity();
      console.log('Web Verification Result:', webVerifyResult);
    }
  }
  
  // Test mobile implementation
  console.log('\n=== Testing Mobile Implementation ===\n');
  const mobileBiometrics = new MobileNativeBiometricAuth(userId);
  
  const mobileSupport = await mobileBiometrics.checkDeviceSupport();
  console.log('Mobile Biometric Support:', mobileSupport);
  
  if (mobileSupport.supported) {
    const mobileRegResult = await mobileBiometrics.registerBiometric();
    console.log('Mobile Registration Result:', mobileRegResult);
    
    if (mobileRegResult.success) {
      const mobileVerifyResult = await mobileBiometrics.verifyIdentity();
      console.log('Mobile Verification Result:', mobileVerifyResult);
    }
  }
  
  console.log('\n==== BIOMETRIC IMPLEMENTATION TEST COMPLETE ====\n');
}

// Run the test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testBiometricImplementation().catch(console.error);
}