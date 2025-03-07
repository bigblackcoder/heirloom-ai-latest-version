import 'express';

declare module 'express' {
  export interface Request {
    session: {
      userId?: number;
      [key: string]: any;
    } | null;
  }
}