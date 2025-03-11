import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { UserVerification, AuthResponse, VerificationData } from '../types/auth';
import { PlaidSuccessResponse } from '../types/plaid';
import { FaceVerificationService } from './FaceVerificationService';
import dotenv from 'dotenv';

dotenv.config();

export class AuthService {
  private supabase: ReturnType<typeof createClient>;
  private plaid: PlaidApi;
  private faceVerification: FaceVerificationService;

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    // In test environment, use mock client
    if (process.env.NODE_ENV === 'test') {
      this.supabase = createClient('http://localhost:54321', 'test-key');
    } else if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Initialize Plaid client
    const plaidConfig = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
          'PLAID-SECRET': process.env.PLAID_SANDBOX_SECRET!,
        },
      },
    });

    this.plaid = new PlaidApi(plaidConfig);
    this.faceVerification = new FaceVerificationService();
  }

  async uploadFaceImage(userId: string, imageFile: File): Promise<string> {
    return this.faceVerification.uploadFaceImage(userId, imageFile);
  }

  async verifyFaceImage(userId: string, imageUrl: string): Promise<boolean> {
    return this.faceVerification.verifyFaceImage(userId, imageUrl);
  }

  async getVerificationStatus(userId: string): Promise<VerificationData> {
    const { data, error } = await this.supabase
      .from('verification_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('No verification data found');
    
    const verificationData: VerificationData = {
      status: data.plaid_status as string,
      plaid_link_token: data.plaid_link_token as string | null,
      face_verified: Boolean(data.face_verified),
      combined_status: data.combined_status as 'complete' | 'plaid_only' | 'face_only' | 'pending'
    };
    return verificationData;
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      // Create user in Supabase
      const { data: authData, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!authData?.user?.id) throw new Error('User creation failed');

      // Create Plaid identity verification
      const linkToken = await this.createPlaidLinkToken(authData.user.id);

      // Store link token in user metadata
      const { error: insertError } = await this.supabase
        .from('user_verification')
        .insert({
          user_id: authData.user.id,
          plaid_link_token: linkToken,
          status: 'pending'
        });

      if (insertError) throw insertError;

      return {
        user: authData.user as User,
        linkToken
      };
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!authData?.user?.id) throw new Error('Authentication failed');

      // Check verification status
      const { data: verificationData, error: verificationError } = await this.supabase
        .from('user_verification')
        .select('status, plaid_link_token, face_verified, combined_status')
        .eq('user_id', authData.user.id)
        .single();

      if (verificationError) throw verificationError;

      const verification: VerificationData = {
        status: typeof verificationData?.status === 'string' ? verificationData.status : 'none',
        plaid_link_token: typeof verificationData?.plaid_link_token === 'string' ? verificationData.plaid_link_token : null,
        face_verified: Boolean(verificationData?.face_verified),
        combined_status: ['complete', 'plaid_only', 'face_only', 'pending'].includes(verificationData?.combined_status as string) 
          ? (verificationData.combined_status as 'complete' | 'plaid_only' | 'face_only' | 'pending')
          : 'pending'
      };

      return {
        user: authData.user as User,
        session: authData.session as Session,
        verificationStatus: verification?.status || 'none',
        linkToken: verification?.plaid_link_token || undefined,
        faceVerified: verification?.face_verified || false,
        combinedStatus: verification?.combined_status || 'pending'
      };
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  }

  async refreshPlaidLinkToken(userId: string): Promise<string> {
    try {
      const linkToken = await this.createPlaidLinkToken(userId);
      
      // Update link token in database
      await this.supabase
        .from('user_verification')
        .update({ plaid_link_token: linkToken })
        .eq('user_id', userId);

      return linkToken;
    } catch (error) {
      console.error('Error refreshing link token:', error);
      throw error;
    }
  }

  private async createPlaidLinkToken(userId: string): Promise<string> {
    try {
      const response = await this.plaid.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Heirloom App',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en'
      });

      return response.data.link_token;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw error;
    }
  }

  async handlePlaidSuccess(userId: string, publicToken: string): Promise<PlaidSuccessResponse> {
    try {
      // Exchange public token
      const exchangeResponse = await this.plaid.itemPublicTokenExchange({
        public_token: publicToken
      });

      const accessToken = exchangeResponse.data.access_token;

      // Get identity verification status
      const authResponse = await this.plaid.authGet({
        access_token: accessToken
      });

      // If we get here without error, the Plaid authentication was successful
      const verificationStatus = 'success';

      // Get face verification status
      const { face_verified } = await this.faceVerification.getFaceVerificationStatus(userId);

      // Update verification status in database
      await this.supabase
        .from('user_verification')
        .update({
          status: verificationStatus,
          plaid_access_token: accessToken,
          verified_at: new Date(),
          combined_status: face_verified ? 'complete' : 'plaid_only'
        })
        .eq('user_id', userId);

      return { 
        status: verificationStatus,
        face_verified,
        combined_status: face_verified ? 'complete' : 'plaid_only'
      };
    } catch (error) {
      console.error('Plaid verification error:', error);
      throw error;
    }
  }
}
