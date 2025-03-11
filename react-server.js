const express = require('express');
const { createServer } = require('http');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const fs = require('fs');
const { spawn } = require('child_process');

// Create Express application
const app = express();
const server = createServer(app);

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
    
    // Verify face using Python script
    const result = await verifyFaceWithPython(base64Data);
    
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

// Function to verify face with Python script
async function verifyFaceWithPython(imageData) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'server', 'face_verification.py');
    
    // Create a temporary file to store the base64 data
    const tempFile = path.join(__dirname, `temp_${Date.now()}.txt`);
    fs.writeFileSync(tempFile, imageData);
    
    const pythonProcess = spawn('python', [pythonScript, '--verify', tempFile]);
    
    let responseData = '';
    pythonProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFile);
      } catch (err) {
        console.error('Error removing temp file:', err);
      }
      
      if (code === 0) {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python response: ${error.message}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}`));
      }
    });
  });
}

// Health check endpoint
app.get('/healthcheck', (_req, res) => {
  res.json({ status: 'ok' });
});

// Generate test face image
app.get('/api/generate-test-image', (_req, res) => {
  const pythonScript = path.join(__dirname, 'server', 'face_verification.py');
  const outputPath = path.join(__dirname, 'test_face.jpg');
  
  const pythonProcess = spawn('python', [pythonScript, '--generate', '--output', outputPath]);
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
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

// Start Vite dev server in a separate process
function startViteDevServer() {
  console.log('Starting Vite dev server for React application...');
  
  // Spawn a new process to run Vite
  const viteProcess = spawn('npx', ['vite', '--port', '5173', '--config', 'vite.config.ts', '--host', '0.0.0.0'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });
  
  viteProcess.stdout.on('data', (data) => {
    console.log(`Vite: ${data.toString().trim()}`);
  });
  
  viteProcess.stderr.on('data', (data) => {
    console.error(`Vite error: ${data.toString().trim()}`);
  });
  
  viteProcess.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
  });
  
  return viteProcess;
}

// Proxy requests to Vite dev server
app.use('/', (req, res, next) => {
  // Skip API requests
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Proxy other requests to the Vite dev server
  const viteUrl = `http://localhost:5173${req.url}`;
  
  // Use fetch to proxy the request
  fetch(viteUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
  })
  .then(viteResponse => {
    res.status(viteResponse.status);
    
    // Copy headers from Vite response
    for (const [key, value] of viteResponse.headers.entries()) {
      res.setHeader(key, value);
    }
    
    return viteResponse.blob();
  })
  .then(blob => {
    const arrayBuffer = blob.arrayBuffer ? blob.arrayBuffer() : Promise.resolve(blob);
    return arrayBuffer;
  })
  .then(buffer => {
    res.send(Buffer.from(buffer));
  })
  .catch(error => {
    console.error('Error proxying to Vite:', error);
    res.status(500).send('Error proxying to Vite development server');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Heirloom Identity Platform server running on http://0.0.0.0:${PORT}`);
  
  // Start Vite dev server
  const viteProcess = startViteDevServer();
  
  // Handle server shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    viteProcess.kill();
    server.close(() => {
      console.log('Server shut down.');
      process.exit(0);
    });
  });
});