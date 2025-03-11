// Simple server runner
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { spawn } = require('child_process');
const bcrypt = require('bcryptjs');

// Create Express application
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'heirloom-identity-capsule-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// In-memory user storage
const users = new Map();
let nextUserId = 1;

// Simple user registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if username exists
    for (const user of users.values()) {
      if (user.username === username) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: nextUserId++,
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
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
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
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
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = foundUser.id;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = foundUser;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = users.get(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out successfully' });
      });
    } else {
      return res.json({ message: 'No session to logout from' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// Face verification
app.post('/api/verification/face', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    
    // Run Python face verification
    const pythonProcess = spawn('python3', ['./server/face_verification.py']);
    let outputData = '';
    let errorData = '';

    // Send input to the script
    pythonProcess.stdin.write(imageBase64);
    pythonProcess.stdin.end();

    // Collect output from the script
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect error output from the script
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python script exited with code ${code}: ${errorData}`));
        }
      });
    });
    
    // Parse the JSON result
    const verificationResult = JSON.parse(outputData.trim());
    
    // Update user's verification status if successful
    if (verificationResult.success && verificationResult.confidence > 0.7) {
      const user = users.get(req.session.userId);
      if (user) {
        user.isVerified = true;
        users.set(user.id, user);
      }
    }
    
    return res.json(verificationResult);
  } catch (error) {
    console.error('Face verification error:', error);
    return res.status(500).json({ 
      error: 'Face verification failed',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/healthcheck', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});