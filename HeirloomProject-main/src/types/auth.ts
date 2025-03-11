import { User, Session } from '@supabase/supabase-js';

export interface UserVerification {
  id: string;
  user_id: string;
  plaid_link_token?: string;
  plaid_access_token?: string;
  status: 'pending' | 'success' | 'failed';
  verified_at?: Date;
  face_image_url?: string;
  face_verified: boolean;
  face_verified_at?: Date;
  face_verification_attempts: number;
  created_at: Date;
  updated_at: Date;
}

export interface VerificationData {
  status: string;
  plaid_link_token: string | null;
  face_verified: boolean;
  combined_status: 'complete' | 'plaid_only' | 'face_only' | 'pending';
}

export interface AuthResponse {
  user: User | null;
  session?: Session | null;
  verificationStatus?: string;
  linkToken?: string;
  faceVerified?: boolean;
  combinedStatus?: 'complete' | 'plaid_only' | 'face_only' | 'pending';
}
