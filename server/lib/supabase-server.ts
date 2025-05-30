import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../lib/supabase'

// Server-side Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.SUPABASE_URL')
}

if (!supabaseServiceKey) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Create server-side Supabase client with service role
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Regular client for user operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing env.SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)