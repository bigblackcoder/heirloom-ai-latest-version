-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Email verifications table
CREATE TABLE email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- AI connections table
CREATE TABLE ai_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  ai_service_name TEXT NOT NULL,
  ai_service_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  permissions TEXT[],
  scopes TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Identity capsules table
CREATE TABLE identity_capsules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB,
  verification_level TEXT DEFAULT 'basic' NOT NULL,
  blockchain_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Face embeddings table for vector similarity search
CREATE TABLE face_embeddings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  face_id TEXT NOT NULL,
  embedding VECTOR(512), -- 512-dimensional vector for face embeddings
  confidence FLOAT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Verification logs table
CREATE TABLE verification_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  verification_method TEXT NOT NULL, -- 'face', 'device', 'hybrid'
  confidence FLOAT NOT NULL,
  success BOOLEAN NOT NULL,
  request_id TEXT,
  metadata JSONB,
  blockchain_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Sessions table for express-session
CREATE TABLE sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_ai_connections_user_id ON ai_connections(user_id);
CREATE INDEX idx_identity_capsules_user_id ON identity_capsules(user_id);
CREATE INDEX idx_face_embeddings_user_id ON face_embeddings(user_id);
CREATE INDEX idx_face_embeddings_face_id ON face_embeddings(face_id);
CREATE INDEX idx_verification_logs_user_id ON verification_logs(user_id);
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Vector similarity search index for face embeddings
CREATE INDEX ON face_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Primary key for sessions table
ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- AI connections policies
CREATE POLICY "Users can view own AI connections" ON ai_connections
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own AI connections" ON ai_connections
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Identity capsules policies
CREATE POLICY "Users can view own capsules" ON identity_capsules
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own capsules" ON identity_capsules
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Face embeddings policies
CREATE POLICY "Users can view own face data" ON face_embeddings
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own face data" ON face_embeddings
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Verification logs policies
CREATE POLICY "Users can view own verification logs" ON verification_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service can insert verification logs" ON verification_logs
  FOR INSERT WITH CHECK (true);

-- Function to match faces using vector similarity
CREATE OR REPLACE FUNCTION match_faces(
  query_embedding VECTOR(512),
  match_threshold FLOAT DEFAULT 0.8,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id INT,
  user_id INT,
  face_id TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    face_embeddings.id,
    face_embeddings.user_id,
    face_embeddings.face_id,
    1 - (face_embeddings.embedding <=> query_embedding) AS similarity
  FROM face_embeddings
  WHERE 1 - (face_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY face_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_connections_updated_at
  BEFORE UPDATE ON ai_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_identity_capsules_updated_at
  BEFORE UPDATE ON identity_capsules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();