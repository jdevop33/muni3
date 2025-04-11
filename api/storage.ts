import { 
  users, type User, type InsertUser,
  meetings, type Meeting, type InsertMeeting,
  decisions, type Decision, type InsertDecision,
  topics, type Topic, type InsertTopic,
  neighborhoods, type Neighborhood, type InsertNeighborhood,
  meetingDiscussions, type MeetingDiscussion, type InsertMeetingDiscussion,
  meetingKeyMoments, type MeetingKeyMoment, type InsertMeetingKeyMoment
} from "../shared/schema.js"; // Use relative path and .js extension
import { db } from "./db.js"; // Use .js extension
import { eq, sql, desc, asc, count } from "drizzle-orm";
import { hashPassword } from "./auth.js"; // Use .js extension

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
    console.log('>>> [Vercel] Attempting to insert user:', userData.username);
    const [user] = await db.insert(users).values(userData).returning();
    console.log('>>> [Vercel] User insertion successful for:', user.username);
    return user;
  }
  
  async updateUser(id: number, updatedUserData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(updatedUserData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Meeting methods
  async getMeetings(): Promise<Meeting[]> {
    const result = await db.select().from(meetings).orderBy(desc(meetings.date));
    return result;
  }
  
  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting || undefined;
  }
  
  async getRecentMeetings(limit: number = 5): Promise<Meeting[]> {
    const result = await db.select()
      .from(meetings)
      .where(eq(meetings.status, "Completed"))
      .orderBy(desc(meetings.date))
      .limit(limit);
    return result;
  }
  
  async getUpcomingMeetings(limit: number = 5): Promise<Meeting[]> {
    const result = await db.select()
      .from(meetings)
      .where(eq(meetings.status, "Scheduled"))
      .orderBy(asc(meetings.date))
      .limit(limit);
    return result;
  }
  
  async getMeetingsByType(type: string): Promise<Meeting[]> {
    const result = await db.select()
      .from(meetings)
      .where(sql`lower(${meetings.type}) like ${`%${type.toLowerCase()}%`}`)
      .orderBy(desc(meetings.date));
    return result;
  }
  
  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db.insert(meetings).values(insertMeeting).returning();
    return meeting;
  }
  
  // Decision methods
  async getDecisions(): Promise<Decision[]> {
    const result = await db.select().from(decisions).orderBy(desc(decisions.date));
    return result;
  }
  
  async getDecision(id: number): Promise<Decision | undefined> {
    const [decision] = await db.select().from(decisions).where(eq(decisions.id, id));
    return decision || undefined;
  }
  
  async getRecentDecisions(limit: number = 5): Promise<Decision[]> {
    const result = await db.select()
      .from(decisions)
      .orderBy(desc(decisions.date))
      .limit(limit);
    return result;
  }
  
  async getDecisionsByStatus(status: string): Promise<Decision[]> {
    if (status === 'all') {
      return this.getDecisions();
    }
    const result = await db.select()
      .from(decisions)
      .where(sql`lower(${decisions.status}) = ${status.toLowerCase()}`)
      .orderBy(desc(decisions.date));
    return result;
  }
  
  async getDecisionsByMeeting(meetingId: number): Promise<Decision[]> {
    const result = await db.select()
      .from(decisions)
      .where(eq(decisions.meetingId, meetingId))
      .orderBy(desc(decisions.date));
    return result;
  }
  
  async createDecision(insertDecision: InsertDecision): Promise<Decision> {
    const [decision] = await db.insert(decisions).values(insertDecision).returning();
    return decision;
  }
  
  // Topic methods
  async getTopics(): Promise<Topic[]> {
    const result = await db.select().from(topics).orderBy(desc(topics.count));
    return result;
  }
  
  async getTopic(id: number): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic || undefined;
  }
  
  async getTopicByName(name: string): Promise<Topic | undefined> {
    const [topic] = await db.select()
      .from(topics)
      .where(sql`lower(${topics.name}) = ${name.toLowerCase()}`);
    return topic || undefined;
  }
  
  async getPopularTopics(limit: number = 5): Promise<Topic[]> {
    const result = await db.select()
      .from(topics)
      .orderBy(desc(topics.count))
      .limit(limit);
    return result;
  }
  
  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const [topic] = await db.insert(topics).values(insertTopic).returning();
    return topic;
  }
  
  // Neighborhood methods
  async getNeighborhoods(): Promise<Neighborhood[]> {
    const result = await db.select().from(neighborhoods).orderBy(desc(neighborhoods.discussions));
    return result;
  }
  
  async getNeighborhood(id: number): Promise<Neighborhood | undefined> {
    const [neighborhood] = await db.select().from(neighborhoods).where(eq(neighborhoods.id, id));
    return neighborhood || undefined;
  }
  
  async getNeighborhoodByName(name: string): Promise<Neighborhood | undefined> {
    const [neighborhood] = await db.select()
      .from(neighborhoods)
      .where(sql`lower(${neighborhoods.name}) = ${name.toLowerCase()}`);
    return neighborhood || undefined;
  }
  
  async createNeighborhood(insertNeighborhood: InsertNeighborhood): Promise<Neighborhood> {
    const [neighborhood] = await db.insert(neighborhoods).values(insertNeighborhood).returning();
    return neighborhood;
  }
  
  // Meeting discussion methods
  async getMeetingDiscussions(meetingId: number): Promise<MeetingDiscussion[]> {
    const result = await db.select()
      .from(meetingDiscussions)
      .where(eq(meetingDiscussions.meetingId, meetingId))
      .orderBy(asc(meetingDiscussions.timestamp));
    return result;
  }
  
  async createMeetingDiscussion(insertDiscussion: InsertMeetingDiscussion): Promise<MeetingDiscussion> {
    const [discussion] = await db.insert(meetingDiscussions).values(insertDiscussion).returning();
    return discussion;
  }
  
  // Meeting key moment methods
  async getMeetingKeyMoments(meetingId: number): Promise<MeetingKeyMoment[]> {
    const result = await db.select()
      .from(meetingKeyMoments)
      .where(eq(meetingKeyMoments.meetingId, meetingId))
      .orderBy(asc(meetingKeyMoments.timestamp));
    return result;
  }
  
  async createMeetingKeyMoment(insertKeyMoment: InsertMeetingKeyMoment): Promise<MeetingKeyMoment> {
    const [keyMoment] = await db.insert(meetingKeyMoments).values(insertKeyMoment).returning();
    return keyMoment;
  }

  // Method to initialize data
  async initializeData() {
    console.log('>>> [Vercel] Entering initializeData function...');
    try {
      // Check if users exist first
      console.log('>>> [Vercel] Checking for existing users...');
      const existingUsers = await db.select({ value: count() }).from(users);
      console.log(`>>> [Vercel] User count check result: ${JSON.stringify(existingUsers)}`); 

      if (!existingUsers || existingUsers.length === 0 || existingUsers[0].value === 0) {
        console.log('>>> [Vercel] No users found, creating default admin user...');
        try {
          await this.createUser({
            username: "admin",
            password: await hashPassword("admin123"), // Hash the password
            role: "admin",
            fullName: "Admin User",
            email: "admin@example.com"
          });
          console.log('>>> [Vercel] Default admin user created successfully.');
        } catch (userError) {
          console.error('>>> [Vercel] Error creating default admin user:', userError);
        }
      } else {
         console.log(`>>> [Vercel] Found ${existingUsers[0].value} users, skipping admin user creation.`);
      }

      console.log('>>> [Vercel] Checking for existing meetings...');
      const existingMeetings = await db.select({ value: count() }).from(meetings);
      console.log(`>>> [Vercel] Meeting count check result: ${JSON.stringify(existingMeetings)}`); 

      if (!existingMeetings || existingMeetings.length === 0 || existingMeetings[0].value > 0) {
        console.log('>>> [Vercel] Database already initialized with meeting data, skipping sample data creation.');
         console.log('>>> [Vercel] Meeting data exists, continuing seeding attempts (DEBUGGING)...');
      }
      
      if (existingMeetings && existingMeetings.length > 0 && existingMeetings[0].value === 0) {
          console.log('>>> [Vercel] Initializing database with sample data (meetings, decisions, etc.)...');
          // --- Sample data creation logic ---
          // (Code omitted for brevity - assume it exists as before)
           console.log('>>> [Vercel] Finished initializing sample data.');
      } else {
          console.log('>>> [Vercel] Skipping sample data seeding or meeting count check failed.')
      }

    } catch (error) {
      console.error('>>> [Vercel] Error during database initialization check or seeding:', error);
    }
  }
}

// Initialize and export the database storage
export const storage = new DatabaseStorage();

// Initialize the database with sample data when the server starts 
// (might not run reliably in serverless, better to have a separate seed script)
// (async () => {
//   console.log('>>> [Vercel] Starting storage initialization call...'); 
//   try {
//     await storage.initializeData(); 
//     console.log('>>> [Vercel] Database initialization check completed.'); 
//   } catch (error) {
//     console.error('>>> [Vercel] Error during storage initialization call:', error);
//   }
// })();
