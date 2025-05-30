import { supabaseAdmin } from './supabase-server'
import type { User } from '../../shared/schema'

export class SupabaseStorage {
  
  // User management
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        username: userData.username,
        email: userData.email,
        password: userData.password, // This should be hashed before storing
        is_verified: false
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return data
  }

  async getUserByUsername(username: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to get user: ${error.message}`)
    }

    return data
  }

  async getUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`)
    }

    return data
  }

  async getUser(id: number) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`)
    }

    return data
  }

  async updateUser(id: number, updates: Partial<User>) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return data
  }

  // Face embedding management
  async saveFaceEmbedding(userId: number, faceId: string, embedding: number[], confidence: number, metadata?: any) {
    const { data, error } = await supabaseAdmin
      .from('face_embeddings')
      .insert([{
        user_id: userId,
        face_id: faceId,
        embedding,
        confidence,
        metadata
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save face embedding: ${error.message}`)
    }

    return data
  }

  async findSimilarFaces(embedding: number[], threshold: number = 0.8, limit: number = 5) {
    const { data, error } = await supabaseAdmin
      .rpc('match_faces', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit
      })

    if (error) {
      throw new Error(`Failed to find similar faces: ${error.message}`)
    }

    return data
  }

  async getFaceEmbeddingsByUserId(userId: number) {
    const { data, error } = await supabaseAdmin
      .from('face_embeddings')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to get face embeddings: ${error.message}`)
    }

    return data
  }

  // AI Connections management
  async createAiConnection(connectionData: {
    userId: number;
    aiServiceName: string;
    accessToken: string;
    refreshToken?: string;
    scopes: string[];
    expiresAt?: Date;
  }) {
    const { data, error } = await supabaseAdmin
      .from('ai_connections')
      .insert([{
        user_id: connectionData.userId,
        ai_service_name: connectionData.aiServiceName,
        access_token: connectionData.accessToken,
        refresh_token: connectionData.refreshToken,
        scopes: connectionData.scopes,
        expires_at: connectionData.expiresAt?.toISOString(),
        status: 'active'
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create AI connection: ${error.message}`)
    }

    return data
  }

  async getAiConnectionsByUserId(userId: number) {
    const { data, error } = await supabaseAdmin
      .from('ai_connections')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to get AI connections: ${error.message}`)
    }

    return data
  }

  // Identity Capsules management
  async createIdentityCapsule(capsuleData: {
    userId: number;
    name: string;
    description?: string;
    data?: any;
    verificationLevel?: string;
    blockchainHash?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('identity_capsules')
      .insert([{
        user_id: capsuleData.userId,
        name: capsuleData.name,
        description: capsuleData.description,
        data: capsuleData.data,
        verification_level: capsuleData.verificationLevel || 'basic',
        blockchain_hash: capsuleData.blockchainHash
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create identity capsule: ${error.message}`)
    }

    return data
  }

  async getCapsulesByUserId(userId: number) {
    const { data, error } = await supabaseAdmin
      .from('identity_capsules')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to get identity capsules: ${error.message}`)
    }

    return data
  }

  // File storage operations
  async uploadFaceImage(userId: number, faceId: string, imageData: Buffer): Promise<string> {
    const fileName = `faces/${userId}/${faceId}.jpg`
    
    const { data, error } = await supabaseAdmin.storage
      .from('face-images')
      .upload(fileName, imageData, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      throw new Error(`Failed to upload face image: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('face-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  async deleteFaceImage(userId: number, faceId: string): Promise<void> {
    const fileName = `faces/${userId}/${faceId}.jpg`
    
    const { error } = await supabaseAdmin.storage
      .from('face-images')
      .remove([fileName])

    if (error) {
      throw new Error(`Failed to delete face image: ${error.message}`)
    }
  }

  // Password verification (you'll need to implement proper hashing)
  async verifyPassword(userId: number, password: string): Promise<boolean> {
    // This is a placeholder - you should implement proper bcrypt comparison
    const user = await this.getUser(userId)
    if (!user) return false
    
    // For now, direct comparison (UNSAFE - implement bcrypt)
    return user.password === password
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorage()