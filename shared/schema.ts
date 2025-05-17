import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { boolean, date, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  email: text("email"),
  username: text("username").notNull(),
  displayName: text("display_name"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

// WebAuthn credentials table
export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  credentialId: text("credential_id").notNull().unique(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credential_device_type").notNull(),
  credentialBackedUp: boolean("credential_backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
  userVerified: boolean("user_verified").default(false),
});

// Face recognition data table
export const faces = pgTable("faces", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id")
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