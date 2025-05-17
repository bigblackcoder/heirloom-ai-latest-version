import { Express } from 'express';
import webauthnRoutes from './webauthn';

/**
 * Register all API routes with the Express application
 * @param app Express application instance
 */
export function registerRoutes(app: Express): void {
  // Register WebAuthn routes
  app.use('/api/webauthn', webauthnRoutes);
}