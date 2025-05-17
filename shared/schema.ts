import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  varchar,
  json,
  uuid,
  index,
  jsonb,
  primaryKey
} from "drizzle-orm/pg-core";

// Session storage for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, isVerified: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Identity Capsules (containers for verified data)
export const identityCapsules = pgTable("identity_capsules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertIdentityCapsuleSchema = createInsertSchema(identityCapsules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIdentityCapsule = z.infer<typeof insertIdentityCapsuleSchema>;
export type IdentityCapsule = typeof identityCapsules.$inferSelect;

// Verified Data (attributes stored in capsules)
export const verifiedData = pgTable("verified_data", {
  id: serial("id").primaryKey(),
  capsuleId: integer("capsule_id").references(() => identityCapsules.id).notNull(),
  dataType: text("data_type").notNull(),
  value: text("value").notNull(),
  verificationMethod: text("verification_method").notNull(),
  issuanceDate: timestamp("issuance_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertVerifiedDataSchema = createInsertSchema(verifiedData).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVerifiedData = z.infer<typeof insertVerifiedDataSchema>;
export type VerifiedData = typeof verifiedData.$inferSelect;

// AI Connections (permissions granted to AI services)
export const aiConnections = pgTable("ai_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  aiServiceName: text("ai_service_name").notNull(),
  aiServiceId: text("ai_service_id"),
  permissions: json("permissions").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertAiConnectionSchema = createInsertSchema(aiConnections).omit({ id: true, isActive: true, createdAt: true, updatedAt: true });
export type InsertAiConnection = z.infer<typeof insertAiConnectionSchema>;
export type AiConnection = typeof aiConnections.$inferSelect;

// Activity Log
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Face verification records
export const faceRecords = pgTable("face_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  faceEmbedding: json("face_embedding"),
  faceImagePath: text("face_image_path"),
  confidence: integer("confidence"),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
  metadata: json("metadata").$type<Record<string, any>>()
});

export const insertFaceRecordSchema = createInsertSchema(faceRecords).omit({ id: true, verifiedAt: true });
export type InsertFaceRecord = z.infer<typeof insertFaceRecordSchema>;
export type FaceRecord = typeof faceRecords.$inferSelect;

// Achievements/Badges
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  metadata: json("metadata").$type<Record<string, any>>(),
  shareId: text("share_id"),
  shareUrl: text("share_url")
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, awardedAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

// WebAuthn Credentials for device-based biometric authentication
export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  credentialId: text("credential_id").notNull().unique(),
  userId: text("user_id").notNull(),
  publicKey: text("public_key"),
  counter: integer("counter").default(0).notNull(),
  faceId: uuid("face_id").references(() => faceRecords.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
  metadata: json("metadata").$type<Record<string, any>>()
});

export const insertCredentialSchema = createInsertSchema(credentials).omit({ id: true, counter: true, createdAt: true, lastUsed: true });
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type Credential = typeof credentials.$inferSelect;