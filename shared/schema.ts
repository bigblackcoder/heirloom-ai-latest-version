import { pgTable, serial, text, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  password: text('password'),
  fullName: text('full_name'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login'),
  isVerified: boolean('is_verified').default(false),
  profileData: json('profile_data')
});

// Face data table
export const faces = pgTable('faces', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  faceData: text('face_data').notNull(),
  confidence: integer('confidence'),
  isVerified: boolean('is_verified'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  lastVerified: timestamp('last_verified')
});

// WebAuthn credentials table
export const webauthnCredentials = pgTable('webauthn_credentials', {
  id: text('id').primaryKey(), // Credential ID from WebAuthn
  userId: integer('user_id').notNull(),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull().default(0),
  transports: text('transports'),
  deviceInfo: text('device_info'),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsed: timestamp('last_used')
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true });
export const insertFaceSchema = createInsertSchema(faces).omit({ id: true, createdAt: true, lastVerified: true });
export const insertWebAuthnCredentialSchema = createInsertSchema(webauthnCredentials).omit({ createdAt: true, lastUsed: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Face = typeof faces.$inferSelect;
export type InsertFace = z.infer<typeof insertFaceSchema>;

export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;
export type InsertWebAuthnCredential = z.infer<typeof insertWebAuthnCredentialSchema>;