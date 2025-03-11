import { 
  User, 
  InsertUser, 
  IdentityCapsule, 
  InsertIdentityCapsule,
  VerifiedData,
  InsertVerifiedData,
  AiConnection,
  InsertAiConnection,
  Activity,
  InsertActivity
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
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser,
      id: this.userIdCounter++,
      isVerified: false,
      memberSince: new Date().toISOString(),
      avatar: null
    };
    
    this.users.set(user.id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getCapsule(id: number): Promise<IdentityCapsule | undefined> {
    return this.identityCapsules.get(id);
  }
  
  async getCapsulesByUserId(userId: number): Promise<IdentityCapsule[]> {
    const capsules: IdentityCapsule[] = [];
    for (const capsule of this.identityCapsules.values()) {
      if (capsule.userId === userId) {
        capsules.push(capsule);
      }
    }
    return capsules;
  }
  
  async createCapsule(insertCapsule: InsertIdentityCapsule): Promise<IdentityCapsule> {
    const capsule: IdentityCapsule = {
      ...insertCapsule,
      id: this.capsuleIdCounter++,
      createdAt: new Date().toISOString()
    };
    
    this.identityCapsules.set(capsule.id, capsule);
    return capsule;
  }
  
  async updateCapsule(id: number, updates: Partial<IdentityCapsule>): Promise<IdentityCapsule | undefined> {
    const capsule = await this.getCapsule(id);
    if (!capsule) return undefined;
    
    const updatedCapsule = { ...capsule, ...updates };
    this.identityCapsules.set(id, updatedCapsule);
    return updatedCapsule;
  }
  
  async getVerifiedData(id: number): Promise<VerifiedData | undefined> {
    return this.verifiedData.get(id);
  }
  
  async getVerifiedDataByCapsuleId(capsuleId: number): Promise<VerifiedData[]> {
    const data: VerifiedData[] = [];
    for (const item of this.verifiedData.values()) {
      if (item.capsuleId === capsuleId) {
        data.push(item);
      }
    }
    return data;
  }
  
  async createVerifiedData(insertData: InsertVerifiedData & { verifiedAt: string }): Promise<VerifiedData> {
    const data: VerifiedData = {
      ...insertData,
      id: this.dataIdCounter++
    };
    
    this.verifiedData.set(data.id, data);
    return data;
  }
  
  async getAiConnection(id: number): Promise<AiConnection | undefined> {
    return this.aiConnections.get(id);
  }
  
  async getAiConnectionsByUserId(userId: number): Promise<AiConnection[]> {
    const connections: AiConnection[] = [];
    for (const connection of this.aiConnections.values()) {
      if (connection.userId === userId) {
        connections.push(connection);
      }
    }
    return connections;
  }
  
  async createAiConnection(insertConnection: InsertAiConnection & { createdAt: string, lastUsed: string | null }): Promise<AiConnection> {
    const connection: AiConnection = {
      ...insertConnection,
      id: this.connectionIdCounter++
    };
    
    this.aiConnections.set(connection.id, connection);
    return connection;
  }
  
  async updateAiConnection(id: number, updates: Partial<AiConnection>): Promise<AiConnection | undefined> {
    const connection = await this.getAiConnection(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...updates };
    this.aiConnections.set(id, updatedConnection);
    return updatedConnection;
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    const activities: Activity[] = [];
    for (const activity of this.activities.values()) {
      if (activity.userId === userId) {
        activities.push(activity);
      }
    }
    return activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      ...insertActivity,
      id: this.activityIdCounter++,
      createdAt: new Date().toISOString()
    };
    
    this.activities.set(activity.id, activity);
    return activity;
  }
}

export const storage = new MemStorage();