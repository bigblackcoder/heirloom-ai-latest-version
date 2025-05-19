/**
 * File Storage Routes
 * Secure implementation of file operations using Replit's filesystem
 * instead of AWS S3 or other cloud storage requiring credentials
 */

import { Router, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { 
  storeFile, 
  getFile, 
  deleteFile, 
  listFiles 
} from '../utils/replit-storage';

const router = Router();

// Middleware for file uploads
router.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
}));

/**
 * Upload a file
 * POST /api/files
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const uploadedFile = req.files.file as fileUpload.UploadedFile;
    const isPublic = req.body.public === 'true';
    
    // Store the file in Replit's filesystem
    const filePath = await storeFile(
      uploadedFile.data,
      uploadedFile.mimetype,
      uploadedFile.name,
      isPublic
    );
    
    res.status(201).json({ 
      message: 'File uploaded successfully',
      filePath,
      isPublic,
      fileName: uploadedFile.name,
      fileType: uploadedFile.mimetype,
      fileSize: uploadedFile.size
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

/**
 * Get a file
 * GET /api/files/:fileName
 */
router.get('/:fileName', async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const isPublic = req.query.public === 'true';
    
    const fileData = await getFile(fileName, isPublic);
    
    // Set appropriate content type
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      res.contentType('image/jpeg');
    } else if (fileName.endsWith('.png')) {
      res.contentType('image/png');
    } else if (fileName.endsWith('.svg')) {
      res.contentType('image/svg+xml');
    } else if (fileName.endsWith('.pdf')) {
      res.contentType('application/pdf');
    } else {
      res.contentType('application/octet-stream');
    }
    
    res.send(fileData);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(404).json({ message: 'File not found' });
  }
});

/**
 * Delete a file
 * DELETE /api/files/:fileName
 */
router.delete('/:fileName', async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const isPublic = req.query.public === 'true';
    
    await deleteFile(fileName, isPublic);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

/**
 * List all files
 * GET /api/files
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const privateFiles = await listFiles(false);
    const publicFiles = await listFiles(true);
    
    res.json({
      private: privateFiles,
      public: publicFiles
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ message: 'Failed to list files' });
  }
});

export default router;