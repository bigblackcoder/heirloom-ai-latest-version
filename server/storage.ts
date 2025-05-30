import { 
  users, type User, type InsertUser,
  identityCapsules, type IdentityCapsule, type InsertIdentityCapsule,
  verifiedData, type VerifiedData, type InsertVerifiedData,
  aiConnections, type AiConnection, type InsertAiConnection,
  activities, type Activity, type InsertActivity,
  faceRecords, type FaceRecord, type InsertFaceRecord,
  achievements, type Achievement, type InsertAchievement,
  emailVerifications, type EmailVerification, type InsertEmailVerification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(userId: number, password: string): Promise<boolean>;

  // Email verification operations
  createEmailVerification(verification: InsertEmailVerification): Promise<EmailVerification>;
  getEmailVerification(token: string): Promise<EmailVerification | undefined>;
  markEmailAsVerified(token: string): Promise<boolean>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;

  // Identity Capsule operations
  getCapsule(id: number): Promise<IdentityCapsule | undefined>;
  getCapsulesByUserId(userId: number): Promise<IdentityCapsule[]>;
  createCapsule(capsule: InsertIdentityCapsule): Promise<IdentityCapsule>;

  // Verified Data operations
  getVerifiedData(id: number): Promise<VerifiedData | undefined>;
  getVerifiedDataByCapsuleId(capsuleId: number): Promise<VerifiedData[]>;
  createVerifiedData(data: InsertVerifiedData): Promise<VerifiedData>;

  // AI Connection operations
  getAiConnection(id: number): Promise<AiConnection | undefined>;
  getAiConnectionsByUserId(userId: number): Promise<AiConnection[]>;
  createAiConnection(connection: InsertAiConnection): Promise<AiConnection>;
  updateAiConnection(id: number, updates: Partial<AiConnection>): Promise<AiConnection | undefined>;

  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Face Record operations
  getFaceRecord(id: string): Promise<FaceRecord | undefined>;
  getFaceRecordsByUserId(userId: number): Promise<FaceRecord[]>;
  createFaceRecord(record: InsertFaceRecord): Promise<FaceRecord>;

  // Achievement operations
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAchievementsByUserId(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await this.hashPassword(user.password);
    const now = Math.floor(Date.now() / 1000);
    
    // Only include non-null/non-undefined fields
    const userData: any = {
      username: user.username,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };
    
    // Only add optional fields if they exist
    if (user.email) userData.email = user.email;
    if (user.firstName) userData.firstName = user.firstName;
    if (user.lastName) userData.lastName = user.lastName;
    if (user.avatar) userData.avatar = user.avatar;
    
    console.log('Creating user with data:', JSON.stringify(userData, null, 2));
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    return await bcrypt.compare(password, user.password);
  }

  // Email verification operations
  async createEmailVerification(verification: InsertEmailVerification): Promise<EmailVerification> {
    const now = Math.floor(Date.now() / 1000);
    const [newVerification] = await db.insert(emailVerifications).values({
      ...verification,
      createdAt: now
    }).returning();
    return newVerification;
  }

  async getEmailVerification(token: string): Promise<EmailVerification | undefined> {
    const [verification] = await db.select().from(emailVerifications).where(eq(emailVerifications.token, token));
    return verification;
  }

  async markEmailAsVerified(token: string): Promise<boolean> {
    try {
      const verification = await this.getEmailVerification(token);
      if (!verification || verification.isVerified || verification.expiresAt < Math.floor(Date.now() / 1000)) {
        return false;
      }

      // Mark verification as complete
      await db
        .update(emailVerifications)
        .set({ 
          isVerified: true, 
          verifiedAt: Math.floor(Date.now() / 1000) 
        })
        .where(eq(emailVerifications.token, token));

      // Update user's email verification status
      await db
        .update(users)
        .set({ 
          isVerified: true,
          email: verification.email 
        })
        .where(eq(users.id, verification.userId));

      return true;
    } catch (error) {
      console.error('Error marking email as verified:', error);
      return false;
    }
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const verification = await this.getEmailVerification(token);
    if (!verification) return undefined;
    
    return await this.getUser(verification.userId);
  }

  // Identity Capsule operations
  async getCapsule(id: number): Promise<IdentityCapsule | undefined> {
    const [capsule] = await db.select().from(identityCapsules).where(eq(identityCapsules.id, id));
    return capsule;
  }

  async getCapsulesByUserId(userId: number): Promise<IdentityCapsule[]> {
    return await db.select().from(identityCapsules).where(eq(identityCapsules.userId, userId));
  }

  async createCapsule(capsule: InsertIdentityCapsule): Promise<IdentityCapsule> {
    const [newCapsule] = await db.insert(identityCapsules).values(capsule).returning();
    return newCapsule;
  }

  // Verified Data operations
  async getVerifiedData(id: number): Promise<VerifiedData | undefined> {
    const [data] = await db.select().from(verifiedData).where(eq(verifiedData.id, id));
    return data;
  }

  async getVerifiedDataByCapsuleId(capsuleId: number): Promise<VerifiedData[]> {
    return await db.select().from(verifiedData).where(eq(verifiedData.capsuleId, capsuleId));
  }

  async createVerifiedData(data: InsertVerifiedData): Promise<VerifiedData> {
    const [newData] = await db.insert(verifiedData).values(data).returning();
    return newData;
  }

  // AI Connection operations
  async getAiConnection(id: number): Promise<AiConnection | undefined> {
    const [connection] = await db.select().from(aiConnections).where(eq(aiConnections.id, id));
    return connection;
  }

  async getAiConnectionsByUserId(userId: number): Promise<AiConnection[]> {
    return await db.select().from(aiConnections).where(eq(aiConnections.userId, userId));
  }

  async createAiConnection(connection: InsertAiConnection): Promise<AiConnection> {
    const [newConnection] = await db.insert(aiConnections).values(connection).returning();
    return newConnection;
  }

  async updateAiConnection(id: number, updates: Partial<AiConnection>): Promise<AiConnection | undefined> {
    const [updatedConnection] = await db
      .update(aiConnections)
      .set({ ...updates, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(aiConnections.id, id))
      .returning();
    return updatedConnection;
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Face Record operations
  async getFaceRecord(id: string): Promise<FaceRecord | undefined> {
    const [record] = await db.select().from(faceRecords).where(eq(faceRecords.id, id));
    return record;
  }

  async getFaceRecordsByUserId(userId: number): Promise<FaceRecord[]> {
    return await db.select().from(faceRecords).where(eq(faceRecords.userId, userId));
  }

  async createFaceRecord(record: InsertFaceRecord): Promise<FaceRecord> {
    const [newRecord] = await db.insert(faceRecords).values(record).returning();
    return newRecord;
  }

  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.awardedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();