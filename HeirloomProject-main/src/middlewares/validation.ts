import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';

interface ValidationError {
  message: string;
  field?: string;
}

interface AuthRequest extends Request {
  body: {
    email?: string;
    password?: string;
    userId?: string;
    publicToken?: string;
  };
}

import { ParamsDictionary } from 'express-serve-static-core';

export const validateRequest: RequestHandler<
  ParamsDictionary,
  any,
  AuthRequest['body']
> = (req, res, next) => {
  const errors: ValidationError[] = [];

  // Validate auth endpoints
  if (req.path.includes('/signup') || req.path.includes('/signin')) {
    const { email, password } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
  }

  // Validate Plaid verification endpoint
  if (req.path.includes('/verify/plaid')) {
    const { userId, publicToken } = req.body;
    
    if (!userId) {
      errors.push({ field: 'userId', message: 'User ID is required' });
    }
    
    if (!publicToken) {
      errors.push({ field: 'publicToken', message: 'Public token is required' });
    }
  }

  // Validate Plaid link refresh endpoint
  if (req.path.includes('/plaid/refresh-link')) {
    const { userId } = req.body;
    
    if (!userId) {
      errors.push({ field: 'userId', message: 'User ID is required' });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
