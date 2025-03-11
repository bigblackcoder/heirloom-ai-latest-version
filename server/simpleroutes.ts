import { Express, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Simple types for our development environment
interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  memberSince: string;
  avatar: string | null;
}

// Simple in-memory storage for development
class MemStorage {
  private users: Map<number, User>;
  private userIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.userIdCounter = 1;
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
  
  async createUser(userData: Omit<User, "id" | "isVerified" | "memberSince" | "avatar">): Promise<User> {
    const user: User = { 
      ...userData,
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
}

const storage = new MemStorage();

// Schema for validating registration data
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export function setupRoutes(app: Express) {
  // User Registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: validationResult.error.errors 
        });
      }
      
      const validatedData = validationResult.data;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ 
          error: "Username already exists" 
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: "Registration failed" });
    }
  });
  
  // User Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: "Login failed" });
    }
  });
  
  // User Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ error: "Logout failed" });
          }
          
          res.clearCookie('connect.sid');
          return res.json({ message: "Logged out successfully" });
        });
      } else {
        return res.json({ message: "No session to logout from" });
      }
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: "Logout failed" });
    }
  });
  
  // Get Current User
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Get user from storage
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        if (req.session) {
          req.session.destroy(() => {});
        }
        return res.status(401).json({ error: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ error: "Failed to get user data" });
    }
  });
  
  // Face Verification
  app.post("/api/verification/face", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }
      
      // Import the verifyFace function dynamically to avoid potential issues with circular imports
      const { verifyFace } = await import('./deepface');
      
      // Use our face verification functionality
      const verificationResult = await verifyFace(imageBase64);
      
      // Update user's verification status if successful
      if (verificationResult.success && verificationResult.confidence > 0.7) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          await storage.updateUser(user.id, { isVerified: true });
        }
      }
      
      return res.json(verificationResult);
    } catch (error) {
      console.error('Face verification error:', error);
      return res.status(500).json({ 
        error: "Face verification failed",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  return app;
}