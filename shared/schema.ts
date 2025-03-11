import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  isVerified: boolean("is_verified").default(false),
  memberSince: text("member_since").notNull(),
  avatar: text("avatar")
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isVerified: true,
  memberSince: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Identity Capsules table
export const identityCapsules = pgTable("identity_capsules", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull()
});

export const insertIdentityCapsuleSchema = createInsertSchema(identityCapsules).pick({
  userId: true,
  name: true
});

export type InsertIdentityCapsule = z.infer<typeof insertIdentityCapsuleSchema>;
export type IdentityCapsule = typeof identityCapsules.$inferSelect;

// Verified Data table
export const verifiedData = pgTable("verified_data", {
  id: integer("id").primaryKey(),
  capsuleId: integer("capsule_id").notNull(),
  dataType: text("data_type").notNull(),
  value: text("value").notNull(),
  verifiedAt: text("verified_at").notNull()
});

export const insertVerifiedDataSchema = createInsertSchema(verifiedData).pick({
  capsuleId: true,
  dataType: true,
  value: true
});

export type InsertVerifiedData = z.infer<typeof insertVerifiedDataSchema>;
export type VerifiedData = typeof verifiedData.$inferSelect;

// AI Connections table
export const aiConnections = pgTable("ai_connections", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  aiServiceName: text("ai_service_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").notNull(),
  lastUsed: text("last_used")
});

export const insertAiConnectionSchema = createInsertSchema(aiConnections).pick({
  userId: true,
  aiServiceName: true,
  isActive: true
});

export type InsertAiConnection = z.infer<typeof insertAiConnectionSchema>;
export type AiConnection = typeof aiConnections.$inferSelect;

// Activities table
export const activities = pgTable("activities", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  createdAt: text("created_at").notNull()
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;