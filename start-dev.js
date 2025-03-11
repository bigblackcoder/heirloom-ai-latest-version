/**
 * Heirloom Identity Platform - Development Server
 * This script starts the Vite development server for the React frontend
 * and provides API endpoints for the backend.
 */

const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const path = require('path');
const { execSync } = require('child_process');
const { spawn } = require('child_process');
const { createServer: createViteServer } = require('vite');

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Kill any existing server processes
try {
  execSync('pkill -f "node.*pure-server.js"', { stdio: 'ignore' });
  console.log('Stopped any existing server processes');
} catch (error) {
  // Ignore errors if no process was found
}

// Configure middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Configure sessions
app.use(session({
  secret: 'heirloom-identity-platform-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 86400000 }, // 24 hours
  store: new MemoryStore({
    checkPeriod: 86400000 // 24 hours
  })
}));

// In-memory storage for development
const users = new Map();
let nextUserId = 1;

// API Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Check if username exists
    for (const user of users.values()) {
      if (user.username === username) {
        return res.status(409).json({ error: "Username already exists" });
      }
    }
    
    // Create user
    const user = {
      id: nextUserId++,
      firstName,
      lastName,
      username,
      email,
      password, // In a real app, we'd hash this
      isVerified: false,
      memberSince: new Date().toISOString(),
      avatar: null
    };
    
    users.set(user.id, user);
    
    // Set session
    req.session.userId = user.id;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Find user
    let foundUser = null;
    for (const user of users.values()) {
      if (user.username === username) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      // For development, create a mock user if none exists
      foundUser = {
        id: nextUserId++,
        firstName: "Test",
        lastName: "User",
        username,
        email: `${username}@example.com`,
        password,
        isVerified: false,
        memberSince: new Date().toISOString(),
        avatar: null
      };
      users.set(foundUser.id, foundUser);
    }
    
    // Set session
    req.session.userId = foundUser.id;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = foundUser;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: "Login failed" });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ error: "Logout failed" });
        }
        
        res.clearCookie('connect.sid');
        return res.json({ message: "Logged out successfully" });
      });
    } else {
      return res.json({ message: "No session to logout from" });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: "Logout failed" });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Get user from memory
    const user = users.get(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: "Failed to get user data" });
  }
});

// Face Verification API
app.post('/api/verification/face', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image data provided' 
      });
    }
    
    // For development, mock a successful verification
    const verificationResult = {
      success: true,
      confidence: 0.95,
      results: {
        age: 29,
        gender: "Man",
        dominant_race: "white",
        dominant_emotion: "neutral"
      }
    };
    
    // Update user's verification status
    const user = users.get(req.session.userId);
    if (user) {
      user.isVerified = true;
      users.set(user.id, user);
    }
    
    return res.json(verificationResult);
  } catch (error) {
    console.error('Face verification error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Face verification failed",
      details: error.message
    });
  }
});

// API for identity capsules
app.get('/api/capsules', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Mock data for development
    const capsules = [
      {
        id: 1,
        userId: req.session.userId,
        name: "Personal Identity",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: req.session.userId,
        name: "Professional Identity",
        createdAt: new Date().toISOString()
      }
    ];
    
    return res.json({ capsules });
  } catch (error) {
    console.error('Get capsules error:', error);
    return res.status(500).json({ error: "Failed to get identity capsules" });
  }
});

// API for connections
app.get('/api/connections', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Mock data for development
    const connections = [
      {
        id: 1,
        userId: req.session.userId,
        aiServiceName: "OpenAI",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      },
      {
        id: 2,
        userId: req.session.userId,
        aiServiceName: "Anthropic",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      }
    ];
    
    return res.json({ connections });
  } catch (error) {
    console.error('Get connections error:', error);
    return res.status(500).json({ error: "Failed to get AI connections" });
  }
});

// API for activities
app.get('/api/activities', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Mock data for development
    const activities = [
      {
        id: 1,
        userId: req.session.userId,
        type: "verification",
        description: "Face verification completed",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: req.session.userId,
        type: "connection",
        description: "Connected to OpenAI service",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        userId: req.session.userId,
        type: "capsule",
        description: "Created new identity capsule",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return res.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    return res.status(500).json({ error: "Failed to get activities" });
  }
});

// Health check endpoint
app.get('/healthcheck', (_req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    // Create Vite server
    const vite = await createViteServer({
      root: path.join(__dirname, 'client'),
      server: {
        middlewareMode: true,
        hmr: {
          server
        }
      }
    });
    
    // Use Vite middlewares
    app.use(vite.middlewares);
    
    // Fallback for SPA routing
    app.use('*', async (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      
      try {
        // Read index.html
        let template = path.resolve(__dirname, 'client', 'index.html');
        
        // Send the template
        res.sendFile(template);
      } catch (e) {
        console.error(e);
        res.status(500).end(e.message);
      }
    });
    
    // Start the server
    const PORT = process.env.PORT || 5173;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Heirloom Identity Platform development server running at http://0.0.0.0:${PORT}`);
    });
  } catch (e) {
    console.error('Error starting server:', e);
  }
}

startServer();