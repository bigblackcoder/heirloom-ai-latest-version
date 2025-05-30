import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl) {
  throw new Error('Missing env.SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.SUPABASE_ANON_KEY')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (auto-generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          username: string
          password: string
          email: string | null
          first_name: string | null
          last_name: string | null
          avatar: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          username: string
          password: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          username?: string
          password?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_connections: {
        Row: {
          id: number
          user_id: number
          ai_service_name: string
          ai_service_id: string | null
          access_token: string
          refresh_token: string | null
          permissions: string[] | null
          scopes: string[] | null
          expires_at: string | null
          last_used: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          ai_service_name: string
          ai_service_id?: string | null
          access_token: string
          refresh_token?: string | null
          permissions?: string[] | null
          scopes?: string[] | null
          expires_at?: string | null
          last_used?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          ai_service_name?: string
          ai_service_id?: string | null
          access_token?: string
          refresh_token?: string | null
          permissions?: string[] | null
          scopes?: string[] | null
          expires_at?: string | null
          last_used?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      identity_capsules: {
        Row: {
          id: number
          user_id: number
          name: string
          description: string | null
          data: any | null
          verification_level: string
          blockchain_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          name: string
          description?: string | null
          data?: any | null
          verification_level?: string
          blockchain_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          name?: string
          description?: string | null
          data?: any | null
          verification_level?: string
          blockchain_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      face_embeddings: {
        Row: {
          id: number
          user_id: number
          face_id: string
          embedding: number[]
          confidence: number
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          face_id: string
          embedding: number[]
          confidence: number
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          face_id?: string
          embedding?: number[]
          confidence?: number
          metadata?: any | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_faces: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          user_id: number
          face_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}