import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Load environment variables
dotenv.config();

// Set test environment variables if not set
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || 'test-client-id';
process.env.PLAID_SANDBOX_SECRET = process.env.PLAID_SANDBOX_SECRET || 'test-sandbox-secret';

// Create reusable mock functions
const mockSupabaseAuth = {
  auth: {
    signUp: jest.fn().mockResolvedValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        session: null
      },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        session: { access_token: 'test-token' }
      },
      error: null
    }),
    getUser: jest.fn()
  }
};

const mockSupabaseDb = {
  insert: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ error: null })
  }),
  update: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ error: null })
  }),
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: { status: 'pending', plaid_link_token: 'test-token' },
        error: null
      })
    })
  })
};

// Mock Supabase client
const mockAuth = {
  signUp: jest.fn().mockResolvedValue({
    data: {
      user: { id: 'test-id', email: 'test@example.com' },
      session: null
    },
    error: null
  }),
  signInWithPassword: jest.fn().mockResolvedValue({
    data: {
      user: { id: 'test-id', email: 'test@example.com' },
      session: { access_token: 'test-token' }
    },
    error: null
  }),
  getUser: jest.fn()
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: mockAuth,
    from: jest.fn().mockReturnValue(mockSupabaseDb)
  }))
}));

// Mock Plaid client
jest.mock('plaid', () => ({
  Configuration: jest.fn(),
  PlaidApi: jest.fn(() => ({
    linkTokenCreate: jest.fn().mockResolvedValue({
      data: { link_token: 'test-link-token' }
    }),
    itemPublicTokenExchange: jest.fn().mockResolvedValue({
      data: { access_token: 'test-access-token' }
    }),
    identityVerificationGet: jest.fn().mockResolvedValue({
      data: { status: 'success' }
    }),
    authGet: jest.fn().mockResolvedValue({
      data: { accounts: [] }
    })
  })),
  PlaidEnvironments: {
    sandbox: 'https://sandbox.plaid.com'
  },
  Products: {
    Transactions: 'transactions',
    IdentityVerification: 'identity_verification'
  },
  CountryCode: {
    Us: 'US'
  }
}));
