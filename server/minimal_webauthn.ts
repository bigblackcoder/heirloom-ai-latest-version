import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { db } from "./db";
import apiRouter from "./routes/index";

const app = express();
const PORT = 5000;

// Configure middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), "public")));

// Session middleware
app.use(session({
  secret: "heirloom-identity-platform-secret",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Add API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    version: '1.0.0',
    message: 'WebAuthn test server running'
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`WebAuthn test server running on port ${PORT}`);
  console.log(`Access the test page at: http://localhost:${PORT}/webauthn-test`);
});