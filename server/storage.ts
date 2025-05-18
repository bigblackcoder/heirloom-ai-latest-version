import { users, type User, type InsertUser, faces, type Face, type InsertFace, webauthnCredentials, type WebAuthnCredential, type InsertWebAuthnCredential } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Face operations
  getFace(id: number): Promise<Face | undefined>;
  getFacesByUserId(userId: number): Promise<Face[]>;
  createFace(face: InsertFace): Promise<Face>;
  
  // WebAuthn credential operations
  getWebAuthnCredential(id: string): Promise<WebAuthnCredential | undefined>;
  getWebAuthnCredentialsByUserId(userId: number): Promise<WebAuthnCredential[]>;
  createWebAuthnCredential(credential: InsertWebAuthnCredential): Promise<WebAuthnCredential>;
  updateWebAuthnCredential(id: string, updates: Partial<WebAuthnCredential>): Promise<WebAuthnCredential | undefined>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Face operations
  async getFace(id: number): Promise<Face | undefined> {
    const [face] = await db.select().from(faces).where(eq(faces.id, id));
    return face;
  }
  
  async getFacesByUserId(userId: number): Promise<Face[]> {
    return await db.select().from(faces).where(eq(faces.userId, userId));
  }
  
  async createFace(face: InsertFace): Promise<Face> {
    const [newFace] = await db.insert(faces).values(face).returning();
    return newFace;
  }
  
  // WebAuthn credential operations
  async getWebAuthnCredential(id: string): Promise<WebAuthnCredential | undefined> {
    const [credential] = await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.id, id));
    return credential;
  }
  
  async getWebAuthnCredentialsByUserId(userId: number): Promise<WebAuthnCredential[]> {
    return await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.userId, userId));
  }
  
  async createWebAuthnCredential(credential: InsertWebAuthnCredential): Promise<WebAuthnCredential> {
    const [newCredential] = await db.insert(webauthnCredentials).values(credential).returning();
    return newCredential;
  }
  
  async updateWebAuthnCredential(id: string, updates: Partial<WebAuthnCredential>): Promise<WebAuthnCredential | undefined> {
    const [updatedCredential] = await db
      .update(webauthnCredentials)
      .set(updates)
      .where(eq(webauthnCredentials.id, id))
      .returning();
    return updatedCredential;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();