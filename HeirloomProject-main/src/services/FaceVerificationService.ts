import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { UserVerification } from '../types/auth';

export class FaceVerificationService {
  private supabase;
  private identityCapsuleUrl: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    // In test environment, use mock client
    if (process.env.NODE_ENV === 'test') {
      this.supabase = createClient('http://localhost:54321', 'test-key');
    } else if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    this.identityCapsuleUrl = process.env.IDENTITY_CAPSULE_URL || 'http://localhost:8000/api/v1';
  }

  async uploadFaceImage(userId: string, imageFile: File): Promise<string> {
    try {
      const filename = `${userId}/face-verification/${Date.now()}.jpg`;
      const { data, error } = await this.supabase.storage
        .from('face-verification')
        .upload(filename, imageFile);

      if (error) throw error;

      const { data: urlData } = this.supabase.storage
        .from('face-verification')
        .getPublicUrl(filename);

      const imageUrl = urlData.publicUrl;

      // Update user_verification table
      await this.supabase
        .from('user_verification')
        .update({
          face_image_url: imageUrl,
          face_verification_attempts: await this.supabase
            .rpc('increment_verification_attempts', { user_id: userId })
            .single()
            .then(({ data, error }) => {
              if (error) throw error;
              return data as number;
            })
        })
        .eq('user_id', userId);

      return imageUrl;
    } catch (error) {
      console.error('Error uploading face image:', error);
      throw error;
    }
  }

  async verifyFaceImage(userId: string, imageUrl: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.identityCapsuleUrl}/users/verify-identity`,
        { imageUrl },
        {
          headers: {
            'Authorization': `Bearer ${process.env.IDENTITY_CAPSULE_API_KEY}`
          }
        }
      );

      const { verified, confidence } = response.data;

      // Update verification status
      await this.supabase
        .from('user_verification')
        .update({
          face_verified: verified,
          face_verified_at: verified ? new Date().toISOString() : null
        })
        .eq('user_id', userId);

      return verified;
    } catch (error) {
      console.error('Error verifying face image:', error);
      throw error;
    }
  }

  async getFaceVerificationStatus(userId: string): Promise<Partial<UserVerification>> {
    try {
      const { data, error } = await this.supabase
        .from('user_verification')
        .select('face_verified, face_verified_at, face_verification_attempts')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting face verification status:', error);
      throw error;
    }
  }
}
