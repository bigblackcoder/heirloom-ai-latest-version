const express = require('express');
const { createServer: createViteServer } = require('vite');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const { exec } = require('child_process');

// Import the deepface module for face verification
const deepface = require('./server/deepface');

// Create Express application
const app = express();

// Enable CORS and JSON body parsing
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(
  session({
    secret: 'heirloom-identity-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  })
);

// In-memory storage
let users = [];
let nextUserId = 1;

// API Routes
app.post('/api/auth/register', (req, res) => {
  const { username, password, firstName, lastName, email } = req.body;
  
  if (!username || !password || !firstName || !lastName || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  const newUser = {
    id: nextUserId++,
    username,
    password, // In a real app, this should be hashed
    firstName,
    lastName,
    email,
    isVerified: false,
    memberSince: new Date().toISOString(),
    avatar: null
  };
  
  users.push(newUser);
  
  // Set user in session
  req.session.userId = newUser.id;
  
  return res.status(201).json({
    user: {
      id: newUser.id,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      isVerified: newUser.isVerified,
      memberSince: newUser.memberSince,
      avatar: newUser.avatar
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Set user in session
  req.session.userId = user.id;
  
  return res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      memberSince: user.memberSince,
      avatar: user.avatar
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const user = users.find(u => u.id === req.session.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  return res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      memberSince: user.memberSince,
      avatar: user.avatar
    }
  });
});

app.post('/api/verification/face', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }
    
    // Remove the data URL prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Verify face using the deepface module
    const result = await deepface.verifyFace(base64Data);
    
    // If verification was successful, update user
    if (result.success) {
      const user = users.find(u => u.id === req.session.userId);
      if (user) {
        user.isVerified = true;
      }
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Face verification failed',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/healthcheck', (_req, res) => {
  res.json({ status: 'ok' });
});

// Generate test face image
app.get('/api/generate-test-image', (_req, res) => {
  const pythonScript = path.join(__dirname, 'server', 'face_verification.py');
  const outputPath = path.join(__dirname, 'test_face.jpg');
  
  exec(`python ${pythonScript} --generate --output ${outputPath}`, (error) => {
    if (error) {
      console.error('Error generating test image:', error);
      return res.status(500).json({ message: 'Failed to generate test image' });
    }
    
    try {
      const imageBuffer = fs.readFileSync(outputPath);
      const base64Image = imageBuffer.toString('base64');
      res.status(200).json({
        imageData: `data:image/jpeg;base64,${base64Image}`
      });
    } catch (readError) {
      console.error('Error reading test image:', readError);
      res.status(500).json({ message: 'Failed to read test image' });
    }
  });
});

// Vite integration
async function createViteDevServer() {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: true
    },
    appType: 'spa',
    root: path.resolve(__dirname, 'client'),
  });
  
  app.use(vite.middlewares);
  
  // Catch-all route to serve the SPA
  app.use('*', (req, res, next) => {
    try {
      // Send the index.html for all requests that don't match an API route
      res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
    } catch (e) {
      next(e);
    }
  });
}

async function startServer() {
  try {
    // Set up Vite in development mode
    await createViteDevServer();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Heirloom Identity Platform server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();