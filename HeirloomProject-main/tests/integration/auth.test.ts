import request from 'supertest';
import { Express } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PlaidApi } from 'plaid';
import app from '../../src/index';
// Ensure app is properly typed
const server = app as Express;

// Mock implementations
jest.mock('@supabase/supabase-js');
jest.mock('plaid');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return link token', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('linkToken');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/signin', () => {
    it('should authenticate user and return session', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body).toHaveProperty('verificationStatus');
    });
  });

  describe('POST /auth/verify/plaid', () => {
    it('should handle Plaid verification callback', async () => {
      const response = await request(app)
        .post('/auth/verify/plaid')
        .send({
          userId: 'test-user-id',
          publicToken: 'test-public-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });
});
