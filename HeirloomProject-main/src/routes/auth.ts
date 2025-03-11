import express, { Response, Router } from 'express';
import { AuthService } from '../services/AuthService';
import { validateRequest } from '../middlewares/validation';
import { RequestHandler } from 'express-serve-static-core';

const router: Router = express.Router();
const authService: AuthService = new AuthService();

interface SignUpBody {
  email: string;
  password: string;
}

interface PlaidVerifyBody {
  userId: string;
  publicToken: string;
}

interface PlaidRefreshBody {
  userId: string;
}

type SignUpHandler = RequestHandler<{}, any, SignUpBody>;
type PlaidVerifyHandler = RequestHandler<{}, any, PlaidVerifyBody>;
type PlaidRefreshHandler = RequestHandler<{}, any, PlaidRefreshBody>;

// Sign up endpoint
router.post('/signup', validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body as SignUpBody;
    
    const result = await authService.signUp(email, password);
    
    res.json({
      user: result.user,
      linkToken: result.linkToken // Frontend needs this for Plaid Link
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Sign in endpoint
router.post('/signin', validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body as SignUpBody;
    
    const result = await authService.signIn(email, password);
    
    res.json({
      user: result.user,
      session: result.session,
      verificationStatus: result.verificationStatus,
      linkToken: result.linkToken
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Plaid verification callback
router.post('/verify/plaid', validateRequest, async (req, res) => {
  try {
    const { userId, publicToken } = req.body as PlaidVerifyBody;
    
    const status = await authService.handlePlaidSuccess(userId, publicToken);
    
    res.json({ status });
  } catch (error: any) {
    console.error('Plaid verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get new Plaid link token
router.post('/plaid/refresh-link', validateRequest, async (req, res) => {
  try {
    const { userId } = req.body as PlaidRefreshBody;
    
    const linkToken = await authService.refreshPlaidLinkToken(userId);
    
    res.json({ linkToken });
  } catch (error: any) {
    console.error('Link token refresh error:', error);
    res.status(400).json({ error: error.message });
  }
});

export { router as default };
