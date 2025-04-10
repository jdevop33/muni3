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
        //return; // Skip the rest if meetings exist - COMMENTING OUT TO ALWAYS TRY SEEDING FOR DEBUG
         console.log('>>> [Vercel] Meeting data exists OR count failed, but continuing to attempt sample data seeding anyway (DEBUGGING)...');
      }

      console.log('>>> [Vercel] Initializing database with sample data (meetings, decisions, etc.)...');

      // --- Rest of your sample data creation logic (meetings, decisions, topics, etc.) ---
      // --- This is the sample data seeding part ---

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
        // Add more sample meetings if desired...
      ];

      const createdMeetings: Meeting[] = [];
      console.log(`>>> [Vercel] About to create ${meetingsData.length} sample meetings.`);
      for (const meeting of meetingsData) {
        try {
          const { keyDiscussions, keyDecisions, ...insertableMeeting } = meeting as any;
          const createdMeeting = await this.createMeeting(insertableMeeting);
          createdMeetings.push(createdMeeting);
          console.log(`>>> [Vercel] Created sample meeting: ${createdMeeting.title}`);
        } catch (error) {
          console.error('>>> [Vercel] Error creating sample meeting:', error);
        }
      }
      console.log(`>>> [Vercel] Finished creating ${createdMeetings.length} sample meetings.`);

      // Create sample decisions only if meetings were created
      if (createdMeetings.length > 0) {
        const decisionsData: InsertDecision[] = [
          {
            meetingId: createdMeetings[0].id, 
            meeting: createdMeetings[0].title,
            meetingType: createdMeetings[0].type,
            title: "Approved Official Community Plan Updates",
            description: "Council voted 6-1 to approve the updated Official Community Plan...",
            date: createdMeetings[0].date,
            topics: ["Housing", "Community Planning"],
            votesFor: 6,
            votesAgainst: 1,
            status: "Approved",
            type: "Motion"
          },
           {
            meetingId: createdMeetings[0].id, 
            meeting: createdMeetings[0].title,
            meetingType: createdMeetings[0].type,
            title: "Henderson Cycling Facility Budget Increase",
            description: "Council approved a budget amendment...",
            date: createdMeetings[0].date,
            topics: ["Active Transportation", "Budget"],
            votesFor: 7,
            votesAgainst: 0,
            status: "Approved",
            type: "Amendment"
          },
          {
            meetingId: createdMeetings[1]?.id || createdMeetings[0].id, // Fallback to first if second doesn't exist
            meeting: createdMeetings[1]?.title || createdMeetings[0].title,
            meetingType: createdMeetings[1]?.type || createdMeetings[0].type,
            title: "Blasting Regulations Amendment",
            description: "Committee recommended council approve amendments...",
            date: createdMeetings[1]?.date || createdMeetings[0].date,
            topics: ["Public Works"],
            votesFor: 5,
            votesAgainst: 0,
            status: "Recommended",
            type: "Recommendation"
          }
          // Add more sample decisions if desired...
        ];
        console.log(`>>> [Vercel] About to create ${decisionsData.length} sample decisions.`);
        let decisionsCreatedCount = 0;
        for (const decision of decisionsData) {
          try {
            await this.createDecision(decision);
            decisionsCreatedCount++;
          } catch (error) {
            console.error('>>> [Vercel] Error creating sample decision:', error);
          }
        }
         console.log(`>>> [Vercel] Finished creating ${decisionsCreatedCount} sample decisions.`);
      } else {
        console.log('>>> [Vercel] Skipping sample decision creation as no sample meetings were created.');
      }

      // Create sample topics
      const topicsData: InsertTopic[] = [
        { name: "Housing", count: 24, lastDiscussed: new Date("2025-04-04T00:00:00") },
        { name: "Parks & Facilities", count: 18, lastDiscussed: new Date("2025-03-25T00:00:00") },
        // Add more topics...
      ];
      console.log(`>>> [Vercel] About to create ${topicsData.length} sample topics.`);
       let topicsCreatedCount = 0;
      for (const topic of topicsData) {
         try {
           await this.createTopic(topic);
           topicsCreatedCount++;
         } catch (error) {
           console.error('>>> [Vercel] Error creating sample topic:', error);
         }
      }
      console.log(`>>> [Vercel] Finished creating ${topicsCreatedCount} sample topics.`);

      // Create sample neighborhoods
      const neighborhoodsData: InsertNeighborhood[] = [
        { name: "North Oak Bay", discussions: 8, lastDiscussed: new Date("2025-04-04T00:00:00"), color: "blue" },
        { name: "Central Oak Bay", discussions: 15, lastDiscussed: new Date("2025-04-04T00:00:00"), color: "purple" },
        // Add more neighborhoods...
      ];
      console.log(`>>> [Vercel] About to create ${neighborhoodsData.length} sample neighborhoods.`);
      let neighborhoodsCreatedCount = 0;
      for (const neighborhood of neighborhoodsData) {
        try {
          await this.createNeighborhood(neighborhood);
          neighborhoodsCreatedCount++;
        } catch (error) {
          console.error('>>> [Vercel] Error creating sample neighborhood:', error);
        }
      }
      console.log(`>>> [Vercel] Finished creating ${neighborhoodsCreatedCount} sample neighborhoods.`);

      // Create sample meeting discussions (only if meetings were created)
      if (createdMeetings.length > 0) {
           const meetingDiscussionsData: InsertMeetingDiscussion[] = [
             {
              meetingId: createdMeetings[0].id, 
              speakerName: "Mayor Smith", speakerRole: "Mayor", speakerAvatar: "...\略...",
              text: "Good evening everyone...", timestamp: "0:00:15", isDecision: false
            },
            {
              meetingId: createdMeetings[0].id,
              speakerName: "Councillor Johnson", speakerRole: "Councillor", speakerAvatar: "...\略...",
              text: "Thank you, Mayor...", timestamp: "0:01:22", isDecision: false
            },
            // Add more discussions...
          ];
          console.log(`>>> [Vercel] About to create ${meetingDiscussionsData.length} sample discussions.`);
          let discussionsCreatedCount = 0;
          for (const discussion of meetingDiscussionsData) {
            try {
              await this.createMeetingDiscussion(discussion);
              discussionsCreatedCount++;
            } catch (error) {
              console.error('>>> [Vercel] Error creating sample discussion:', error);
            }
          }
          console.log(`>>> [Vercel] Finished creating ${discussionsCreatedCount} sample discussions.`);
      } else {
          console.log('>>> [Vercel] Skipping sample discussion creation as no sample meetings were created.');
      }

       // Create sample meeting key moments (only if meetings were created)
      if (createdMeetings.length > 0) {
          const keyMomentsData: InsertMeetingKeyMoment[] = [
             {
              meetingId: createdMeetings[0].id,
              title: "Official Community Plan Vote", timestamp: "1:15:32", description: "Motion approved 6-1"
            },
            {
              meetingId: createdMeetings[0].id,
              title: "Henderson Cycling Budget", timestamp: "1:42:18", description: "Amendment discussion"
            },
            // Add more key moments...
          ];
           console.log(`>>> [Vercel] About to create ${keyMomentsData.length} sample key moments.`);
           let keyMomentsCreatedCount = 0;
          for (const keyMoment of keyMomentsData) {
            try {
              await this.createMeetingKeyMoment(keyMoment);
              keyMomentsCreatedCount++;
            } catch (error) {
              console.error('>>> [Vercel] Error creating sample key moment:', error);
            }
          }
          console.log(`>>> [Vercel] Finished creating ${keyMomentsCreatedCount} sample key moments.`);
      } else {
           console.log('>>> [Vercel] Skipping sample key moment creation as no sample meetings were created.');
      }

      console.log('>>> [Vercel] Finished initializing all sample data.');

    } catch (error) {
      console.error('>>> [Vercel] Error during database initialization check or seeding:', error);
    }
  }
}

// Initialize and export the database storage
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
