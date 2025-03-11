import { startServer } from './server/server';

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});