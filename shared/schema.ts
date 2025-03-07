import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  memberSince: timestamp("member_since").defaultNow().notNull(),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const identityCapsules = pgTable("identity_capsules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIdentityCapsuleSchema = createInsertSchema(identityCapsules).pick({
  userId: true,
  name: true,
  description: true,
});

export type InsertIdentityCapsule = z.infer<typeof insertIdentityCapsuleSchema>;
export type IdentityCapsule = typeof identityCapsules.$inferSelect;

export const verifiedData = pgTable("verified_data", {
  id: serial("id").primaryKey(),
  capsuleId: integer("capsule_id").notNull().references(() => identityCapsules.id),
  dataType: text("data_type").notNull(), // e.g., "employment", "income", "identity", etc.
  value: text("value").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVerifiedDataSchema = createInsertSchema(verifiedData).pick({
  capsuleId: true,
  dataType: true,
  value: true,
});

export type InsertVerifiedData = z.infer<typeof insertVerifiedDataSchema>;
export type VerifiedData = typeof verifiedData.$inferSelect;

export const aiConnections = pgTable("ai_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  aiServiceName: text("ai_service_name").notNull(), // e.g., "OpenAI", "Claude", etc.
  aiServiceId: text("ai_service_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sharedData: json("shared_data"), // JSON field for what data is shared
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastConnected: timestamp("last_connected"),
});

export const insertAiConnectionSchema = createInsertSchema(aiConnections).pick({
  userId: true,
  aiServiceName: true,
  aiServiceId: true,
  sharedData: true,
});

export type InsertAiConnection = z.infer<typeof insertAiConnectionSchema>;
export type AiConnection = typeof aiConnections.$inferSelect;

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // e.g., "connection", "verification", "data-added", etc.
  description: text("description").notNull(),
  metadata: json("metadata"), // Additional details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
  metadata: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
