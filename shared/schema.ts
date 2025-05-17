/**
 * Database Schema
 * 
 * This file contains the Drizzle ORM schema definitions for the application.
 * These schemas are used for both the database and the TypeScript types.
 */

import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  boolean,
  json
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Users table
 * Stores user information and authentication data
 */
export const users = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  email: text('email').unique(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login')
});

/**
 * WebAuthn Credentials table
 * Stores credentials for WebAuthn authentication
 */
export const webauthnCredentials = pgTable('webauthn_credentials', {
  id: text('id').primaryKey().notNull(), // Credential ID from authenticator
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  publicKey: text('public_key').notNull(), // Base64URL encoded public key
  algorithm: integer('algorithm').notNull(), // Algorithm used (-7 for ES256, -257 for RS256, etc.)
  counter: integer('counter').notNull().default(0), // Signature counter for detecting cloned authenticators
  transports: json('transports').$type<string[]>(), // Optional transports used by the authenticator
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsed: timestamp('last_used')
});

/**
 * Faces table
 * Stores face data for facial verification
 */
export const faces = pgTable('faces', {
  id: text('id').primaryKey().notNull(), // UUID for the face
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  embedding: json('embedding'), // Facial embedding vector data
  imageHash: text('image_hash'), // Hash of the original image for duplication check
  metadata: json('metadata').$type<{
    age?: number;
    gender?: string;
    emotion?: string;
    hasGlasses?: boolean;
    hasMask?: boolean;
  }>(), // Metadata about the face
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastVerified: timestamp('last_verified')
});

/**
 * Verification History table
 * Stores history of verification attempts
 */
export const verificationHistory = pgTable('verification_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  credentialId: text('credential_id').references(() => webauthnCredentials.id),
  faceId: text('face_id').references(() => faces.id),
  success: boolean('success').notNull(),
  confidence: integer('confidence'), // Confidence score for face verification (0-100)
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  details: json('details')
});

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(webauthnCredentials),
  faces: many(faces),
  verificationHistory: many(verificationHistory)
}));

export const credentialsRelations = relations(webauthnCredentials, ({ one }) => ({
  user: one(users, { fields: [webauthnCredentials.userId], references: [users.id] })
}));

export const facesRelations = relations(faces, ({ one }) => ({
  user: one(users, { fields: [faces.userId], references: [users.id] })
}));

export const verificationHistoryRelations = relations(verificationHistory, ({ one }) => ({
  user: one(users, { fields: [verificationHistory.userId], references: [users.id] }),
  credential: one(webauthnCredentials, { fields: [verificationHistory.credentialId], references: [webauthnCredentials.id] }),
  face: one(faces, { fields: [verificationHistory.faceId], references: [faces.id] })
}));

// Create Zod schemas for insertion validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.username.min(3),
  email: (schema) => schema.email.email().optional()
}).omit({ id: true });

export const insertCredentialSchema = createInsertSchema(webauthnCredentials);

export const insertFaceSchema = createInsertSchema(faces).omit({ id: true });

export const insertVerificationHistorySchema = createInsertSchema(verificationHistory).omit({ id: true });

// Create type definitions based on the schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;
export type InsertWebAuthnCredential = z.infer<typeof insertCredentialSchema>;

export type Face = typeof faces.$inferSelect;
export type InsertFace = z.infer<typeof insertFaceSchema>;

export type VerificationHistory = typeof verificationHistory.$inferSelect;
export type InsertVerificationHistory = z.infer<typeof insertVerificationHistorySchema>;