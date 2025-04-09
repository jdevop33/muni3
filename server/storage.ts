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
    const [user] = await db.insert(users).values(userData).returning();
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
    try {
      // Check if users exist first
      const existingUsers = await db.select({ value: count() }).from(users); // Use count() aggregation
      if (existingUsers[0].value === 0) {
        console.log('No users found, creating default admin user...');
        try {
          await this.createUser({
            username: "admin",
            // IMPORTANT: Use the actual password you want, it will be hashed
            password: await hashPassword("admin123"),
            role: "admin",
            fullName: "Admin User",
            email: "admin@example.com" // Use a real email if desired
          });
          console.log('Default admin user created successfully.');
        } catch (userError) {
          console.error('Error creating default admin user:', userError);
          // Decide if you want to proceed if admin creation fails
        }
      } else {
         console.log(`Found ${existingUsers[0].value} users, skipping admin user creation.`);
      }

      // Check if meetings exist
      const existingMeetings = await db.select({ value: count() }).from(meetings);
      if (existingMeetings[0].value > 0) {
        console.log('Database already initialized with meeting data, skipping sample data creation.');
        return; // Skip the rest if meetings exist
      }

      console.log('Initializing database with sample data (meetings, decisions, etc.)...');

      // --- Rest of your sample data creation logic (meetings, decisions, topics, etc.) ---
      // --- Make sure this part remains unchanged from the original file ---

      // Create sample meetings
      const meetingsData: InsertMeeting[] = [
        {
          title: "Regular Council Meeting",
          type: "Regular Council Meeting",
          date: new Date("2025-04-04T00:00:00"),
          startTime: "7:00 PM",
          duration: "2h 15m",
          status: "Completed",
          topics: ["Housing", "Community Planning", "Budget"],
          participants: 7,
          hasVideo: true,
          hasTranscript: true,
          hasMinutes: true
        },
        {
          title: "Committee of the Whole",
          type: "Committee of the Whole",
          date: new Date("2025-03-25T00:00:00"),
          startTime: "6:00 PM",
          duration: "1h 45m",
          status: "Completed",
          topics: ["Parks & Facilities", "Public Works"],
          participants: 5,
          hasVideo: true,
          hasTranscript: true,
          hasMinutes: true
        },
        {
          title: "Special Council Meeting",
          type: "Special Council Meeting",
          date: new Date("2025-03-15T00:00:00"),
          startTime: "7:30 PM",
          duration: "50m",
          status: "Completed",
          topics: ["Budget", "Capital Projects"],
          participants: 6,
          hasVideo: true,
          hasTranscript: true,
          hasMinutes: true
        },
        {
          title: "Regular Council Meeting",
          type: "Regular Council Meeting",
          date: new Date("2025-05-02T00:00:00"),
          startTime: "7:00 PM",
          duration: "",
          status: "Scheduled",
          topics: [],
          participants: 0,
          hasVideo: false,
          hasTranscript: false,
          hasMinutes: false
        },
        {
          title: "Committee of the Whole",
          type: "Committee of the Whole",
          date: new Date("2025-05-15T00:00:00"),
          startTime: "6:00 PM",
          duration: "",
          status: "Scheduled",
          topics: [],
          participants: 0,
          hasVideo: false,
          hasTranscript: false,
          hasMinutes: false
        },
        {
          title: "Parks, Recreation & Culture Advisory Committee",
          type: "Advisory Committee",
          date: new Date("2025-05-22T00:00:00"),
          startTime: "5:30 PM",
          duration: "",
          status: "Scheduled",
          topics: [],
          participants: 0,
          hasVideo: false,
          hasTranscript: false,
          hasMinutes: false
        }
      ];

      const createdMeetings = [];
      for (const meeting of meetingsData) {
        try {
          // Ensure keyDiscussions and keyDecisions are excluded if they cause issues
          const { keyDiscussions, keyDecisions, ...insertableMeeting } = meeting as any;
          const createdMeeting = await this.createMeeting(insertableMeeting);
          createdMeetings.push(createdMeeting);
        } catch (error) {
          console.error('Error creating sample meeting:', error);
        }
      }

      // Create sample decisions
      const decisionsData: InsertDecision[] = [
         {
          meetingId: createdMeetings[0]?.id || 1, // Use actual ID if available
          meeting: "Regular Council Meeting",
          meetingType: "Regular Council Meeting",
          title: "Approved Official Community Plan Updates",
          description: "Council voted 6-1 to approve the updated Official Community Plan including new housing density provisions for Village Center.",
          date: new Date("2025-04-04T00:00:00"),
          topics: ["Housing", "Community Planning"],
          votesFor: 6,
          votesAgainst: 1,
          status: "Approved",
          type: "Motion"
        },
        {
          meetingId: createdMeetings[0]?.id || 1,
          meeting: "Regular Council Meeting",
          meetingType: "Regular Council Meeting",
          title: "Henderson Cycling Facility Budget Increase",
          description: "Council approved a budget amendment for the Henderson Road Cycling Facility with an additional $250,000 to complete Phase 2 implementation.",
          date: new Date("2025-04-04T00:00:00"),
          topics: ["Active Transportation", "Budget"],
          votesFor: 7,
          votesAgainst: 0,
          status: "Approved",
          type: "Amendment"
        },
        {
          meetingId: createdMeetings[1]?.id || 2,
          meeting: "Committee of the Whole",
          meetingType: "Committee of the Whole",
          title: "Blasting Regulations Amendment",
          description: "Committee recommended council approve amendments to the blasting regulations bylaw to include more stringent notification requirements.",
          date: new Date("2025-03-25T00:00:00"),
          topics: ["Public Works"],
          votesFor: 5,
          votesAgainst: 0,
          status: "Recommended",
          type: "Recommendation"
        }
      ];

      for (const decision of decisionsData) {
         try {
           await this.createDecision(decision);
         } catch (error) {
           console.error('Error creating sample decision:', error);
         }
      }

      // Create sample topics
      const topicsData: InsertTopic[] = [
        {
          name: "Housing",
          count: 24,
          lastDiscussed: new Date("2025-04-04T00:00:00")
        },
        {
          name: "Parks & Facilities",
          count: 18,
          lastDiscussed: new Date("2025-03-25T00:00:00")
        },
        {
          name: "Community Planning",
          count: 15,
          lastDiscussed: new Date("2025-04-04T00:00:00")
        },
        {
          name: "Budget",
          count: 12,
          lastDiscussed: new Date("2025-04-04T00:00:00")
        },
        {
          name: "Active Transportation",
          count: 10,
          lastDiscussed: new Date("2025-04-04T00:00:00")
        },
        {
          name: "Public Works",
          count: 8,
          lastDiscussed: new Date("2025-03-25T00:00:00")
        },
        {
          name: "Capital Projects",
          count: 6,
          lastDiscussed: new Date("2025-03-15T00:00:00")
        }
      ];

      for (const topic of topicsData) {
         try {
           await this.createTopic(topic);
         } catch (error) {
           console.error('Error creating sample topic:', error);
         }
      }

      // Create sample neighborhoods
      const neighborhoodsData: InsertNeighborhood[] = [
        {
          name: "North Oak Bay",
          discussions: 8,
          lastDiscussed: new Date("2025-04-04T00:00:00"),
          color: "blue"
        },
        {
          name: "Central Oak Bay",
          discussions: 15,
          lastDiscussed: new Date("2025-04-04T00:00:00"),
          color: "purple"
        },
        {
          name: "South Oak Bay",
          discussions: 6,
          lastDiscussed: new Date("2025-03-25T00:00:00"),
          color: "green"
        }
      ];

      for (const neighborhood of neighborhoodsData) {
        try {
          await this.createNeighborhood(neighborhood);
        } catch (error) {
          console.error('Error creating sample neighborhood:', error);
        }
      }

      // Create sample meeting discussions for the first meeting
      const meetingDiscussionsData: InsertMeetingDiscussion[] = [
         {
          meetingId: createdMeetings[0]?.id || 1,
          speakerName: "Mayor Smith",
          speakerRole: "Mayor",
          speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
          text: "Good evening everyone. I'd like to call this Regular Council Meeting to order. We have a full agenda tonight, including the final discussion on the Official Community Plan updates and the Henderson Cycling Facility budget.",
          timestamp: "0:00:15",
          isDecision: false
        },
        {
          meetingId: createdMeetings[0]?.id || 1,
          speakerName: "Councillor Johnson",
          speakerRole: "Councillor",
          speakerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
          text: "Thank you, Mayor. Before we begin, I'd like to request that we move item 5.3 regarding the Carnarvon Park timeline to the next Committee meeting, as we're awaiting the final report from our consultants.",
          timestamp: "0:01:22",
          isDecision: false
        },
        {
          meetingId: createdMeetings[0]?.id || 1,
          speakerName: "Mayor Smith",
          speakerRole: "Mayor",
          speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
          text: "All in favor of approving the Official Community Plan updates as presented?",
          timestamp: "1:15:30",
          isDecision: true,
          decisionId: 1 // Assuming decision with ID 1 was created
        }
      ];

      for (const discussion of meetingDiscussionsData) {
         try {
           await this.createMeetingDiscussion(discussion);
         } catch (error) {
           console.error('Error creating sample discussion:', error);
         }
      }

      // Create sample meeting key moments
      const keyMomentsData: InsertMeetingKeyMoment[] = [
         {
          meetingId: createdMeetings[0]?.id || 1,
          title: "Official Community Plan Vote",
          timestamp: "1:15:32",
          description: "Motion approved 6-1"
        },
        {
          meetingId: createdMeetings[0]?.id || 1,
          title: "Henderson Cycling Budget",
          timestamp: "1:42:18",
          description: "Amendment discussion"
        },
        {
          meetingId: createdMeetings[0]?.id || 1,
          title: "Public Delegations",
          timestamp: "0:32:45",
          description: "4 speakers on housing"
        }
      ];

      for (const keyMoment of keyMomentsData) {
        try {
          await this.createMeetingKeyMoment(keyMoment);
        } catch (error) {
           console.error('Error creating sample key moment:', error);
        }
      }
      console.log('Finished initializing sample data.');

    } catch (error) {
      console.error('Error during database initialization check or seeding:', error);
      // Decide how to handle initialization errors - maybe throw to stop server start?
    }
  }
}

// Initialize and export the database storage instead of MemStorage
export const storage = new DatabaseStorage();

// Initialize the database with sample data when the server starts
(async () => {
  try {
    await storage.initializeData(); // Call the modified method
    console.log('Database initialization check completed');
  } catch (error) {
    console.error('Error during database initialization check:', error);
  }
})();
