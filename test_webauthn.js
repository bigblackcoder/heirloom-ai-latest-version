const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create Express app
const app = express();
const PORT = 5000;

// Configure middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), "public")));

// In-memory credential storage (for testing purposes)
const credentials = new Map();
const challenges = new Map();

// Session middleware
app.use(session({
  secret: "heirloom-identity-platform-secret",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Create sample user HTML page
const userHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebAuthn Test</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    button { background: #4f46e5; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #4338ca; }
    .tabs { display: flex; margin-bottom: 20px; }
    .tab { padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; }
    .tab.active { border-bottom: 2px solid #4f46e5; font-weight: bold; }
    #result { margin-top: 20px; padding: 15px; border-radius: 4px; }
    .success { background-color: #d1fae5; border: 1px solid #34d399; }
    .error { background-color: #fee2e2; border: 1px solid #f87171; }
    input { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>WebAuthn Authentication Test</h1>
  
  <div class="tabs">
    <div class="tab active" id="tab-register" onclick="switchTab('register')">Register</div>
    <div class="tab" id="tab-login" onclick="switchTab('login')">Login</div>
  </div>
  
  <div id="register-panel" class="card">
    <h2>Register New Device</h2>
    <div>
      <label for="username">Username</label>
      <input type="text" id="username" value="testuser" />
    </div>
    <div>
      <label for="userId">User ID</label>
      <input type="number" id="userId" value="1" />
    </div>
    <div>
      <label for="displayName">Display Name</label>
      <input type="text" id="displayName" value="Test User" />
    </div>
    <button onclick="registerDevice()">Register Device with Biometrics</button>
  </div>
  
  <div id="login-panel" class="card" style="display: none;">
    <h2>Authenticate with Device</h2>
    <div>
      <label for="loginUserId">User ID</label>
      <input type="number" id="loginUserId" value="1" />
    </div>
    <button onclick="authenticateDevice()">Verify with Biometrics</button>
  </div>
  
  <div id="result" style="display: none;"></div>
  
  <script>
    // Switch between registration and login tabs
    function switchTab(tab) {
      document.getElementById('tab-register').classList.remove('active');
      document.getElementById('tab-login').classList.remove('active');
      document.getElementById('tab-' + tab).classList.add('active');
      
      document.getElementById('register-panel').style.display = tab === 'register' ? 'block' : 'none';
      document.getElementById('login-panel').style.display = tab === 'login' ? 'block' : 'none';
    }
    
    // Convert buffer to base64 string
    function bufferToBase64(buffer) {
      return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\\+/g, '-')
        .replace(/\\//g, '_')
        .replace(/=/g, '');
    }
    
    // Convert base64 string to array buffer
    function base64ToBuffer(base64) {
      const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }
    
    // Show result message
    function showResult(message, isSuccess) {
      const resultElement = document.getElementById('result');
      resultElement.textContent = message;
      resultElement.className = isSuccess ? 'success' : 'error';
      resultElement.style.display = 'block';
    }
    
    // Register a new device
    async function registerDevice() {
      try {
        const username = document.getElementById('username').value;
        const userId = parseInt(document.getElementById('userId').value);
        const displayName = document.getElementById('displayName').value;
        
        if (!username || !userId || !displayName) {
          showResult('All fields are required', false);
          return;
        }
        
        // Step 1: Get registration options from server
        const optionsResponse = await fetch('/api/webauthn/register/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, userId, displayName })
        });
        
        if (!optionsResponse.ok) {
          const error = await optionsResponse.json();
          throw new Error(error.message || 'Failed to get registration options');
        }
        
        // Step 2: Parse the options and create credential
        const options = await optionsResponse.json();
        
        // Convert ArrayBuffers back from our custom format
        const publicKeyOptions = {
          ...options,
          challenge: new Uint8Array(options.challenge.data).buffer,
          user: {
            ...options.user,
            id: new Uint8Array(options.user.id.data).buffer,
          },
          excludeCredentials: options.excludeCredentials ? 
            options.excludeCredentials.map(cred => ({
              ...cred,
              id: new Uint8Array(cred.id.data).buffer
            })) : undefined
        };
        
        // Create credentials using the WebAuthn API
        const credential = await navigator.credentials.create({
          publicKey: publicKeyOptions
        });
        
        // Step 3: Prepare the credential for the server
        const credentialForServer = {
          id: credential.id,
          type: credential.type,
          rawId: bufferToBase64(credential.rawId),
          response: {
            clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
            attestationObject: bufferToBase64(credential.response.attestationObject)
          },
          clientExtensionResults: credential.getClientExtensionResults(),
        };
        
        // Step 4: Send the credential to the server for verification
        const verificationResponse = await fetch('/api/webauthn/register/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentialForServer)
        });
        
        if (!verificationResponse.ok) {
          const error = await verificationResponse.json();
          throw new Error(error.message || 'Registration verification failed');
        }
        
        const result = await verificationResponse.json();
        showResult('Registration successful! Credential ID: ' + result.credentialId, true);
        
        // Switch to the login tab after successful registration
        setTimeout(() => switchTab('login'), 2000);
      } catch (error) {
        console.error('Registration error:', error);
        showResult('Registration failed: ' + error.message, false);
      }
    }
    
    // Authenticate with a registered device
    async function authenticateDevice() {
      try {
        const userId = parseInt(document.getElementById('loginUserId').value);
        
        if (!userId) {
          showResult('User ID is required', false);
          return;
        }
        
        // Step 1: Get authentication options from server
        const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        if (!optionsResponse.ok) {
          const error = await optionsResponse.json();
          throw new Error(error.message || 'Failed to get authentication options');
        }
        
        // Step 2: Parse the options
        const options = await optionsResponse.json();
        
        // Convert ArrayBuffers back from our custom format
        const publicKeyOptions = {
          ...options,
          challenge: new Uint8Array(options.challenge.data).buffer,
          allowCredentials: options.allowCredentials ? 
            options.allowCredentials.map(cred => ({
              ...cred,
              id: new Uint8Array(cred.id.data).buffer
            })) : undefined
        };
        
        // Step 3: Get the assertion
        const assertion = await navigator.credentials.get({
          publicKey: publicKeyOptions
        });
        
        // Step 4: Prepare the assertion for the server
        const assertionForServer = {
          id: assertion.id,
          type: assertion.type,
          rawId: bufferToBase64(assertion.rawId),
          response: {
            clientDataJSON: bufferToBase64(assertion.response.clientDataJSON),
            authenticatorData: bufferToBase64(assertion.response.authenticatorData),
            signature: bufferToBase64(assertion.response.signature),
            userHandle: assertion.response.userHandle ? 
                        bufferToBase64(assertion.response.userHandle) : null
          }
        };
        
        // Step 5: Send the assertion to the server for verification
        const verificationResponse = await fetch('/api/webauthn/authenticate/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assertionForServer)
        });
        
        if (!verificationResponse.ok) {
          const error = await verificationResponse.json();
          throw new Error(error.message || 'Authentication verification failed');
        }
        
        const result = await verificationResponse.json();
        showResult('Authentication successful! User ID: ' + result.userId, true);
      } catch (error) {
        console.error('Authentication error:', error);
        showResult('Authentication failed: ' + error.message, false);
      }
    }
  </script>
</body>
</html>
`;

// Serve the WebAuthn test page
app.get('/webauthn-test', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(userHTML);
});

// --- WebAuthn API Routes ---

// Generate registration options
app.post('/api/webauthn/register/options', (req, res) => {
  try {
    const { userId, username, displayName } = req.body;
    
    if (!userId || !username || !displayName) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Generate a random challenge
    const challenge = crypto.randomBytes(32);
    const challengeBase64 = challenge.toString('base64');
    
    // Store the challenge for this user
    if (!req.session) req.session = {};
    req.session.webauthnChallenge = challengeBase64;
    req.session.webauthnUserId = userId;
    
    // Get hostname without port
    const rpId = req.get('host')?.split(':')[0] || 'localhost';
    
    // Format for WebAuthn browser API
    const options = {
      challenge: {
        data: Array.from(challenge)
      },
      rp: {
        name: 'Heirloom Identity Platform',
        id: rpId
      },
      user: {
        id: {
          data: Array.from(Buffer.from(String(userId), 'utf8'))
        },
        name: username,
        displayName: displayName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', 
        residentKey: 'preferred',
        userVerification: 'required'
      },
      timeout: 60000,
      attestation: 'none'
    };
    
    // Get existing credentials for this user from our in-memory storage
    const existingCreds = Array.from(credentials.entries())
      .filter(([_, cred]) => cred.userId === userId)
      .map(([credId, _]) => ({
        type: 'public-key',
        id: {
          data: Array.from(Buffer.from(credId, 'base64'))
        }
      }));
    
    if (existingCreds.length > 0) {
      options.excludeCredentials = existingCreds;
    }
    
    res.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    res.status(500).json({ message: 'Failed to generate registration options' });
  }
});

// Verify and store registration
app.post('/api/webauthn/register/verify', (req, res) => {
  try {
    const { id, rawId, response, type } = req.body;
    
    if (!req.session?.webauthnChallenge) {
      return res.status(400).json({ message: 'Registration session expired or invalid' });
    }
    
    // Parse the client data
    const clientDataBuffer = Buffer.from(response.clientDataJSON, 'base64');
    const clientDataJSON = JSON.parse(clientDataBuffer.toString());
    
    // Verify challenge
    const expectedChallenge = req.session.webauthnChallenge;
    const receivedChallenge = clientDataJSON.challenge;
    
    const expectedChallengeBuffer = Buffer.from(expectedChallenge, 'base64');
    const expectedBase64url = expectedChallengeBuffer.toString('base64')
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=/g, '');
    
    if (receivedChallenge !== expectedBase64url) {
      return res.status(400).json({ 
        message: 'Challenge verification failed',
        expected: expectedBase64url,
        received: receivedChallenge
      });
    }
    
    // Verify origin
    const origin = clientDataJSON.origin;
    const expectedOrigin = `${req.protocol}://${req.get('host')}`;
    
    if (origin !== expectedOrigin) {
      return res.status(400).json({ message: 'Origin verification failed' });
    }
    
    // Store the credential
    const userId = req.session.webauthnUserId;
    
    // In a real app, we would store this in a database
    credentials.set(rawId, {
      id: rawId,
      userId: userId,
      publicKey: rawId, // Simplified - in a real app we'd extract the public key
      counter: 0,
      createdAt: new Date()
    });
    
    // Clear the challenge
    delete req.session.webauthnChallenge;
    
    res.status(201).json({ 
      message: 'Registration successful',
      credentialId: rawId
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ message: 'Registration verification failed' });
  }
});

// Generate authentication options
app.post('/api/webauthn/authenticate/options', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Find credentials for this user
    const userCredentials = Array.from(credentials.entries())
      .filter(([_, cred]) => cred.userId === userId)
      .map(([credId, _]) => ({
        type: 'public-key',
        id: {
          data: Array.from(Buffer.from(credId, 'base64'))
        }
      }));
    
    if (userCredentials.length === 0) {
      return res.status(400).json({ 
        message: 'No credentials found for this user. Please register first.' 
      });
    }
    
    // Generate a challenge
    const challenge = crypto.randomBytes(32);
    const challengeBase64 = challenge.toString('base64');
    
    // Store the challenge
    if (!req.session) req.session = {};
    req.session.webauthnChallenge = challengeBase64;
    req.session.webauthnUserId = userId;
    
    // Create authentication options
    const options = {
      challenge: {
        data: Array.from(challenge)
      },
      timeout: 60000,
      rpId: req.get('host')?.split(':')[0] || 'localhost',
      allowCredentials: userCredentials,
      userVerification: 'required'
    };
    
    res.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    res.status(500).json({ message: 'Failed to generate authentication options' });
  }
});

// Verify authentication
app.post('/api/webauthn/authenticate/verify', (req, res) => {
  try {
    const { id, rawId, response, type } = req.body;
    
    if (!req.session?.webauthnChallenge) {
      return res.status(400).json({ message: 'Authentication session expired or invalid' });
    }
    
    // Get the credential
    const credential = credentials.get(rawId);
    if (!credential) {
      return res.status(400).json({ message: 'Unknown credential' });
    }
    
    // Verify user ID
    const userId = req.session.webauthnUserId;
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Credential does not belong to this user' });
    }
    
    // Parse client data
    const clientDataBuffer = Buffer.from(response.clientDataJSON, 'base64');
    const clientDataJSON = JSON.parse(clientDataBuffer.toString());
    
    // Verify challenge
    const expectedChallenge = req.session.webauthnChallenge;
    const receivedChallenge = clientDataJSON.challenge;
    
    const expectedChallengeBuffer = Buffer.from(expectedChallenge, 'base64');
    const expectedBase64url = expectedChallengeBuffer.toString('base64')
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=/g, '');
    
    if (receivedChallenge !== expectedBase64url) {
      return res.status(400).json({ message: 'Challenge verification failed' });
    }
    
    // Verify origin
    const origin = clientDataJSON.origin;
    const expectedOrigin = `${req.protocol}://${req.get('host')}`;
    
    if (origin !== expectedOrigin) {
      return res.status(400).json({ message: 'Origin verification failed' });
    }
    
    // Verify type
    if (clientDataJSON.type !== 'webauthn.get') {
      return res.status(400).json({ message: 'Type verification failed' });
    }
    
    // Update the credential counter
    credential.counter++;
    credential.lastUsed = new Date();
    credentials.set(rawId, credential);
    
    // Clear the challenge
    delete req.session.webauthnChallenge;
    
    res.json({ 
      message: 'Authentication successful',
      verified: true,
      userId: credential.userId,
      credentialId: rawId
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ message: 'Authentication verification failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    credentials: credentials.size,
    message: 'WebAuthn test server running'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`WebAuthn test server running on port ${PORT}`);
  console.log(`Access the test page at: http://localhost:${PORT}/webauthn-test`);
});