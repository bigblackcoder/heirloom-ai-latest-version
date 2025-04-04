# Face Verification API Integration Guide

## Overview

The Heirloom Identity Platform provides powerful face verification capabilities through a dedicated API. This guide details how to integrate with the face verification system for authentication and identity verification purposes.

## Key Features

- Real-time face detection and verification
- Multiple verification modes (basic/advanced)
- Face matching against stored templates
- Demographic analysis (optional)
- Confidence scoring
- Support for saving verified faces to database

## API Endpoint

### Verify Face

- **URL**: `/api/verification/face`
- **Method**: `POST`
- **Authentication**: Required for production use

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | Yes | Base64-encoded image data with MIME type prefix (e.g., `data:image/jpeg;base64,...`) |
| `saveToDb` | boolean | No | Whether to save the verified face to the database for future matching (default: `false`) |
| `useBasicDetection` | boolean | No | Whether to use lightweight detection for resource-constrained environments (default: `false`) |
| `checkDbOnly` | boolean | No | Testing mode: only check database without processing image (default: `false`) |
| `userId` | number | No | User ID to check against (automatically set for authenticated requests) |

## Response Format

```json
{
  "success": true,
  "message": "Face verification successful",
  "verified": true,
  "confidence": 95.5,
  "matched": false,
  "face_id": "unique-face-id",
  "results": {
    "age": 30,
    "gender": "Woman",
    "dominant_race": "asian",
    "dominant_emotion": "neutral"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the verification process completed successfully |
| `message` | string | Human-readable status message |
| `verified` | boolean | Whether a valid face was verified |
| `confidence` | number | Confidence score (0-100) of the verification |
| `matched` | boolean | Whether the face matched an existing record in the database |
| `face_id` | string | Unique identifier for the detected face |
| `results` | object | Optional demographic analysis results |

## Error Responses

```json
{
  "success": false,
  "message": "Face verification failed",
  "confidence": 0,
  "details": "Could not detect a valid face"
}
```

Common error messages:

- "Image data is required"
- "Face verification failed"
- "Face verification failed - low confidence"
- "Error during face verification"

## Integration Examples

### Frontend Integration using JavaScript

```javascript
async function verifyFace(imageBase64, saveToDb = false) {
  try {
    const response = await fetch('/api/verification/face', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        saveToDb
      }),
      credentials: 'include' // Important for session authentication
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error during face verification:', error);
    return {
      success: false,
      message: 'Connection error during verification',
      confidence: 0
    };
  }
}
```

### Capture Image from Webcam

```javascript
async function captureImageFromWebcam() {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        
        // Capture frame after video starts playing
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Wait a moment for camera to adjust
          setTimeout(() => {
            // Draw video frame to canvas
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            // Stop video stream
            video.srcObject.getTracks().forEach(track => track.stop());
            
            // Convert to base64
            const imageBase64 = canvas.toDataURL('image/jpeg');
            resolve(imageBase64);
          }, 500);
        };
      })
      .catch(error => {
        reject(error);
      });
  });
}
```

### Complete Verification Flow

```javascript
async function performFaceVerification() {
  try {
    // Show loading state
    showLoadingIndicator();
    
    // Capture image from webcam
    const imageBase64 = await captureImageFromWebcam();
    
    // Send to verification API
    const result = await verifyFace(imageBase64, true); // Save to DB
    
    if (result.success) {
      // Verification successful
      showSuccessMessage(`Verified with ${result.confidence.toFixed(1)}% confidence`);
      
      if (result.matched) {
        showMatchIndicator(`Matched with existing face record: ${result.face_id}`);
      }
      
      // If demographic data is available
      if (result.results) {
        displayDemographicData(result.results);
      }
    } else {
      // Verification failed
      showErrorMessage(result.message || 'Verification failed');
    }
  } catch (error) {
    showErrorMessage('Error: ' + error.message);
  } finally {
    hideLoadingIndicator();
  }
}
```

## Best Practices

1. **Image Quality**:
   - Use front-facing camera in good lighting conditions
   - Ensure face is clearly visible and centered
   - Recommended minimum resolution: 640x480 pixels

2. **Performance Optimization**:
   - Use `useBasicDetection: true` for resource-constrained environments
   - Compress images before sending (consider quality vs. size trade-off)
   - Use appropriate JPEG quality (recommended: 0.8-0.9)

3. **User Experience**:
   - Provide clear guidance for users during face capture
   - Show real-time feedback on face alignment and quality
   - Implement progressive enhancement with fallbacks

4. **Security Considerations**:
   - Always use HTTPS for API requests
   - Implement proper authentication for production use
   - Consider rate limiting to prevent abuse
   - Store face templates securely, never raw images

5. **Error Handling**:
   - Implement graceful degradation for failed verifications
   - Provide clear feedback to users on verification failures
   - Offer alternative verification methods as fallback

## Advanced Configuration

The face verification API uses a confidence threshold to determine successful verifications:

- **Standard mode**: Minimum confidence of 85%
- **Basic detection mode**: Minimum confidence of 65%

You can adjust verification sensitivity by implementing custom thresholds on the client side.

## Server-Side Implementation Notes

The server implements a two-tier approach to face verification:

1. **Primary**: Deep learning-based verification using DeepFace
2. **Fallback**: Lightweight detection using OpenCV cascades

When DeepFace is unavailable or fails, the system automatically falls back to lightweight detection.

## Sample Server-Side Flow

1. Receive image from client
2. Attempt verification with DeepFace (if available)
3. If DeepFace fails, fallback to basic detection
4. Validate confidence threshold
5. If verification successful and `saveToDb` is true, store face template
6. Return verification result to client

## Client Reference Implementation

For a complete reference implementation, refer to the `client/src/hooks/use-face-verification.tsx` file in the Heirloom codebase.
