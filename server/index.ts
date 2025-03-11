import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import { setupVite, log } from './vite';
import { registerRoutes } from './routes';
import bcrypt from 'bcryptjs';
import { createServer } from 'http';
import { storage } from './storage';

// Create Express application
const app: Express = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'heirloom-identity-capsule-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
    },
  });
});

// Start server
async function main() {
  try {
    // Register API routes
    await registerRoutes(app);
    
    // Set up Vite dev server in development
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
    }

    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
main();