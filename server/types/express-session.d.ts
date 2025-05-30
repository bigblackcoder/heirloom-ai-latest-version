import 'express';

declare module 'express' {
  export interface Request {
    session: {
      userId?: number;
      oauthState?: {
        state: string;
        nonce: string;
        serviceId: string;
        scopes: string[];
        timestamp: number;
      };
      [key: string]: any;
    } | null;
  }
}