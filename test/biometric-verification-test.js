
// Biometric Verification Test
// This test checks if the hybrid biometric verification is working correctly

const puppeteer = require('puppeteer');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

// Mock test image paths
const MOCK_FACE_IMAGE_PATH = path.join(__dirname, '../sample_face.jpg');

describe('Hybrid Biometric Verification', function() {
  this.timeout(15000); // Extend timeout for browser tests
  
  let browser;
  let page;
  
  before(async () => {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create new page
    page = await browser.newPage();
    
    // Mock camera
    await page.evaluateOnNewDocument(() => {
      // Mock getUserMedia
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        // Create mock video stream
        const mockStream = await originalGetUserMedia({
          video: constraints.video,
          audio: false
        });
        return mockStream;
      };
      
      // Mock WebAuthn
      if (!window.PublicKeyCredential) {
        window.PublicKeyCredential = {
          isUserVerifyingPlatformAuthenticatorAvailable: async () => true
        };
      }
    });
  });
  
  after(async () => {
    // Close browser
    if (browser) {
      await browser.close();
    }
  });
  
  it('should render the mobile biometric verification component', async () => {
    await page.goto('http://localhost:5000/test/verification');
    
    // Check if component is rendered
    const verificationComponent = await page.$('.biometric-verification-component');
    expect(verificationComponent).to.not.be.null;
  });
  
  it('should detect biometric capabilities', async () => {
    // Navigate to test page
    await page.goto('http://localhost:5000/test/verification');
    
    // Wait for biometric check to complete
    await page.waitForSelector('[data-testid="biometric-status"]');
    
    // Get biometric status
    const biometricStatus = await page.$eval('[data-testid="biometric-status"]', el => el.textContent);
    expect(biometricStatus).to.include('supported');
  });
  
  it('should handle DeepFace verification', async () => {
    // Navigate to test page
    await page.goto('http://localhost:5000/test/verification');
    
    // Mock DeepFace API response
    await page.setRequestInterception(true);
    page.on('request', async request => {
      if (request.url().includes('/verify') && request.method() === 'POST') {
        // Mock successful verification
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            verified: true,
            confidence: 95.7,
            method: 'DeepFace',
            model: 'VGG-Face',
            blockchain_data: {
              verified: true,
              hitToken: '0x123abc',
              metadata: {
                verificationMethod: 'face',
                verificationTimestamp: new Date().toISOString()
              }
            }
          })
        });
      } else {
        request.continue();
      }
    });
    
    // Click DeepFace verification method
    await page.click('[data-testid="deepface-method"]');
    
    // Wait for verification to complete
    await page.waitForSelector('[data-testid="verification-success"]', { timeout: 10000 });
    
    // Check verification result
    const resultElement = await page.$eval('[data-testid="verification-result"]', el => el.textContent);
    expect(resultElement).to.include('successful');
  });
  
  it('should handle hybrid verification', async () => {
    // Navigate to test page
    await page.goto('http://localhost:5000/test/verification');
    
    // Mock DeepFace and Native API responses
    await page.setRequestInterception(true);
    page.on('request', async request => {
      if (request.url().includes('/verify') && request.method() === 'POST') {
        // Mock successful DeepFace verification
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            verified: true,
            confidence: 92.5,
            method: 'DeepFace',
            model: 'VGG-Face'
          })
        });
      } else if (request.url().includes('/verify_native') && request.method() === 'POST') {
        // Mock successful native verification
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            verified: true,
            method: 'Apple FaceID',
            confidence: 99
          })
        });
      } else {
        request.continue();
      }
    });
    
    // Click hybrid verification method
    await page.click('[data-testid="hybrid-method"]');
    
    // Wait for verification to complete
    await page.waitForSelector('[data-testid="verification-success"]', { timeout: 10000 });
    
    // Check verification result
    const resultElement = await page.$eval('[data-testid="verification-result"]', el => el.textContent);
    expect(resultElement).to.include('successful');
    
    // Check session storage
    const verificationStatus = await page.evaluate(() => sessionStorage.getItem('verification_status'));
    expect(verificationStatus).to.equal('verified');
  });
  
  it('should handle failed verification gracefully', async () => {
    // Navigate to test page
    await page.goto('http://localhost:5000/test/verification');
    
    // Mock failed DeepFace verification
    await page.setRequestInterception(true);
    page.on('request', async request => {
      if (request.url().includes('/verify') && request.method() === 'POST') {
        // Mock failed verification
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            verified: false,
            confidence: 45.2,
            method: 'DeepFace',
            model: 'VGG-Face',
            message: 'Face not recognized'
          })
        });
      } else if (request.url().includes('/verify_native') && request.method() === 'POST') {
        // Mock failed native verification
        await request.respond({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'User cancelled biometric authentication'
          })
        });
      } else {
        request.continue();
      }
    });
    
    // Click DeepFace verification method
    await page.click('[data-testid="deepface-method"]');
    
    // Wait for verification error
    await page.waitForSelector('[data-testid="verification-error"]', { timeout: 10000 });
    
    // Check error message
    const errorElement = await page.$eval('[data-testid="verification-error"]', el => el.textContent);
    expect(errorElement).to.include('failed');
  });
});
