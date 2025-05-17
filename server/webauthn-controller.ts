import { Request, Response } from "express";
import { storage } from "./storage";
import crypto from "crypto";
import { verifyFace } from "./deepface";
import { v4 as uuidv4 } from "uuid";

// Store challenges temporarily in memory for verification
const challenges = new Map<string, { 
  challenge: string, 
  username: string, 
  createdAt: number 
}>();

// Clean up expired challenges (5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of challenges.entries()) {
    if (now - value.createdAt > 5 * 60 * 1000) {
      challenges.delete(key);
    }
  }
}, 60 * 1000);

// Generate a random buffer
function generateRandomBuffer(length: number): Buffer {
  return crypto.randomBytes(length);
}

// Convert buffer to URL-safe base64
function bufferToBase64URLString(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Convert URL-safe base64 to buffer
function base64URLStringToBuffer(base64URLString: string): Buffer {
  // Add back any missing padding
  base64URLString = base64URLString.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64URLString.length % 4;
  if (padding > 0) {
    base64URLString += '='.repeat(4 - padding);
  }
  return Buffer.from(base64URLString, 'base64');
}

// Generate registration options for WebAuthn client
export async function getRegistrationOptions(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }

    // Generate a new random challenge
    const challenge = generateRandomBuffer(32);
    const challengeId = uuidv4();
    
    // Store the challenge for later verification
    challenges.set(challengeId, {
      challenge: bufferToBase64URLString(challenge),
      username,
      createdAt: Date.now()
    });

    // Get or create a user
    let user = await storage.getUserByUsername(username);
    
    if (!user) {
      // For testing, we create the user if it doesn't exist
      user = await storage.createUser({
        username,
        email: `${username}@example.com`,
        password: crypto.randomBytes(16).toString('hex'), // random password for test user
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generate registration options
    const registrationOptions = {
      challenge: bufferToBase64URLString(challenge),
      rp: {
        name: "Heirloom Identity Platform",
        id: req.hostname || "localhost"
      },
      user: {
        id: bufferToBase64URLString(Buffer.from(String(user.id), 'utf8')),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Prefer platform authenticator (e.g., Face ID, Touch ID)
        userVerification: "preferred",
        requireResidentKey: false
      },
      timeout: 60000, // 1 minute
      attestation: "none",
      extensions: {
        credProps: true
      }
    };

    // Add challenge ID to session for verification
    if (req.session) {
      req.session.challengeId = challengeId;
    }

    res.status(200).json(registrationOptions);
  } catch (error) {
    console.error("Error generating registration options:", error);
    res.status(500).json({ message: "Error generating registration options" });
  }
}

// Verify registration response from WebAuthn client
export async function verifyRegistration(req: Request, res: Response): Promise<void> {
  try {
    const { id, rawId, response, type } = req.body;

    // Get challenge from session
    if (!req.session || !req.session.challengeId) {
      res.status(400).json({ message: "No challenge found in session" });
      return;
    }

    const challengeData = challenges.get(req.session.challengeId);
    if (!challengeData) {
      res.status(400).json({ message: "Challenge expired or invalid" });
      return;
    }

    const { challenge, username } = challengeData;
    
    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // In a production environment, you would use a WebAuthn library to verify
    // the attestation and register the credential. For this demo, we'll just store
    // the credential ID and public key.

    // Store credential in the database
    const credential = await storage.createCredential({
      userId: String(user.id),
      credentialId: id,
      publicKey: JSON.stringify(response),
      createdAt: new Date(),
      updatedAt: new Date(),
      counter: 0, // Initial counter value
      transports: [], // Optional transports
    });

    // Remove the used challenge
    challenges.delete(req.session.challengeId);
    delete req.session.challengeId;

    res.status(200).json({ 
      message: "Registration successful", 
      username: user.username,
      registered: true,
      credentialId: id 
    });
  } catch (error) {
    console.error("Error verifying registration:", error);
    res.status(500).json({ message: "Error verifying registration" });
  }
}

// Generate authentication options for WebAuthn client
export async function getAuthenticationOptions(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }

    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get credentials for this user
    const credentials = await storage.getCredentialsByUserId(String(user.id));
    if (!credentials || credentials.length === 0) {
      res.status(400).json({ message: "No credentials found for this user" });
      return;
    }

    // Generate a new random challenge
    const challenge = generateRandomBuffer(32);
    const challengeId = uuidv4();
    
    // Store the challenge for later verification
    challenges.set(challengeId, {
      challenge: bufferToBase64URLString(challenge),
      username,
      createdAt: Date.now()
    });

    // Generate authentication options
    const authenticationOptions = {
      challenge: bufferToBase64URLString(challenge),
      timeout: 60000, // 1 minute
      rpId: req.hostname || "localhost",
      allowCredentials: credentials.map(cred => ({
        id: cred.credentialId,
        type: "public-key",
        transports: cred.transports || ["internal"]
      })),
      userVerification: "preferred"
    };

    // Add challenge ID to session for verification
    if (req.session) {
      req.session.challengeId = challengeId;
    }

    res.status(200).json(authenticationOptions);
  } catch (error) {
    console.error("Error generating authentication options:", error);
    res.status(500).json({ message: "Error generating authentication options" });
  }
}

// Verify authentication response from WebAuthn client
export async function verifyAuthentication(req: Request, res: Response): Promise<void> {
  try {
    const { id, rawId, response, type } = req.body;

    // Get challenge from session
    if (!req.session || !req.session.challengeId) {
      res.status(400).json({ message: "No challenge found in session" });
      return;
    }

    const challengeData = challenges.get(req.session.challengeId);
    if (!challengeData) {
      res.status(400).json({ message: "Challenge expired or invalid" });
      return;
    }

    const { challenge, username } = challengeData;
    
    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get credential for this user and credential ID
    const credential = await storage.getCredential(id, String(user.id));
    if (!credential) {
      res.status(400).json({ message: "Credential not found" });
      return;
    }

    // In a production environment, you would use a WebAuthn library to verify
    // the assertion and update the credential counter. For this demo, we'll just
    // update the user session.

    // Set user session
    if (req.session) {
      req.session.userId = String(user.id);
      req.session.isVerified = true;
    }

    // Update credential counter (not implemented in this demo)
    // await storage.updateCredentialCounter(credential.id, newCounter);

    // Remove the used challenge
    challenges.delete(req.session.challengeId);
    delete req.session.challengeId;

    res.status(200).json({ 
      message: "Authentication successful", 
      username: user.username,
      authenticated: true
    });
  } catch (error) {
    console.error("Error verifying authentication:", error);
    res.status(500).json({ message: "Error verifying authentication" });
  }
}

// Handle hybrid registration (WebAuthn + Face)
export async function hybridRegistration(req: Request, res: Response): Promise<void> {
  try {
    const { username, faceImage, credential } = req.body;

    if (!username || !faceImage || !credential) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // First, handle WebAuthn registration
    if (!req.session || !req.session.challengeId) {
      res.status(400).json({ message: "No challenge found in session" });
      return;
    }

    const challengeData = challenges.get(req.session.challengeId);
    if (!challengeData) {
      res.status(400).json({ message: "Challenge expired or invalid" });
      return;
    }

    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Store WebAuthn credential
    const savedCredential = await storage.createCredential({
      userId: String(user.id),
      credentialId: credential.id,
      publicKey: JSON.stringify(credential.response),
      createdAt: new Date(),
      updatedAt: new Date(),
      counter: 0,
      transports: [],
    });

    // Next, handle face registration
    // Convert base64 to buffer for face verification
    const imageBuffer = Buffer.from(faceImage, 'base64');
    const userIdString = String(user.id);

    // Verify and save face
    const faceResult = await verifyFace(faceImage, userIdString, true);
    
    if (!faceResult.success) {
      // Remove credential if face verification fails
      await storage.deleteCredential(credential.id);
      res.status(400).json({ message: "Face verification failed: " + faceResult.message });
      return;
    }

    // Mark user as verified
    await storage.updateUser(userIdString, { isVerified: true });

    // Remove the used challenge
    challenges.delete(req.session.challengeId);
    delete req.session.challengeId;

    // Set user session
    if (req.session) {
      req.session.userId = String(user.id);
      req.session.isVerified = true;
    }

    res.status(200).json({ 
      message: "Hybrid registration successful", 
      username: user.username,
      registered: true,
      credentialId: credential.id,
      faceId: faceResult.face_id
    });
  } catch (error) {
    console.error("Error in hybrid registration:", error);
    res.status(500).json({ message: "Error during hybrid registration" });
  }
}

// Handle hybrid verification (WebAuthn + Face)
export async function hybridVerification(req: Request, res: Response): Promise<void> {
  try {
    const { id, rawId, response, type, faceImage } = req.body;

    if (!id || !response || !faceImage) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // First, verify WebAuthn assertion
    if (!req.session || !req.session.challengeId) {
      res.status(400).json({ message: "No challenge found in session" });
      return;
    }

    const challengeData = challenges.get(req.session.challengeId);
    if (!challengeData) {
      res.status(400).json({ message: "Challenge expired or invalid" });
      return;
    }

    const { username } = challengeData;
    
    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get credential for this user and credential ID
    const credential = await storage.getCredential(id, String(user.id));
    if (!credential) {
      res.status(400).json({ message: "Credential not found" });
      return;
    }

    // Next, verify face with the server
    // Convert base64 to buffer for face verification
    const imageBuffer = Buffer.from(faceImage, 'base64');
    const userIdString = String(user.id);

    // Verify face against stored face data
    const faceResult = await verifyFace(faceImage, userIdString, false);
    
    if (!faceResult.success || !faceResult.matched) {
      res.status(401).json({ 
        message: "Face verification failed",
        details: faceResult.message 
      });
      return;
    }

    // Both WebAuthn and face verification passed
    // Set user session
    if (req.session) {
      req.session.userId = String(user.id);
      req.session.isVerified = true;
    }

    // Remove the used challenge
    challenges.delete(req.session.challengeId);
    delete req.session.challengeId;

    res.status(200).json({ 
      message: "Hybrid verification successful", 
      username: user.username,
      authenticated: true,
      deviceVerified: true,
      faceVerified: true
    });
  } catch (error) {
    console.error("Error in hybrid verification:", error);
    res.status(500).json({ message: "Error during hybrid verification" });
  }
}