import { storage as sqliteStorage } from './storage'
import { supabaseStorage } from './lib/supabase-storage'

/**
 * Hybrid storage system that uses SQLite for development and Supabase for production
 */
class HybridStorage {
  private useSupabase: boolean

  constructor() {
    // Use Supabase in production if environment variables are set
    this.useSupabase = !!(
      process.env.NODE_ENV === 'production' &&
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log(`Storage mode: ${this.useSupabase ? 'Supabase' : 'SQLite'}`)
  }

  // User management methods
  async createUser(userData: { username: string; email: string; password: string }) {
    if (this.useSupabase) {
      return await supabaseStorage.createUser(userData)
    }
    return await sqliteStorage.createUser(userData)
  }

  async getUserByUsername(username: string) {
    if (this.useSupabase) {
      return await supabaseStorage.getUserByUsername(username)
    }
    return await sqliteStorage.getUserByUsername(username)
  }

  async getUserByEmail(email: string) {
    if (this.useSupabase) {
      return await supabaseStorage.getUserByEmail(email)
    }
    return await sqliteStorage.getUserByEmail(email)
  }

  async getUser(id: number) {
    if (this.useSupabase) {
      return await supabaseStorage.getUser(id)
    }
    return await sqliteStorage.getUser(id)
  }

  async updateUser(id: number, updates: any) {
    if (this.useSupabase) {
      return await supabaseStorage.updateUser(id, updates)
    }
    return await sqliteStorage.updateUser(id, updates)
  }

  async verifyPassword(userId: number, password: string) {
    if (this.useSupabase) {
      return await supabaseStorage.verifyPassword(userId, password)
    }
    return await sqliteStorage.verifyPassword(userId, password)
  }

  // Face embedding methods (enhanced for Supabase)
  async saveFaceEmbedding(userId: number, faceId: string, embedding: number[], confidence: number, metadata?: any) {
    if (this.useSupabase) {
      return await supabaseStorage.saveFaceEmbedding(userId, faceId, embedding, confidence, metadata)
    }
    // For SQLite, we'll store in a simple format for now
    return { id: Date.now(), user_id: userId, face_id: faceId, confidence }
  }

  async findSimilarFaces(embedding: number[], threshold: number = 0.8, limit: number = 5) {
    if (this.useSupabase) {
      return await supabaseStorage.findSimilarFaces(embedding, threshold, limit)
    }
    // For SQLite, return empty array for now (no vector search)
    return []
  }

  async getFaceEmbeddingsByUserId(userId: number) {
    if (this.useSupabase) {
      return await supabaseStorage.getFaceEmbeddingsByUserId(userId)
    }
    // For SQLite, return empty array for now
    return []
  }

  // AI Connections methods
  async createAiConnection(connectionData: {
    userId: number;
    aiServiceName: string;
    accessToken: string;
    refreshToken?: string;
    scopes: string[];
    expiresAt?: Date;
  }) {
    if (this.useSupabase) {
      return await supabaseStorage.createAiConnection(connectionData)
    }
    return await sqliteStorage.createAiConnection(connectionData)
  }

  async getAiConnectionsByUserId(userId: number) {
    if (this.useSupabase) {
      return await supabaseStorage.getAiConnectionsByUserId(userId)
    }
    return await sqliteStorage.getAiConnectionsByUserId(userId)
  }

  // Identity Capsules methods
  async createIdentityCapsule(capsuleData: {
    userId: number;
    name: string;
    description?: string;
    data?: any;
    verificationLevel?: string;
    blockchainHash?: string;
  }) {
    if (this.useSupabase) {
      return await supabaseStorage.createIdentityCapsule(capsuleData)
    }
    return await sqliteStorage.createIdentityCapsule(capsuleData)
  }

  async getCapsulesByUserId(userId: number) {
    if (this.useSupabase) {
      return await supabaseStorage.getCapsulesByUserId(userId)
    }
    return await sqliteStorage.getCapsulesByUserId(userId)
  }

  // File upload methods (Supabase only)
  async uploadFaceImage(userId: number, faceId: string, imageData: Buffer): Promise<string> {
    if (this.useSupabase) {
      return await supabaseStorage.uploadFaceImage(userId, faceId, imageData)
    }
    // For SQLite, save to local file system
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const faceDir = path.join(process.cwd(), 'face_db', userId.toString())
    await fs.mkdir(faceDir, { recursive: true })
    
    const filePath = path.join(faceDir, `${faceId}.jpg`)
    await fs.writeFile(filePath, imageData)
    
    return filePath
  }

  async deleteFaceImage(userId: number, faceId: string): Promise<void> {
    if (this.useSupabase) {
      return await supabaseStorage.deleteFaceImage(userId, faceId)
    }
    // For SQLite, delete from local file system
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const filePath = path.join(process.cwd(), 'face_db', userId.toString(), `${faceId}.jpg`)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      // File might not exist, which is okay
    }
  }

  // Email verification methods (existing SQLite methods)
  async createEmailVerification(data: any) {
    return await sqliteStorage.createEmailVerification(data)
  }

  async markEmailAsVerified(token: string) {
    return await sqliteStorage.markEmailAsVerified(token)
  }

  async getUserByVerificationToken(token: string) {
    return await sqliteStorage.getUserByVerificationToken(token)
  }

  // Log verification events
  async logVerification(userId: number, method: string, confidence: number, success: boolean, metadata?: any) {
    if (this.useSupabase) {
      const { data, error } = await supabaseStorage.supabaseAdmin
        .from('verification_logs')
        .insert([{
          user_id: userId,
          verification_method: method,
          confidence,
          success,
          metadata,
          request_id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }])
        .select()
        .single()

      if (error) {
        console.error('Failed to log verification:', error.message)
      }
      
      return data
    }
    // For SQLite, just log to console for now
    console.log(`Verification log: ${method} for user ${userId} - success: ${success}, confidence: ${confidence}`)
    return null
  }
}

export const hybridStorage = new HybridStorage()