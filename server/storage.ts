import { 
  users, type User, type InsertUser,
  meetings, type Meeting, type InsertMeeting,
  decisions, type Decision, type InsertDecision,
  topics, type Topic, type InsertTopic,
  neighborhoods, type Neighborhood, type InsertNeighborhood,
  meetingDiscussions, type MeetingDiscussion, type InsertMeetingDiscussion,
  meetingKeyMoments, type MeetingKeyMoment, type InsertMeetingKeyMoment
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, asc, count } from "drizzle-orm";
import { hashPassword } from "./auth"; // Import the hashPassword function

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Meeting operations
  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  getRecentMeetings(limit?: number): Promise<Meeting[]>;
  getUpcomingMeetings(limit?: number): Promise<Meeting[]>;
  getMeetingsByType(type: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  
  // Decision operations
  getDecisions(): Promise<Decision[]>;
  getDecision(id: number): Promise<Decision | undefined>;
  getRecentDecisions(limit?: number): Promise<Decision[]>;
  getDecisionsByStatus(status: string): Promise<Decision[]>;
  getDecisionsByMeeting(meetingId: number): Promise<Decision[]>;
  createDecision(decision: InsertDecision): Promise<Decision>;
  
  // Topic operations
  getTopics(): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  getTopicByName(name: string): Promise<Topic | undefined>;
  getPopularTopics(limit?: number): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Neighborhood operations
  getNeighborhoods(): Promise<Neighborhood[]>;
  getNeighborhood(id: number): Promise<Neighborhood | undefined>;
  getNeighborhoodByName(name: string): Promise<Neighborhood | undefined>;
  createNeighborhood(neighborhood: InsertNeighborhood): Promise<Neighborhood>;
  
  // Meeting discussion operations
  getMeetingDiscussions(meetingId: number): Promise<MeetingDiscussion[]>;
  createMeetingDiscussion(discussion: InsertMeetingDiscussion): Promise<MeetingDiscussion>;
  
  // Meeting key moment operations
  getMeetingKeyMoments(meetingId: number): Promise<MeetingKeyMoment[]>;
  createMeetingKeyMoment(keyMoment: InsertMeetingKeyMoment): Promise<MeetingKeyMoment>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    // Explicitly select columns matching the User type
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      password: users.password,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      organization: users.organization,
      position: users.position,
      avatarUrl: users.avatarUrl,
      isActive: users.isActive,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt
    }).from(users);
    return allUsers;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      ...insertUser,
      email: insertUser.email || null,
      fullName: insertUser.fullName || null,
      role: insertUser.role || "user",
      organization: insertUser.organization || null,
      position: insertUser.position || null,
      avatarUrl: insertUser.avatarUrl || null,
      isActive: true,
      lastLogin: null,
      createdAt: new Date()
    };
    console.log('>>> [Vercel] Attempting to insert user:', userData.username); // ADDED LOG
    const [user] = await db.insert(users).values(userData).returning();
    console.log('>>> [Vercel] User insertion successful for:', user.username); // ADDED LOG
    return user;
  }
  
  async updateUser(id: number, updatedUserData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(updatedUserData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // ... [rest of the methods remain unchanged] ...

  // Method to initialize data
  async initializeData() {
    console.log('>>> [Vercel] Entering initializeData function...'); // ADDED LOG
    try {
      // Check if users exist first
      console.log('>>> [Vercel] Checking for existing users...'); // ADDED LOG
      const existingUsers = await db.select({ value: count() }).from(users); // Use count() aggregation
      
      // ADDED LOG: Log the result of the user count check
      console.log(`>>> [Vercel] User count check result: ${JSON.stringify(existingUsers)}`); 

      if (!existingUsers || existingUsers.length === 0 || existingUsers[0].value === 0) {
        console.log('>>> [Vercel] No users found (or count failed), creating default admin user...'); // Modified Log
        try {
          await this.createUser({
            username: "admin",
            // IMPORTANT: Use the actual password you want, it will be hashed
            password: await hashPassword("admin123"),
            role: "admin",
            fullName: "Admin User",
            email: "admin@example.com" // Use a real email if desired
          });
          console.log('>>> [Vercel] Default admin user created successfully.');
        } catch (userError) {
          console.error('>>> [Vercel] Error creating default admin user:', userError);
          // Decide if you want to proceed if admin creation fails
        }
      } else {
         console.log(`>>> [Vercel] Found ${existingUsers[0].value} users, skipping admin user creation.`);
      }

      // Check if meetings exist
      console.log('>>> [Vercel] Checking for existing meetings...'); // ADDED LOG
      const existingMeetings = await db.select({ value: count() }).from(meetings);

      // ADDED LOG: Log the result of the meeting count check
      console.log(`>>> [Vercel] Meeting count check result: ${JSON.stringify(existingMeetings)}`); 

      if (!existingMeetings || existingMeetings.length === 0 || existingMeetings[0].value > 0) {
        console.log('>>> [Vercel] Database already initialized with meeting data (or count failed), skipping sample data creation.'); // Modified Log
        return; // Skip the rest if meetings exist
      }

      console.log('>>> [Vercel] Initializing database with sample data (meetings, decisions, etc.)...');

      // --- Rest of your sample data creation logic (meetings, decisions, topics, etc.) ---
      // --- Make sure this part remains unchanged from the original file ---

      // ... [rest of sample data creation code] ...

      console.log('>>> [Vercel] Finished initializing sample data.');

    } catch (error) {
      console.error('>>> [Vercel] Error during database initialization check or seeding:', error);
      // Decide how to handle initialization errors - maybe throw to stop server start?
    }
  }
}

// Initialize and export the database storage instead of MemStorage
export const storage = new DatabaseStorage();

// Initialize the database with sample data when the server starts
(async () => {
  console.log('>>> [Vercel] Starting storage initialization call...'); // ADDED LOG
  try {
    await storage.initializeData(); // Call the modified method
    console.log('>>> [Vercel] Database initialization check completed.'); // Modified Log
  } catch (error) {
    console.error('>>> [Vercel] Error during storage initialization call:', error);
  }
})();
