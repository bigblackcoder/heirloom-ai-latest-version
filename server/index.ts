import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fileUpload from "express-fileupload";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { sessionMiddleware } from "./session";
import { registerWebAuthnRoutes } from "./routes/index";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.static(path.join(process.cwd(), "public")));

// Add file upload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: false,
  abortOnLimit: true,
  responseOnLimit: "File size limit exceeded (10MB)"
}));

// Add session support
app.use(sessionMiddleware);

// Register WebAuthn routes
registerWebAuthnRoutes(app);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Add health check endpoint at /api/health instead of root
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Root endpoint for API - still keeps the health check accessible
  app.get('/api', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      name: 'Heirloom Identity Platform API'
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    log("Setting up production static file serving...");
    serveStatic(app);
    log("Production static file serving setup complete");
  }

  // Use port 3000 in production, 5000 in development
  const port = process.env.NODE_ENV === 'production' ? 3000 : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
  
  // Start the verification service on port 8000
  try {
    const { startVerificationService } = await import('./verification_proxy.js');
    await startVerificationService();
    log('Verification service started successfully');
  } catch (error) {
    log(`Failed to start verification service: ${error.message}`);
    
    // In production, retry after a short delay
    if (process.env.NODE_ENV === 'production') {
      log('Will retry starting verification service in 5 seconds...');
      setTimeout(async () => {
        try {
          const { startVerificationService } = await import('./verification_proxy.js');
          await startVerificationService();
          log('Verification service started successfully on retry');
        } catch (retryError) {
          log(`Failed to start verification service on retry: ${retryError.message}`);
        }
      }, 5000);
    }
  }
})();
