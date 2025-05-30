import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Face verification endpoint
  app.post('/api/verification/face', async (req, res) => {
    try {
      const { image, saveToDb, useTestData } = req.body;
      const userId = req.session?.userId || req.body.userId;
      const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // Log request but not the image data (too large)
      console.log(`[${requestId}] Face verification request - userId: ${userId}, saveToDb: ${saveToDb}, useTestData: ${useTestData}`);

      // If this is a test request with no image, use fallback verification
      if (useTestData || !image) {
        try {
          // Import at usage to avoid issues with Python dependency
          const { detectFaceBasic } = await import('./deepface');

          // Use the JS-only implementation for testing
          const result = await detectFaceBasic(
            // Use sample image data if no image provided
            image || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBARXhpZgAA', 
            userId ? Number(userId) : undefined,
            saveToDb || false
          );

          console.log(`[${requestId}] Basic verification completed successfully`);
          return res.json(result);
        } catch (testError) {
          console.error(`[${requestId}] Basic verification error:`, testError);
          return res.status(500).json({
            success: false,
            message: 'Error in basic verification service',
            error_code: 'BASIC_VERIFICATION_ERROR',
            request_id: requestId,
            details: String(testError).substring(0, 200) // Limit error message size
          });
        }
      }

      // For real verification, use the verification proxy
      try {
        const { verifyFace } = await import('./verification_proxy');

        // Call verification service
        const result = await verifyFace({
          image,
          userId,
          saveToDb: saveToDb || false,
          requestId,
          checkDbOnly: false,
          useBasicDetection: false
        });

        console.log(`[${requestId}] Verification completed with success=${result.success}`);
        return res.json(result);
      } catch (proxyError) {
        console.error(`[${requestId}] Verification proxy error:`, proxyError);

        // Check if we got a structured error or a raw error
        if (proxyError.response && proxyError.response.data) {
          // API returned structured error data
          return res.status(proxyError.response.status || 500).json({
            success: false,
            message: 'Error from verification service',
            error_code: 'VERIFICATION_SERVICE_ERROR',
            request_id: requestId,
            details: proxyError.response.data
          });
        }

        // Fallback to generic error object
        return res.status(500).json({
          success: false,
          message: 'Verification service error',
          error_code: 'PROXY_ERROR',
          request_id: requestId,
          details: String(proxyError).substring(0, 200) // Limit error message size
        });
      }
    } catch (error) {
      const errorId = `err-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      console.error(`[${errorId}] Unhandled error in face verification endpoint:`, error);

      return res.status(500).json({
        success: false,
        message: 'Server error during verification',
        error_code: 'SERVER_ERROR',
        request_id: errorId,
        details: String(error).substring(0, 200) // Limit error message size
      });
    }
  });

  // Simple face verification for basic tests
  app.post('/api/verification/face/basic', async (req, res) => {
    const requestId = `basic-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      const { saveToDb, userId } = req.body;

      console.log(`[${requestId}] Basic face verification request - userId: ${userId}, saveToDb: ${saveToDb}`);

      // Import the deepface module only when needed
      const { detectFaceBasic } = await import('./deepface');

      // Use the JavaScript-only implementation
      const result = await detectFaceBasic(
        // Use blank test image - this is just for testing
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBARXhpZgAA',
        userId ? Number(userId) : undefined,
        saveToDb || false
      );

      // Add timestamp and request ID to results
      result.timestamp = new Date().toISOString();
      result.request_id = requestId;

      console.log(`[${requestId}] Basic verification completed successfully`);
      return res.json(result);
    } catch (error) {
      console.error(`[${requestId}] Error in basic face verification:`, error);

      // Check for different types of errors and handle accordingly
      if (error.code === 'MODULE_NOT_FOUND') {
        return res.status(500).json({
          success: false,
          message: 'Verification module not available',
          error_code: 'MODULE_ERROR',
          request_id: requestId,
          details: 'The verification module could not be loaded'
        });
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return res.status(503).json({
          success: false,
          message: 'Verification service unavailable',
          error_code: 'SERVICE_UNAVAILABLE',
          request_id: requestId,
          details: 'The verification service is currently unavailable'
        });
      }

      // Generic error response
      return res.status(500).json({
        success: false,
        message: 'Server error during basic verification',
        error_code: 'VERIFICATION_ERROR',
        request_id: requestId,
        details: String(error).substring(0, 200) // Limit error message size
      });
    }
  });

  // Python face verification endpoint (alias for /api/verification/face with Python service)
  app.post('/api/verification/face/python', async (req, res) => {
    try {
      const { imageData, saveToDb, userId, timestamp, purpose } = req.body;
      const requestId = `python-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      console.log(`[${requestId}] Python face verification request - userId: ${userId}, saveToDb: ${saveToDb}, purpose: ${purpose}`);

      // Use the verification proxy to call Python service
      const { verifyFace } = await import('./verification_proxy');

      // Call verification service with the image data
      const result = await verifyFace({
        image: imageData,
        userId,
        saveToDb: saveToDb || false,
        requestId,
        checkDbOnly: false,
        useBasicDetection: false
      });

      console.log(`[${requestId}] Python verification completed with success=${result.success}`);
      return res.json(result);
    } catch (error) {
      const errorId = `python-err-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      console.error(`[${errorId}] Error in Python face verification endpoint:`, error);

      return res.status(500).json({
        success: false,
        message: 'Python verification service error',
        error_code: 'PYTHON_VERIFICATION_ERROR',
        request_id: errorId,
        details: String(error).substring(0, 200)
      });
    }
  });

// User registration route
// Debug endpoint for database testing
app.get('/api/debug/test-db', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    
    // Try a simple select first
    const allUsers = await db.select().from(users);
    res.json({ 
      success: true, 
      message: 'Database connection works',
      userCount: allUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Set content type to JSON explicitly
    res.setHeader('Content-Type', 'application/json');

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if username already exists
    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Check if email already exists
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create the user (password will be hashed in storage.createUser)
    const newUser = await storage.createUser({
      username,
      email,
      password
    });

    // In development, automatically verify users for easier testing
    if (process.env.NODE_ENV === 'development') {
      await storage.updateUser(newUser.id, { isVerified: true });
      newUser.isVerified = true;
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours expiry

    // Store email verification
    await storage.createEmailVerification({
      userId: newUser.id,
      email: email,
      token: verificationToken,
      expiresAt: expiresAt
    });

    // TODO: Send verification email
    console.log(`Email verification token for ${email}: ${verificationToken}`);
    console.log(`Verification URL: http://localhost:5001/verify-email/${verificationToken}`);

    // Return success response (exclude password)
    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      },
      requiresEmailVerification: true
    });
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Set content type to JSON explicitly
    res.setHeader('Content-Type', 'application/json');

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Get user from database
    const user = await storage.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Check password
    const passwordMatches = await storage.verifyPassword(user.id, password);

    if (!passwordMatches) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Check if email is verified (skip in development for easier testing)
    if (!user.isVerified && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email address before logging in',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    // Set session
    req.session.userId = user.id;

    // Return user data (excluding sensitive information)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Logout route
app.post('/api/auth/logout', async (req, res) => {
  try {
    // Set content type to JSON explicitly
    res.setHeader('Content-Type', 'application/json');

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error during logout' 
          });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid', { 
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        return res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Already logged out'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    // Set content type to JSON explicitly
    res.setHeader('Content-Type', 'application/json');

    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    const user = await storage.getUser(req.session.userId);

    if (!user) {
      // Invalid session, clear it
      req.session.destroy(err => {
        if (err) console.error('Error destroying session:', err);
      });

      return res.status(401).json({ 
        success: false, 
        message: 'Invalid session' 
      });
    }

    // Return user data (excluding password) in consistent format
    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        memberSince: user.createdAt // Add memberSince for UI
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user data' 
    });
  }
});

// Email verification endpoint
app.get('/api/auth/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }

    // Verify the email using the token
    const isVerified = await storage.markEmailAsVerified(token);

    if (!isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }

    // Get the user to return updated data
    const user = await storage.getUserByVerificationToken(token);

    return res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      } : null
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during email verification' 
    });
  }
});

// Resend verification email endpoint
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address' 
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours expiry

    // Store new email verification
    await storage.createEmailVerification({
      userId: user.id,
      email: email,
      token: verificationToken,
      expiresAt: expiresAt
    });

    // TODO: Send verification email
    console.log(`New verification token for ${email}: ${verificationToken}`);
    console.log(`Verification URL: http://localhost:5001/verify-email/${verificationToken}`);

    return res.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error sending verification email' 
    });
  }
});

// Get user's AI connections
app.get('/api/connections', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const connections = await storage.getAiConnectionsByUserId(req.session.userId);
    return res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching connections' 
    });
  }
});

// OAuth 2.0 Authorization Endpoints

// Initiate OAuth flow for AI services
app.post('/api/oauth/authorize', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { serviceId, scopes } = req.body;
    
    const supportedServices = {
      'claude': {
        name: 'Claude AI',
        authUrl: 'https://console.anthropic.com/oauth/authorize',
        clientId: process.env.CLAUDE_CLIENT_ID || 'demo_client_id',
        defaultScopes: ['identity', 'conversations:read', 'conversations:write']
      },
      'gpt': {
        name: 'OpenAI GPT',
        authUrl: 'https://auth.openai.com/oauth/authorize',
        clientId: process.env.OPENAI_CLIENT_ID || 'demo_client_id',
        defaultScopes: ['identity', 'chat:read', 'chat:write']
      },
      'gemini': {
        name: 'Google Gemini',
        authUrl: 'https://accounts.google.com/oauth/authorize',
        clientId: process.env.GOOGLE_CLIENT_ID || 'demo_client_id',
        defaultScopes: ['profile', 'gemini.conversations']
      }
    };

    const service = supportedServices[serviceId as keyof typeof supportedServices];
    if (!service) {
      return res.status(400).json({ success: false, message: 'Unsupported AI service' });
    }

    // Generate secure state parameter
    const state = crypto.randomBytes(32).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Store OAuth state in session
    req.session.oauthState = {
      state,
      nonce,
      serviceId,
      scopes: scopes || service.defaultScopes,
      timestamp: Date.now()
    };

    // Build authorization URL
    const authUrl = new URL(service.authUrl);
    authUrl.searchParams.set('client_id', service.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', `${req.protocol}://${req.get('host')}/api/oauth/callback`);
    authUrl.searchParams.set('scope', (scopes || service.defaultScopes).join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);

    return res.json({
      success: true,
      authUrl: authUrl.toString(),
      serviceName: service.name,
      scopes: scopes || service.defaultScopes
    });
  } catch (error) {
    console.error('OAuth authorize error:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate OAuth flow' });
  }
});

// OAuth callback handler
app.get('/api/oauth/callback', async (req, res) => {
  const { code, state, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`/dashboard?error=oauth_failed&reason=${encodeURIComponent(error as string)}`);
  }

  // Validate state parameter
  if (!req.session?.oauthState || req.session.oauthState.state !== state) {
    console.error('Invalid OAuth state');
    return res.redirect('/dashboard?error=invalid_state');
  }

  // Check if state is expired (5 minutes)
  if (Date.now() - req.session.oauthState.timestamp > 5 * 60 * 1000) {
    delete req.session.oauthState;
    return res.redirect('/dashboard?error=state_expired');
  }

  const { serviceId, scopes } = req.session.oauthState;
  delete req.session.oauthState; // Clean up

  try {
    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(serviceId, code as string, req);
    
    if (!tokenResponse.success) {
      throw new Error(tokenResponse.error || 'Token exchange failed');
    }

    // Store the connection in database
    await storage.createAiConnection({
      userId: req.session.userId!,
      aiServiceName: getServiceDisplayName(serviceId),
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      scopes: scopes,
      expiresAt: tokenResponse.expiresAt
    });

    // Redirect back to dashboard with success
    return res.redirect('/dashboard?success=connection_added&service=' + encodeURIComponent(getServiceDisplayName(serviceId)));

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect('/dashboard?error=connection_failed');
  }
});

// Helper function to exchange code for token
async function exchangeCodeForToken(serviceId: string, code: string, req: any) {
  const supportedServices = {
    'claude': {
      tokenUrl: 'https://console.anthropic.com/oauth/token',
      clientId: process.env.CLAUDE_CLIENT_ID || 'demo_client_id',
      clientSecret: process.env.CLAUDE_CLIENT_SECRET || 'demo_secret'
    },
    'gpt': {
      tokenUrl: 'https://auth.openai.com/oauth/token',
      clientId: process.env.OPENAI_CLIENT_ID || 'demo_client_id',
      clientSecret: process.env.OPENAI_CLIENT_SECRET || 'demo_secret'
    },
    'gemini': {
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: process.env.GOOGLE_CLIENT_ID || 'demo_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo_secret'
    }
  };

  const service = supportedServices[serviceId as keyof typeof supportedServices];
  if (!service) {
    return { success: false, error: 'Unsupported service' };
  }

  // For demo purposes, return mock tokens
  if (service.clientId === 'demo_client_id') {
    return {
      success: true,
      accessToken: `demo_access_token_${serviceId}_${Date.now()}`,
      refreshToken: `demo_refresh_token_${serviceId}_${Date.now()}`,
      expiresAt: Math.floor((Date.now() + 3600000) / 1000) // 1 hour from now
    };
  }

  // In production, make actual HTTP request to token endpoint
  try {
    const response = await fetch(service.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: service.clientId,
        client_secret: service.clientSecret,
        code: code,
        redirect_uri: `${req.protocol}://${req.get('host')}/api/oauth/callback`
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error_description || data.error || 'Token exchange failed' };
    }

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    return { success: false, error: 'Network error during token exchange' };
  }
}

// Helper function to get display name for service
function getServiceDisplayName(serviceId: string): string {
  const names = {
    'claude': 'Claude AI',
    'gpt': 'OpenAI GPT',
    'gemini': 'Google Gemini'
  };
  return names[serviceId as keyof typeof names] || serviceId;
}

// Get user's identity capsules
app.get('/api/capsules', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const capsules = await storage.getCapsulesByUserId(req.session.userId);
    return res.json(capsules);
  } catch (error) {
    console.error('Error fetching capsules:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching capsules' 
    });
  }
});

  // Create an HTTP server
  const httpServer = createServer(app);

  return httpServer;
}