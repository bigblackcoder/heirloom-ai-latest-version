import { 
  users, type User, type InsertUser,
  identityCapsules, type IdentityCapsule, type InsertIdentityCapsule,
  verifiedData, type VerifiedData, type InsertVerifiedData,
  aiConnections, type AiConnection, type InsertAiConnection,
  activities, type Activity, type InsertActivity 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Identity Capsule methods
  getCapsule(id: number): Promise<IdentityCapsule | undefined>;
  getCapsulesByUserId(userId: number): Promise<IdentityCapsule[]>;
  createCapsule(capsule: InsertIdentityCapsule): Promise<IdentityCapsule>;
  updateCapsule(id: number, updates: Partial<IdentityCapsule>): Promise<IdentityCapsule | undefined>;
  
  // Verified Data methods
  getVerifiedData(id: number): Promise<VerifiedData | undefined>;
  getVerifiedDataByCapsuleId(capsuleId: number): Promise<VerifiedData[]>;
  createVerifiedData(data: InsertVerifiedData): Promise<VerifiedData>;
  
  // AI Connection methods
  getAiConnection(id: number): Promise<AiConnection | undefined>;
  getAiConnectionsByUserId(userId: number): Promise<AiConnection[]>;
  createAiConnection(connection: InsertAiConnection): Promise<AiConnection>;
  updateAiConnection(id: number, updates: Partial<AiConnection>): Promise<AiConnection | undefined>;
  
  // Activity methods
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private identityCapsules: Map<number, IdentityCapsule>;
  private verifiedData: Map<number, VerifiedData>;
  private aiConnections: Map<number, AiConnection>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private capsuleIdCounter: number;
  private dataIdCounter: number;
  private connectionIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.identityCapsules = new Map();
    this.verifiedData = new Map();
    this.aiConnections = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.capsuleIdCounter = 1;
    this.dataIdCounter = 1;
    this.connectionIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize with a demo user
    this.createUser({
      username: "leslie",
      password: "password123",
      firstName: "Leslie",
      lastName: "Alexander"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false, 
      memberSince: now,
      avatar: undefined
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Identity Capsule methods
  async getCapsule(id: number): Promise<IdentityCapsule | undefined> {
    return this.identityCapsules.get(id);
  }
  
  async getCapsulesByUserId(userId: number): Promise<IdentityCapsule[]> {
    return Array.from(this.identityCapsules.values()).filter(
      (capsule) => capsule.userId === userId
    );
  }
  
  async createCapsule(insertCapsule: InsertIdentityCapsule): Promise<IdentityCapsule> {
    const id = this.capsuleIdCounter++;
    const now = new Date();
    const capsule: IdentityCapsule = {
      ...insertCapsule,
      id,
      isActive: true,
      createdAt: now
    };
    this.identityCapsules.set(id, capsule);
    return capsule;
  }
  
  async updateCapsule(id: number, updates: Partial<IdentityCapsule>): Promise<IdentityCapsule | undefined> {
    const capsule = await this.getCapsule(id);
    if (!capsule) return undefined;
    
    const updatedCapsule = { ...capsule, ...updates };
    this.identityCapsules.set(id, updatedCapsule);
    return updatedCapsule;
  }

  // Verified Data methods
  async getVerifiedData(id: number): Promise<VerifiedData | undefined> {
    return this.verifiedData.get(id);
  }
  
  async getVerifiedDataByCapsuleId(capsuleId: number): Promise<VerifiedData[]> {
    return Array.from(this.verifiedData.values()).filter(
      (data) => data.capsuleId === capsuleId
    );
  }
  
  async createVerifiedData(insertData: InsertVerifiedData): Promise<VerifiedData> {
    const id = this.dataIdCounter++;
    const now = new Date();
    const data: VerifiedData = {
      ...insertData,
      id,
      isVerified: false,
      verifiedAt: undefined,
      createdAt: now
    };
    this.verifiedData.set(id, data);
    return data;
  }

  // AI Connection methods
  async getAiConnection(id: number): Promise<AiConnection | undefined> {
    return this.aiConnections.get(id);
  }
  
  async getAiConnectionsByUserId(userId: number): Promise<AiConnection[]> {
    return Array.from(this.aiConnections.values()).filter(
      (connection) => connection.userId === userId
    );
  }
  
  async createAiConnection(insertConnection: InsertAiConnection): Promise<AiConnection> {
    const id = this.connectionIdCounter++;
    const now = new Date();
    const connection: AiConnection = {
      ...insertConnection,
      id,
      isActive: true,
      createdAt: now,
      lastConnected: now
    };
    this.aiConnections.set(id, connection);
    return connection;
  }
  
  async updateAiConnection(id: number, updates: Partial<AiConnection>): Promise<AiConnection | undefined> {
    const connection = await this.getAiConnection(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...updates };
    this.aiConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        // Sort activities in descending order by createdAt
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
