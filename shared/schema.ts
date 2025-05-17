import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

// User table (matches existing schema in the database)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email"),
  username: text("username").notNull(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

// WebAuthn credentials table (matches what we created in the database)
export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  credentialId: text("credential_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  algorithm: text("algorithm").notNull(),
  counter: integer("counter").notNull().default(0),
  transports: text("transports"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
});

// Face recognition data table (would need to be created if used)
export const faces = pgTable("faces", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  faceData: text("face_data").notNull(), // Stored as a base64 string or vector embedding
  confidence: integer("confidence"),  // Confidence score from 0-100
  isVerified: boolean("is_verified").default(false),
  metadata: text("metadata"), // Additional info like device, location, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastVerified: timestamp("last_verified"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  webauthnCredentials: many(webauthnCredentials),
  faces: many(faces),
}));

export const webauthnCredentialsRelations = relations(webauthnCredentials, ({ one }) => ({
  user: one(users, {
    fields: [webauthnCredentials.userId],
    references: [users.id],
  }),
}));

export const facesRelations = relations(faces, ({ one }) => ({
  user: one(users, {
    fields: [faces.userId],
    references: [users.id],
  }),
}));

// Schemas for form validation and inserts
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true });
export const insertWebAuthnCredentialSchema = createInsertSchema(webauthnCredentials).omit({ id: true, createdAt: true, lastUsed: true });
export const insertFaceSchema = createInsertSchema(faces).omit({ id: true, createdAt: true, lastVerified: true });

// Types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;
export type NewWebAuthnCredential = z.infer<typeof insertWebAuthnCredentialSchema>;
export type Face = typeof faces.$inferSelect;
export type NewFace = z.infer<typeof insertFaceSchema>;