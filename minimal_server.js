// Simple Express server for testing face verification
import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' }));

// Basic route to test server functionality
app.get('/', (req, res) => {
  res.send('Face verification server is running');
});

// Face verification endpoint
app.post('/verify', (req, res) => {
  try {
    console.log('Received verification request');
    
    const { image, saveToDb = false, userId } = req.body;
    
    // Validate image data
    if (!image || !image.startsWith('data:image/')) {
      return res.json({
        success: false,
        confidence: 0,
        message: 'Invalid image format'
      });
    }
    
    // Generate a unique face ID
    const face_id = crypto.randomUUID();
    
    // Save to "database" if requested
    if (saveToDb && userId) {
      try {
        const dbDir = path.join(process.cwd(), 'face_db');
        
        // Create face_db directory if it doesn't exist
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
        
        // Create a user directory if it doesn't exist
        const userDir = path.join(dbDir, `user_${userId}`);
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }
        
        // Save face metadata
        const metadataFile = path.join(userDir, `${face_id}.json`);
        const metadata = {
          face_id,
          userId,
          timestamp: new Date().toISOString()
        };
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
        
        console.log(`Face metadata saved: ${metadataFile}`);
      } catch (saveError) {
        console.error(`Error saving face: ${saveError}`);
      }
    }
    
    // Return successful verification
    res.json({
      success: true,
      confidence: 90.5,
      message: 'Face verified successfully',
      face_id,
      results: {
        age: 30,
        gender: 'Male',
        dominant_race: 'Unknown',
        dominant_emotion: 'Neutral'
      }
    });
    
  } catch (error) {
    console.error('Error during verification:', error);
    res.json({
      success: false,
      confidence: 0,
      message: 'Server error during verification',
      details: String(error)
    });
  }
});

// Start the server
const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Minimal face verification server is running at http://localhost:${port}`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});