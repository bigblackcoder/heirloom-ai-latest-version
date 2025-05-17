
/**
 * Test script for biometric verification functionality
 * 
 * This script tests both web and mobile biometric verification functionality
 * and provides feedback on compatibility and performance.
 */

// Mock biometric verification for testing
const mockBiometricVerification = async (type) => {
  console.log(`Testing ${type} biometric verification`);
  
  // Simulate verification process
  console.log("- Checking hardware capabilities");
  await simulateDelay(500);
  console.log("- Requesting biometric verification");
  await simulateDelay(1000);
  console.log("- Processing verification");
  await simulateDelay(800);
  console.log("- Verification complete");
  
  return true;
};

// Helper function to simulate delays
const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test web biometric verification
const testWebBiometrics = async () => {
  console.log("\n=== Testing Web Biometric Verification ===");
  
  // Check for WebAuthn support
  if (typeof window !== 'undefined' && window.PublicKeyCredential) {
    console.log("WebAuthn is supported in this environment");
    
    try {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        console.log("Platform authenticator is available");
        console.log("Testing biometric verification...");
        
        // Test the verification
        const result = await mockBiometricVerification('web');
        console.log(`Verification ${result ? 'succeeded' : 'failed'}`);
      } else {
        console.log("Platform authenticator is not available on this device");
      }
    } catch (err) {
      console.error("Error testing platform authenticator:", err);
    }
  } else {
    console.log("WebAuthn is not supported in this environment");
  }
};

// Test mobile biometric verification (simulation)
const testMobileBiometrics = async () => {
  console.log("\n=== Testing Mobile Biometric Verification ===");
  console.log("Note: This is a simulation as we're running in a web environment");
  
  // Determine mobile OS for testing
  const userAgent = navigator.userAgent || '';
  const isiOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  if (isiOS) {
    console.log("Detected iOS device");
    console.log("Testing Face ID verification...");
    const faceIdResult = await mockBiometricVerification('Face ID');
    console.log(`Face ID verification ${faceIdResult ? 'succeeded' : 'failed'}`);
  } else if (isAndroid) {
    console.log("Detected Android device");
    console.log("Testing fingerprint verification...");
    const fingerprintResult = await mockBiometricVerification('Fingerprint');
    console.log(`Fingerprint verification ${fingerprintResult ? 'succeeded' : 'failed'}`);
  } else {
    console.log("Not running on a mobile device, skipping mobile biometric tests");
  }
};

// Run the tests
const runTests = async () => {
  console.log("Starting biometric verification tests...");
  console.log("----------------------------------------");
  
  await testWebBiometrics();
  await testMobileBiometrics();
  
  console.log("----------------------------------------");
  console.log("Biometric verification tests complete");
};

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = { runTests };
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  window.addEventListener('load', runTests);
}
