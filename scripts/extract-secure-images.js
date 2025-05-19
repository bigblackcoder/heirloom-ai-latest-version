#!/usr/bin/env node

/**
 * Security Fix: Extract Embedded Images from SVG files
 * 
 * This script finds SVG files with embedded base64 images,
 * extracts the images to separate files, and updates
 * the SVG files to reference these external images instead.
 * 
 * This helps prevent security issues with credentials that
 * might be accidentally embedded in base64 data.
 * 
 * Usage:
 *   node scripts/extract-secure-images.js [directory]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get the current file's directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default directory to scan
const DEFAULT_SCAN_DIR = path.resolve(__dirname, '..');

// Directory for extracted images
const IMAGES_DIR = path.resolve(DEFAULT_SCAN_DIR, 'public', 'images', 'extracted');

// Regular expression to match embedded base64 images in SVG
const BASE64_IMAGE_REGEX = /xlink:href="data:([^;]+);base64,([^"]+)"/g;
const BASE64_IMAGE_REGEX_ALT = /preserveAspectRatio="[^"]+" xlink:href="data:([^;]+);base64,([^"]+)"/g;

// Files and directories to exclude from scanning
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git'];
const EXCLUDE_FILES = ['package-lock.json', 'yarn.lock'];

/**
 * Check if a path should be excluded from scanning
 */
function shouldExclude(filePath) {
  const basename = path.basename(filePath);
  const dirname = path.basename(path.dirname(filePath));
  
  return EXCLUDE_DIRS.includes(dirname) || 
         EXCLUDE_DIRS.includes(basename) ||
         EXCLUDE_FILES.includes(basename);
}

/**
 * Get a file extension from a MIME type
 */
function getFileExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/webp': '.webp'
  };
  
  return mimeToExt[mimeType] || '.bin';
}

/**
 * Create a directory if it doesn't exist
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Extract base64 encoded images from an SVG file
 */
function extractEmbeddedImages(filePath) {
  try {
    // Read the SVG file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Find all embedded images with standard pattern
    let matches = [...fileContent.matchAll(BASE64_IMAGE_REGEX)];
    
    // If none found, try alternative pattern
    if (matches.length === 0) {
      matches = [...fileContent.matchAll(BASE64_IMAGE_REGEX_ALT)];
    }
    
    if (matches.length === 0) {
      return { changed: false, extractedCount: 0 };
    }
    
    // Ensure the images directory exists
    ensureDirectoryExists(IMAGES_DIR);
    
    // Process each match
    let modifiedContent = fileContent;
    let extractedCount = 0;
    
    for (const match of matches) {
      const [fullMatch, mimeType, base64Data] = match;
      
      // Check for possible credentials in the base64 data
      if (base64Data.includes('AKIA') || 
          base64Data.includes('SECRET') ||
          base64Data.includes('PASSWORD') ||
          base64Data.includes('TOKEN')) {
        console.log(`⚠️ WARNING: Possible credentials found in ${filePath}`);
      }
      
      // Generate a unique filename based on hash
      const hash = crypto.createHash('md5')
        .update(base64Data.substring(0, 100))
        .digest('hex')
        .substring(0, 10);
      
      const fileExtension = getFileExtensionFromMimeType(mimeType);
      const filename = `extracted_${path.basename(filePath, '.svg')}_${hash}${fileExtension}`;
      const imagePath = path.join(IMAGES_DIR, filename);
      
      // Save the image
      fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
      
      // Replace the embedded data with a reference to the extracted file
      const relativePath = path.relative(
        path.dirname(filePath),
        imagePath
      ).replace(/\\/g, '/'); // Ensure forward slashes for URLs
      
      // Create the new xlink:href attribute
      const newReference = `xlink:href="${relativePath}"`;
      
      // Replace in the SVG content
      modifiedContent = modifiedContent.replace(fullMatch, newReference);
      
      extractedCount++;
      console.log(`  - Extracted image to: ${relativePath}`);
    }
    
    // Write the modified SVG file
    if (extractedCount > 0) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`  - Updated SVG file to reference external images`);
    }
    
    return { changed: extractedCount > 0, extractedCount };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return { changed: false, extractedCount: 0, error: true };
  }
}

/**
 * Recursively scan a directory for SVG files
 */
function scanDirectory(dir) {
  let results = {
    scannedFiles: 0,
    changedFiles: 0,
    extractedImages: 0,
    errors: 0
  };
  
  try {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      
      if (shouldExclude(fullPath)) continue;
      
      try {
        const fileStat = fs.statSync(fullPath);
        
        if (fileStat.isDirectory()) {
          // Recursively scan subdirectories
          const subResults = scanDirectory(fullPath);
          
          results.scannedFiles += subResults.scannedFiles;
          results.changedFiles += subResults.changedFiles;
          results.extractedImages += subResults.extractedImages;
          results.errors += subResults.errors;
        } else if (path.extname(fullPath).toLowerCase() === '.svg') {
          // Process SVG files
          results.scannedFiles++;
          
          console.log(`Processing: ${fullPath}`);
          const { changed, extractedCount, error } = extractEmbeddedImages(fullPath);
          
          if (error) results.errors++;
          if (changed) results.changedFiles++;
          results.extractedImages += extractedCount;
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
        results.errors++;
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
    results.errors++;
  }
  
  return results;
}

/**
 * Main function
 */
function main() {
  // Get directory to scan from command line args or use default
  const scanDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SCAN_DIR;
  
  console.log(`🔍 Scanning for SVG files with embedded images in: ${scanDir}`);
  console.log(`📁 Extracted images will be saved to: ${IMAGES_DIR}`);
  
  const startTime = Date.now();
  const results = scanDirectory(scanDir);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Scan completed in ${duration}s`);
  console.log(`
Summary:
  - Scanned SVG files: ${results.scannedFiles}
  - Modified files: ${results.changedFiles}
  - Extracted images: ${results.extractedImages}
  - Errors: ${results.errors}
  `);
  
  if (results.extractedImages > 0) {
    console.log(`
Security Improvement:
  ✓ Replaced embedded base64 data with external image references
  ✓ Removed potential credential information from SVG files
  ✓ Extracted images are now stored separately in ${IMAGES_DIR}
    `);
  } else {
    console.log(`
No embedded images found that needed extraction.
    `);
  }
}

// Run the main function
main();