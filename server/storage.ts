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
import { eq, sql, desc, asc } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private decisions: Map<number, Decision>;
  private topics: Map<number, Topic>;
  private neighborhoods: Map<number, Neighborhood>;
  private meetingDiscussions: Map<number, MeetingDiscussion>;
  private meetingKeyMoments: Map<number, MeetingKeyMoment>;
  
  private userIdCounter: number;
  private meetingIdCounter: number;
  private decisionIdCounter: number;
  private topicIdCounter: number;
  private neighborhoodIdCounter: number;
  private discussionIdCounter: number;
  private keyMomentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.decisions = new Map();
    this.topics = new Map();
    this.neighborhoods = new Map();
    this.meetingDiscussions = new Map();
    this.meetingKeyMoments = new Map();
    
    this.userIdCounter = 1;
    this.meetingIdCounter = 1;
    this.decisionIdCounter = 1;
    this.topicIdCounter = 1;
    this.neighborhoodIdCounter = 1;
    this.discussionIdCounter = 1;
    this.keyMomentIdCounter = 1;
    
    // Set up initial data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Meeting methods
  async getMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }
  
  async getRecentMeetings(limit: number = 5): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.status === "Completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
  
  async getUpcomingMeetings(limit: number = 5): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.status === "Scheduled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }
  
  async getMeetingsByType(type: string): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.type.toLowerCase().includes(type.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingIdCounter++;
    const meeting: Meeting = { ...insertMeeting, id };
    this.meetings.set(id, meeting);
    return meeting;
  }
  
  // Decision methods
  async getDecisions(): Promise<Decision[]> {
    return Array.from(this.decisions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async getDecision(id: number): Promise<Decision | undefined> {
    return this.decisions.get(id);
  }
  
  async getRecentDecisions(limit: number = 5): Promise<Decision[]> {
    return Array.from(this.decisions.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
  
  async getDecisionsByStatus(status: string): Promise<Decision[]> {
    if (status === 'all') {
      return this.getDecisions();
    }
    return Array.from(this.decisions.values())
      .filter(decision => decision.status.toLowerCase() === status.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getDecisionsByMeeting(meetingId: number): Promise<Decision[]> {
    return Array.from(this.decisions.values())
      .filter(decision => decision.meetingId === meetingId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createDecision(insertDecision: InsertDecision): Promise<Decision> {
    const id = this.decisionIdCounter++;
    const decision: Decision = { ...insertDecision, id };
    this.decisions.set(id, decision);
    return decision;
  }
  
  // Topic methods
  async getTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values()).sort((a, b) => b.count - a.count);
  }
  
  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }
  
  async getTopicByName(name: string): Promise<Topic | undefined> {
    return Array.from(this.topics.values()).find(
      (topic) => topic.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getPopularTopics(limit: number = 5): Promise<Topic[]> {
    return Array.from(this.topics.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = this.topicIdCounter++;
    const topic: Topic = { ...insertTopic, id };
    this.topics.set(id, topic);
    return topic;
  }
  
  // Neighborhood methods
  async getNeighborhoods(): Promise<Neighborhood[]> {
    return Array.from(this.neighborhoods.values()).sort((a, b) => b.discussions - a.discussions);
  }
  
  async getNeighborhood(id: number): Promise<Neighborhood | undefined> {
    return this.neighborhoods.get(id);
  }
  
  async getNeighborhoodByName(name: string): Promise<Neighborhood | undefined> {
    return Array.from(this.neighborhoods.values()).find(
      (neighborhood) => neighborhood.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async createNeighborhood(insertNeighborhood: InsertNeighborhood): Promise<Neighborhood> {
    const id = this.neighborhoodIdCounter++;
    const neighborhood: Neighborhood = { ...insertNeighborhood, id };
    this.neighborhoods.set(id, neighborhood);
    return neighborhood;
  }
  
  // Meeting discussion methods
  async getMeetingDiscussions(meetingId: number): Promise<MeetingDiscussion[]> {
    return Array.from(this.meetingDiscussions.values())
      .filter(discussion => discussion.meetingId === meetingId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  
  async createMeetingDiscussion(insertDiscussion: InsertMeetingDiscussion): Promise<MeetingDiscussion> {
    const id = this.discussionIdCounter++;
    const discussion: MeetingDiscussion = { ...insertDiscussion, id };
    this.meetingDiscussions.set(id, discussion);
    return discussion;
  }
  
  // Meeting key moment methods
  async getMeetingKeyMoments(meetingId: number): Promise<MeetingKeyMoment[]> {
    return Array.from(this.meetingKeyMoments.values())
      .filter(moment => moment.meetingId === meetingId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  
  async createMeetingKeyMoment(insertKeyMoment: InsertMeetingKeyMoment): Promise<MeetingKeyMoment> {
    const id = this.keyMomentIdCounter++;
    const keyMoment: MeetingKeyMoment = { ...insertKeyMoment, id };
    this.meetingKeyMoments.set(id, keyMoment);
    return keyMoment;
  }
  
  // Initialize with some sample data
  private initializeData() {
    // Create sample meetings
    const meetings: InsertMeeting[] = [
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
    
    meetings.forEach(meeting => {
      this.createMeeting(meeting);
    });
    
    // Create sample decisions
    const decisions: InsertDecision[] = [
      {
        meetingId: 1,
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
        meetingId: 1,
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
        meetingId: 2,
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
    
    decisions.forEach(decision => {
      this.createDecision(decision);
    });
    
    // Create sample topics
    const topics: InsertTopic[] = [
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
    
    topics.forEach(topic => {
      this.createTopic(topic);
    });
    
    // Create sample neighborhoods
    const neighborhoods: InsertNeighborhood[] = [
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
    
    neighborhoods.forEach(neighborhood => {
      this.createNeighborhood(neighborhood);
    });
    
    // Create sample meeting discussions for the first meeting
    const discussions: InsertMeetingDiscussion[] = [
      {
        meetingId: 1,
        speakerName: "Mayor Smith",
        speakerRole: "Mayor",
        speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "Good evening everyone. I'd like to call this Regular Council Meeting to order. We have a full agenda tonight, including the final discussion on the Official Community Plan updates and the Henderson Cycling Facility budget.",
        timestamp: "0:00:15",
        isDecision: false
      },
      {
        meetingId: 1,
        speakerName: "Councillor Johnson",
        speakerRole: "Councillor",
        speakerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "Thank you, Mayor. Before we begin, I'd like to request that we move item 5.3 regarding the Carnarvon Park timeline to the next Committee meeting, as we're awaiting the final report from our consultants.",
        timestamp: "0:01:22",
        isDecision: false
      },
      {
        meetingId: 1,
        speakerName: "Mayor Smith",
        speakerRole: "Mayor",
        speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "That seems reasonable. Do we have a seconder for Councillor Johnson's motion to postpone item 5.3?",
        timestamp: "0:02:05",
        isDecision: false
      },
      {
        meetingId: 1,
        speakerName: "Councillor Lee",
        speakerRole: "Councillor",
        speakerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "I'll second that motion.",
        timestamp: "0:02:18",
        isDecision: false
      },
      {
        meetingId: 1,
        speakerName: "Mayor Smith",
        speakerRole: "Mayor",
        speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "Thank you. We have a motion and a second to postpone item 5.3 to the next Committee meeting. All in favor?",
        timestamp: "0:02:32",
        isDecision: true,
        decisionId: 1
      }
    ];
    
    discussions.forEach(discussion => {
      this.createMeetingDiscussion(discussion);
    });
    
    // Create sample key moments for the first meeting
    const keyMoments: InsertMeetingKeyMoment[] = [
      {
        meetingId: 1,
        title: "Official Community Plan Vote",
        timestamp: "1:15:32",
        description: "Motion approved 6-1"
      },
      {
        meetingId: 1,
        title: "Henderson Cycling Budget",
        timestamp: "1:42:18",
        description: "Amendment discussion"
      },
      {
        meetingId: 1,
        title: "Public Delegations",
        timestamp: "0:32:45",
        description: "4 speakers on housing"
      }
    ];
    
    keyMoments.forEach(moment => {
      this.createMeetingKeyMoment(moment);
    });
  }
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
    // Check if we already have data
    const existingMeetings = await db.select().from(meetings);
    if (existingMeetings.length > 0) {
      console.log('Database already initialized with data');
      return;
    }
    
    console.log('Initializing database with sample data');
    
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
        keyDiscussions: [
          {
            id: 1,
            text: "Reviewed public feedback on Official Community Plan density proposals",
            icon: "fa-comment"
          }
        ],
        keyDecisions: [
          {
            id: 1,
            text: "Approved updates to the Official Community Plan with 6-1 vote",
            icon: "fa-check"
          },
          {
            id: 2,
            text: "Approved budget amendments for Henderson Cycling Facility Project",
            icon: "fa-check"
          }
        ],
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
        keyDiscussions: [
          {
            id: 1,
            text: "Reviewed Carnarvon Park Master Plan implementation timeline",
            icon: "fa-comment"
          },
          {
            id: 2,
            text: "Discussed Uplands Sewer Separation Project phase completion",
            icon: "fa-comment"
          }
        ],
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
      const createdMeeting = await this.createMeeting(meeting);
      createdMeetings.push(createdMeeting);
    }
    
    // Create sample decisions
    const decisionsData: InsertDecision[] = [
      {
        meetingId: 1,
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
        meetingId: 1,
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
        meetingId: 2,
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
      await this.createDecision(decision);
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
      await this.createTopic(topic);
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
      await this.createNeighborhood(neighborhood);
    }
    
    // Create sample meeting discussions for the first meeting
    const meetingDiscussionsData: InsertMeetingDiscussion[] = [
      {
        meetingId: 1,
        speakerName: "Mayor Smith",
        speakerRole: "Mayor",
        speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "Good evening everyone. I'd like to call this Regular Council Meeting to order. We have a full agenda tonight, including the final discussion on the Official Community Plan updates and the Henderson Cycling Facility budget.",
        timestamp: "0:00:15",
        isDecision: false
      },
      {
        meetingId: 1,
        speakerName: "Councillor Johnson",
        speakerRole: "Councillor",
        speakerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "Thank you, Mayor. Before we begin, I'd like to request that we move item 5.3 regarding the Carnarvon Park timeline to the next Committee meeting, as we're awaiting the final report from our consultants.",
        timestamp: "0:01:22",
        isDecision: false
      },
      {
        meetingId: 1,
        speakerName: "Mayor Smith",
        speakerRole: "Mayor",
        speakerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80",
        text: "All in favor of approving the Official Community Plan updates as presented?",
        timestamp: "1:15:30",
        isDecision: true,
        decisionId: 1
      }
    ];
    
    for (const discussion of meetingDiscussionsData) {
      await this.createMeetingDiscussion(discussion);
    }
    
    // Create sample meeting key moments
    const keyMomentsData: InsertMeetingKeyMoment[] = [
      {
        meetingId: 1,
        title: "Official Community Plan Vote",
        timestamp: "1:15:32",
        description: "Motion approved 6-1"
      },
      {
        meetingId: 1,
        title: "Henderson Cycling Budget",
        timestamp: "1:42:18",
        description: "Amendment discussion"
      },
      {
        meetingId: 1,
        title: "Public Delegations",
        timestamp: "0:32:45",
        description: "4 speakers on housing"
      }
    ];
    
    for (const keyMoment of keyMomentsData) {
      await this.createMeetingKeyMoment(keyMoment);
    }
  }
}

// Initialize and export the database storage instead of MemStorage
// Initialize and export the database storage instead of MemStorage
export const storage = new DatabaseStorage();

// Initialize the database with sample data when the server starts
(async () => {
  try {
    await (storage as DatabaseStorage).initializeData();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
})();
