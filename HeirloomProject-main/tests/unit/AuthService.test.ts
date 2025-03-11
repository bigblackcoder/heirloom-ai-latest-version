import { AuthService } from '../../src/services/AuthService';
import { createClient } from '@supabase/supabase-js';
import { PlaidApi } from 'plaid';

// Import mocks from setup.ts
jest.mock('plaid');

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('signUp', () => {
    it('should create user and return link token', async () => {
      const result = await authService.signUp('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({ id: 'test-id', email: 'test@example.com' });
      expect(result).toHaveProperty('linkToken');
    });
  });

  describe('signIn', () => {
    it('should authenticate user and return session data', async () => {
      const result = await authService.signIn('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({ id: 'test-id', email: 'test@example.com' });
      expect(result).toHaveProperty('session');
      expect(result.session).toEqual({ access_token: 'test-token' });
      expect(result).toHaveProperty('verificationStatus');
      expect(result).toHaveProperty('linkToken');
    });
  });
});
