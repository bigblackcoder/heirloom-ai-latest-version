import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import { createServer } from 'http';
import path from 'path';
import { setupRoutes } from './simpleroutes';
import { spawn } from 'child_process';

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

// Health check endpoint
app.get('/healthcheck', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Set up API routes
setupRoutes(app);

// For static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});

// Start Vite dev server separately in development
if (process.env.NODE_ENV !== 'production') {
  const viteProcess = spawn('npx', ['vite', '--port', '5173'], {
    stdio: 'inherit',
    shell: true
  });
  
  viteProcess.on('error', (err) => {
    console.error('Failed to start Vite dev server:', err);
  });

  process.on('exit', () => {
    viteProcess.kill();
  });
}