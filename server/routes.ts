import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Face verification endpoint
  app.post('/api/verification/face', async (req, res) => {
    try {
      const { image, saveToDb, useTestData } = req.body;
      const userId = req.session?.userId || req.body.userId;
      const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // Log request but not the image data (too large)
      console.log(`[${requestId}] Face verification request - userId: ${userId}, saveToDb: ${saveToDb}, useTestData: ${useTestData}`);

      // If this is a test request with no image, use fallback verification
      if (useTestData || !image) {
        try {
          // Import at usage to avoid issues with Python dependency
          const { detectFaceBasic } = await import('./deepface');

          // Use the JS-only implementation for testing
          const result = await detectFaceBasic(
            // Use sample image data if no image provided
            image || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBARXhpZgAA', 
            userId ? Number(userId) : undefined,
            saveToDb || false
          );

          console.log(`[${requestId}] Basic verification completed successfully`);
          return res.json(result);
        } catch (testError) {
          console.error(`[${requestId}] Basic verification error:`, testError);
          return res.status(500).json({
            success: false,
            message: 'Error in basic verification service',
            error_code: 'BASIC_VERIFICATION_ERROR',
            request_id: requestId,
            details: String(testError).substring(0, 200) // Limit error message size
          });
        }
      }

      // For real verification, use the verification proxy
      try {
        const { verifyFace } = await import('./verification_proxy');

        // Call verification service
        const result = await verifyFace({
          image,
          userId,
          saveToDb: saveToDb || false,
          requestId,
          checkDbOnly: false,
          useBasicDetection: false
        });

        console.log(`[${requestId}] Verification completed with success=${result.success}`);
        return res.json(result);
      } catch (proxyError) {
        console.error(`[${requestId}] Verification proxy error:`, proxyError);

        // Check if we got a structured error or a raw error
        if (proxyError.response && proxyError.response.data) {
          // API returned structured error data
          return res.status(proxyError.response.status || 500).json({
            success: false,
            message: 'Error from verification service',
            error_code: 'VERIFICATION_SERVICE_ERROR',
            request_id: requestId,
            details: proxyError.response.data
          });
        }

        // Fallback to generic error object
        return res.status(500).json({
          success: false,
          message: 'Verification service error',
          error_code: 'PROXY_ERROR',
          request_id: requestId,
          details: String(proxyError).substring(0, 200) // Limit error message size
        });
      }
    } catch (error) {
      const errorId = `err-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      console.error(`[${errorId}] Unhandled error in face verification endpoint:`, error);

      return res.status(500).json({
        success: false,
        message: 'Server error during verification',
        error_code: 'SERVER_ERROR',
        request_id: errorId,
        details: String(error).substring(0, 200) // Limit error message size
      });
    }
  });

  // Simple face verification for basic tests
  app.post('/api/verification/face/basic', async (req, res) => {
    const requestId = `basic-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      const { saveToDb, userId } = req.body;

      console.log(`[${requestId}] Basic face verification request - userId: ${userId}, saveToDb: ${saveToDb}`);

      // Import the deepface module only when needed
      const { detectFaceBasic } = await import('./deepface');

      // Use the JavaScript-only implementation
      const result = await detectFaceBasic(
        // Use blank test image - this is just for testing
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBARXhpZgAA',
        userId ? Number(userId) : undefined,
        saveToDb || false
      );

      // Add timestamp and request ID to results
      result.timestamp = new Date().toISOString();
      result.request_id = requestId;

      console.log(`[${requestId}] Basic verification completed successfully`);
      return res.json(result);
    } catch (error) {
      console.error(`[${requestId}] Error in basic face verification:`, error);

      // Check for different types of errors and handle accordingly
      if (error.code === 'MODULE_NOT_FOUND') {
        return res.status(500).json({
          success: false,
          message: 'Verification module not available',
          error_code: 'MODULE_ERROR',
          request_id: requestId,
          details: 'The verification module could not be loaded'
        });
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return res.status(503).json({
          success: false,
          message: 'Verification service unavailable',
          error_code: 'SERVICE_UNAVAILABLE',
          request_id: requestId,
          details: 'The verification service is currently unavailable'
        });
      }

      // Generic error response
      return res.status(500).json({
        success: false,
        message: 'Server error during basic verification',
        error_code: 'VERIFICATION_ERROR',
        request_id: requestId,
        details: String(error).substring(0, 200) // Limit error message size
      });
    }
  });

  // Create an HTTP server
  const httpServer = createServer(app);

  return httpServer;
}