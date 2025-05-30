import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import {
  sqliteTable,
  integer,
  text,
  blob,
  real,
  index
} from "drizzle-orm/sqlite-core";

// Session storage for authentication
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire)
  })
);

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  isVerified: integer("is_verified").default(0).notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, isVerified: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Identity Capsules (containers for verified data)
export const identityCapsules = sqliteTable("identity_capsules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000))
});

export const insertIdentityCapsuleSchema = createInsertSchema(identityCapsules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIdentityCapsule = z.infer<typeof insertIdentityCapsuleSchema>;
export type IdentityCapsule = typeof identityCapsules.$inferSelect;

// Verified Data (attributes stored in capsules)
export const verifiedData = sqliteTable("verified_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  capsuleId: integer("capsule_id").references(() => identityCapsules.id).notNull(),
  dataType: text("data_type").notNull(),
  value: text("value").notNull(),
  verificationMethod: text("verification_method").notNull(),
  issuanceDate: integer("issuance_date").notNull(),
  expirationDate: integer("expiration_date"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000))
});

export const insertVerifiedDataSchema = createInsertSchema(verifiedData).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVerifiedData = z.infer<typeof insertVerifiedDataSchema>;
export type VerifiedData = typeof verifiedData.$inferSelect;

// AI Connections (permissions granted to AI services)
export const aiConnections = sqliteTable("ai_connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  aiServiceName: text("ai_service_name").notNull(),
  aiServiceId: text("ai_service_id"),
  permissions: text("permissions"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  scopes: text("scopes"),
  expiresAt: integer("expires_at"),
  lastUsed: integer("last_used"),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000))
});

export const insertAiConnectionSchema = createInsertSchema(aiConnections).omit({ id: true, isActive: true, createdAt: true, updatedAt: true });
export type InsertAiConnection = z.infer<typeof insertAiConnectionSchema>;
export type AiConnection = typeof aiConnections.$inferSelect;

// Activity Log
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000))
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Face verification records
export const faceRecords = sqliteTable("face_records", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  faceEmbedding: text("face_embedding"),
  faceImagePath: text("face_image_path"),
  confidence: integer("confidence"),
  verifiedAt: integer("verified_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  metadata: text("metadata")
});

export const insertFaceRecordSchema = createInsertSchema(faceRecords).omit({ id: true, verifiedAt: true });
export type InsertFaceRecord = z.infer<typeof insertFaceRecordSchema>;
export type FaceRecord = typeof faceRecords.$inferSelect;

// Achievements/Badges
export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  awardedAt: integer("awarded_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  metadata: text("metadata"),
  shareId: text("share_id"),
  shareUrl: text("share_url")
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, awardedAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

// WebAuthn Credentials for device-based biometric authentication
export const credentials = sqliteTable("credentials", {
  id: text("id").primaryKey(), // Using the client-generated credential ID as primary key
  userId: integer("user_id").references(() => users.id).notNull(),
  publicKey: text("public_key"),
  counter: integer("counter").default(0).notNull(),
  faceId: text("face_id").references(() => faceRecords.id),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  lastUsed: integer("last_used").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  metadata: text("metadata")
});

export const insertCredentialSchema = createInsertSchema(credentials).omit({ counter: true, createdAt: true, lastUsed: true });
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type Credential = typeof credentials.$inferSelect;

// Email verification tokens
export const emailVerifications = sqliteTable("email_verifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  isVerified: integer("is_verified").default(0).notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
  verifiedAt: integer("verified_at")
});

export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({ id: true, isVerified: true, createdAt: true, verifiedAt: true });
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type EmailVerification = typeof emailVerifications.$inferSelect;