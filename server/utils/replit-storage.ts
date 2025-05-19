/**
 * Replit Storage Utility
 * This utility provides S3-like functionality using Replit's filesystem
 * Use this instead of AWS S3 for storing files and assets
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';

// Convert fs functions to Promise-based
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Base directory for storing files
const STORAGE_DIR = path.resolve('./storage');
const PUBLIC_DIR = path.resolve('./public/uploads');

// Ensure storage directories exist
async function ensureDirectoryExists(directory: string): Promise<void> {
  try {
    await stat(directory);
  } catch (error) {
    await mkdir(directory, { recursive: true });
  }
}

// Initialize storage directories
(async () => {
  await ensureDirectoryExists(STORAGE_DIR);
  await ensureDirectoryExists(PUBLIC_DIR);
})();

/**
 * Store a file in the Replit filesystem
 * @param fileData - The data to store (Buffer or string)
 * @param fileType - The MIME type of the file
 * @param fileName - Optional custom filename (if not provided, a random name will be generated)
 * @param isPublic - Whether the file should be stored in the public directory
 * @returns The path to the stored file
 */
export async function storeFile(
  fileData: Buffer | string, 
  fileType: string, 
  fileName?: string,
  isPublic: boolean = false
): Promise<string> {
  // Generate filename if not provided
  if (!fileName) {
    const hash = crypto.createHash('sha256');
    hash.update(typeof fileData === 'string' ? fileData : fileData.toString('binary'));
    hash.update(Date.now().toString());
    fileName = `${hash.digest('hex').substring(0, 16)}${getExtensionForMimeType(fileType)}`;
  }

  const directory = isPublic ? PUBLIC_DIR : STORAGE_DIR;
  await ensureDirectoryExists(directory);
  const filePath = path.join(directory, fileName);
  
  await writeFile(filePath, fileData);
  
  return isPublic 
    ? `/uploads/${fileName}` // Return a URL path for public files
    : fileName; // Return just the filename for private files
}

/**
 * Retrieve a file from storage
 * @param fileName - The name of the file to retrieve
 * @param isPublic - Whether the file is stored in the public directory
 * @returns The file data as a Buffer
 */
export async function getFile(fileName: string, isPublic: boolean = false): Promise<Buffer> {
  const directory = isPublic ? PUBLIC_DIR : STORAGE_DIR;
  const filePath = path.join(directory, fileName);
  return await readFile(filePath);
}

/**
 * Delete a file from storage
 * @param fileName - The name of the file to delete
 * @param isPublic - Whether the file is stored in the public directory
 */
export async function deleteFile(fileName: string, isPublic: boolean = false): Promise<void> {
  const directory = isPublic ? PUBLIC_DIR : STORAGE_DIR;
  const filePath = path.join(directory, fileName);
  await unlink(filePath);
}

/**
 * List all files in a storage directory
 * @param isPublic - Whether to list files in the public directory
 * @returns Array of filenames
 */
export async function listFiles(isPublic: boolean = false): Promise<string[]> {
  const directory = isPublic ? PUBLIC_DIR : STORAGE_DIR;
  await ensureDirectoryExists(directory);
  return await readdir(directory);
}

/**
 * Get the appropriate file extension for a MIME type
 * @param mimeType - The MIME type
 * @returns The file extension including the dot
 */
function getExtensionForMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg+xml': '.svg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/xml': '.xml',
    'application/zip': '.zip',
    'video/mp4': '.mp4',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
  };

  return mimeToExt[mimeType] || '';
}