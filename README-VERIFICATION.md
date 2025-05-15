# FastAPI Face Verification Service for Heirloom

This document explains the enhanced face verification system that combines Express.js, React, and FastAPI to provide a more accurate and robust identity verification experience.

## Architecture Overview

The face verification system is built with a multi-tier architecture:

1. **Frontend Tier (React)**
   - AppleFaceScanner component for image-based verification
   - VideoVerification component for video-based verification
   - VerificationOptions page for selecting verification method

2. **API Tier (Express.js)**
   - Proxy endpoint for face verification requests
   - Session management and user status updates
   - Activity logging

3. **Processing Tier (FastAPI)**
   - Advanced face verification with DeepFace 
   - OpenCV-based fallback detection
   - Video analysis capabilities

## Verification Methods

The system supports two verification methods:

### Image-Based Verification
- Single image capture with real-time face alignment guidance
- Uses advanced facial feature detection
- Follows Apple's intuitive design pattern
- Minimum confidence threshold: 85%

### Video-Based Verification (New)
- Records a 3-second video for verification
- Extracts multiple frames for analysis
- Higher accuracy and better spoofing resistance
- Enhanced liveness detection

## Starting the Verification Service

The FastAPI verification service can be started manually:

```bash
# Start the FastAPI verification server
chmod +x verification_service/start.sh
./verification_service/start.sh
```

The service runs on port 8000 by default and is accessed via the Express.js API proxy.

## API Endpoints

### Image Verification
- **Endpoint:** `/api/verification/face`
- **Method:** POST
- **Payload:** 
  ```json
  {
    "image": "base64 encoded image data",
    "userId": "optional user ID",
    "saveToDb": true,
    "requestId": "optional debug ID",
    "useBasicDetection": false
  }
  ```

### Video Verification
- **Endpoint:** `/api/verification/video`
- **Method:** POST
- **Payload:** FormData with:
  - `videoFile`: Blob/File of the recorded video
  - `userId`: Optional user ID
  - `saveToDb`: Boolean to indicate if face should be saved
  - `requestId`: Optional debug session ID

## Verification Flow

1. User selects verification method (image or video)
2. Frontend captures face data (image or video)
3. Data is sent to the appropriate API endpoint
4. Express backend forwards request to FastAPI service
5. FastAPI processes the face/video data
6. Results are returned to frontend
7. User status is updated if verification successful

## Automatic Fallbacks

The system includes multiple fallback mechanisms:

1. If FastAPI service is unavailable, falls back to Express.js verification
2. If DeepFace cannot be loaded, falls back to basic OpenCV detection
3. If video processing fails, falls back to image processing

## Debug Information

Each verification request includes a unique debug session ID that can be used to track the verification through logs:

```
[DEBUG:face-verify-1683736528-123] Face verification attempt started. User ID: 42
```

This ID is included in all related logs and responses for easier troubleshooting.

## Testing the Service

You can test the verification service endpoints directly:

```bash
# Test image verification
curl -X POST http://localhost:3000/api/verification/face \
  -H "Content-Type: application/json" \
  -d '{"image":"base64encodedimage", "useBasicDetection":true}'

# Check service status
curl http://localhost:8000/api/verification/status
```