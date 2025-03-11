-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user verification table
CREATE TABLE IF NOT EXISTS public.user_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plaid_link_token TEXT,
  plaid_access_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.user_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification status"
  ON public.user_verification
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert only own verification status"
  ON public.user_verification
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update only own verification status"
  ON public.user_verification
  FOR UPDATE
  USING (auth.uid() = user_id);
