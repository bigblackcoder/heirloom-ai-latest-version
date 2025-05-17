import { 
  users, type User, type InsertUser,
  identityCapsules, type IdentityCapsule, type InsertIdentityCapsule,
  verifiedData, type VerifiedData, type InsertVerifiedData,
  aiConnections, type AiConnection, type InsertAiConnection,
  activities, type Activity, type InsertActivity,
  faceRecords, type FaceRecord, type InsertFaceRecord,
  achievements, type Achievement, type InsertAchievement,
  biometricCredentials, type BiometricCredential, type InsertBiometricCredential
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

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
  
  // Biometric Credential operations
  getBiometricCredential(id: number): Promise<BiometricCredential | undefined>;
  getBiometricCredentialByCredentialId(credentialId: string): Promise<BiometricCredential | undefined>;
  getBiometricCredentialsByUserId(userId: number): Promise<BiometricCredential[]>;
  createBiometricCredential(credential: InsertBiometricCredential): Promise<BiometricCredential>;
  updateBiometricCredential(id: number, updates: Partial<BiometricCredential>): Promise<BiometricCredential | undefined>;
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

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
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
    // Ensure proper handling of JSON fields to avoid array issues
    const connectionData = {
      userId: connection.userId,
      aiServiceName: connection.aiServiceName,
      aiServiceId: connection.aiServiceId || null,
      // Handle array correctly by properly stringifying and parsing
      permissions: connection.permissions ? JSON.parse(JSON.stringify(connection.permissions)) : null
    };
    
    // Insert as a single record (not as array)
    const [newConnection] = await db.insert(aiConnections).values(connectionData).returning();
    return newConnection;
  }

  async updateAiConnection(id: number, updates: Partial<AiConnection>): Promise<AiConnection | undefined> {
    const [updatedConnection] = await db
      .update(aiConnections)
      .set({ ...updates, updatedAt: new Date() })
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

  // Biometric Credential operations
  async getBiometricCredential(id: number): Promise<BiometricCredential | undefined> {
    const [credential] = await db.select().from(biometricCredentials).where(eq(biometricCredentials.id, id));
    return credential;
  }

  async getBiometricCredentialByCredentialId(credentialId: string): Promise<BiometricCredential | undefined> {
    const [credential] = await db.select().from(biometricCredentials).where(eq(biometricCredentials.credentialId, credentialId));
    return credential;
  }

  async getBiometricCredentialsByUserId(userId: number): Promise<BiometricCredential[]> {
    return await db
      .select()
      .from(biometricCredentials)
      .where(and(
        eq(biometricCredentials.userId, userId),
        eq(biometricCredentials.isActive, true)
      ))
      .orderBy(desc(biometricCredentials.createdAt));
  }

  async createBiometricCredential(credential: InsertBiometricCredential): Promise<BiometricCredential> {
    // Ensure proper handling of JSON fields to avoid array issues
    const credentialData = {
      userId: credential.userId,
      credentialId: credential.credentialId,
      biometricType: credential.biometricType,
      deviceType: credential.deviceType,
      publicKey: credential.publicKey || null,
      // Convert JSON objects correctly
      attestation: credential.attestation ? JSON.parse(JSON.stringify(credential.attestation)) : null,
      // Handle array correctly
      transports: credential.transports ? JSON.parse(JSON.stringify(credential.transports)) : null,
      blockchainTxId: credential.blockchainTxId || null,
      isActive: credential.isActive !== undefined ? credential.isActive : true,
      metadata: credential.metadata ? JSON.parse(JSON.stringify(credential.metadata)) : null
    };
    
    // Insert as a single record (not as array)
    const [newCredential] = await db.insert(biometricCredentials).values(credentialData).returning();
    return newCredential;
  }

  async updateBiometricCredential(id: number, updates: Partial<BiometricCredential>): Promise<BiometricCredential | undefined> {
    const [updatedCredential] = await db
      .update(biometricCredentials)
      .set({ 
        ...updates, 
        lastUsedAt: updates.lastUsedAt || new Date() 
      })
      .where(eq(biometricCredentials.id, id))
      .returning();
    return updatedCredential;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();