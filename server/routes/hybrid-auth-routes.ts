
import { Router } from 'express';
import multer from 'multer';
import { 
  handleDeepFaceVerification, 
  handleNativeVerification, 
  registerFace, 
  listUsers 
} from '../hybrid_verification';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Register a new face
router.post('/register', upload.single('file'), registerFace);

// Verify using DeepFace
router.post('/verify', upload.single('file'), handleDeepFaceVerification);

// Verify using native biometrics (Apple FaceID or Google Biometric)
router.post('/verify_native', handleNativeVerification);

// List registered users
router.get('/users', listUsers);

// Serve registered face images
router.get('/registered_faces/:userId.jpg', (req, res) => {
  const userId = req.params.userId;
  // This is a simplified implementation - in production you would:
  // 1. Check user authentication
  // 2. Verify permissions
  // 3. Handle multiple faces per user properly
  
  const fs = require('fs');
  const path = require('path');
  const dbDir = path.join(process.cwd(), 'face_db');
  const userDir = path.join(dbDir, userId);
  
  if (!fs.existsSync(userDir)) {
    return res.status(404).send('User not found');
  }
  
  // Find the first jpg file in the user directory
  const files = fs.readdirSync(userDir).filter(file => file.endsWith('.jpg'));
  
  if (files.length === 0) {
    return res.status(404).send('No face image found');
  }
  
  res.sendFile(path.join(userDir, files[0]));
});

export default router;
