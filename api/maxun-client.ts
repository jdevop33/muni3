/**
 * Maxun API Client for CouncilInsight
 * 
 * This module provides functionality to interact with a Maxun instance for web scraping
 * municipal council meeting data from the Oak Bay website.
 */

import axios from 'axios';
import { Router } from 'express';
import { storage } from "./storage.js"; // Use .js extension
import { db } from "./db.js"; // Use .js extension
import { meetings, decisions, topics } from "../shared/schema.js"; // Use relative path and .js extension
import { insertMeetingSchema, insertDecisionSchema, insertTopicSchema } from "../shared/schema.js"; // Use relative path and .js extension
import { eq, sql } from 'drizzle-orm';
// import { log } from "./vite.js"; // REMOVED - Vite/dev server logic not needed in API

interface MaxunConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  authMethod: 'apiKey' | 'credentials';
}

interface MaxunRobot {
  id: string;
  name: string;
  url: string;
  status: string;
  lastRun?: Date;
  params?: Record<string, any>;
}

interface MaxunRobotResult {
  id: string;
  robotId: string;
  status: string;
  data: any[];
  startedAt: Date;
  finishedAt?: Date;
}

/**
 * MaxunClient provides methods to interact with a Maxun instance
 */
export class MaxunClient {
  private config: MaxunConfig;
  private token: string | null = null;
  private axiosInstance: any;

  constructor(config: MaxunConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * Authenticate with the Maxun API
   */
  async authenticate(): Promise<boolean> {
    try {
      // If API key is provided, use it
      if (this.config.authMethod === 'apiKey' && this.config.apiKey) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.config.apiKey}`;
        console.log('Using API key for Maxun authentication', 'maxun'); // Use console.log
        return true;
      } 
      // Otherwise, use username/password
      else if (this.config.authMethod === 'credentials') {
        if (!this.config.username || !this.config.password) {
          throw new Error('Username and password are required for Maxun credential authentication');
        }

        const response = await this.axiosInstance.post('/api/auth/login', {
          email: this.config.username,
          password: this.config.password
        });

        if (response.data && response.data.token) {
          this.token = response.data.token;
          this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
          console.log('Authenticated with Maxun API using credentials', 'maxun'); // Use console.log
          return true;
        }
      } else {
        throw new Error('No valid authentication method provided for Maxun');
      }
      
      return false;
    } catch (error) {
      console.error(`Error authenticating with Maxun: ${error}`, 'maxun'); // Use console.error
      return false;
    }
  }

  /**
   * Get a list of robots from Maxun
   */
  async getRobots(): Promise<MaxunRobot[]> {
    try {
      if (!this.token) {
        await this.authenticate();
      }

      const response = await this.axiosInstance.get('/api/robots');
      return response.data.robots || [];
    } catch (error) {
      console.error(`Error getting robots from Maxun: ${error}`, 'maxun'); // Use console.error
      return [];
    }
  }

  /**
   * Get a specific robot from Maxun
   */
  async getRobot(robotId: string): Promise<MaxunRobot | null> {
    try {
      if (!this.token) {
        await this.authenticate();
      }

      const response = await this.axiosInstance.get(`/api/robots/${robotId}`);
      return response.data.robot || null;
    } catch (error) {
      console.error(`Error getting robot from Maxun: ${error}`, 'maxun'); // Use console.error
      return null;
    }
  }

  /**
   * Run a robot to extract data
   */
  async runRobot(robotId: string, params?: Record<string, any>): Promise<string> {
    try {
      if (!this.token) {
        await this.authenticate();
      }

      const response = await this.axiosInstance.post(`/api/robots/${robotId}/run`, { params });
      return response.data.jobId || '';
    } catch (error) {
      console.error(`Error running robot from Maxun: ${error}`, 'maxun'); // Use console.error
      return '';
    }
  }

  /**
   * Get the results of a robot run
   */
  async getRobotResults(jobId: string): Promise<MaxunRobotResult | null> {
    try {
      if (!this.token) {
        await this.authenticate();
      }

      const response = await this.axiosInstance.get(`/api/jobs/${jobId}`);
      return response.data.job || null;
    } catch (error) {
      console.error(`Error getting robot results from Maxun: ${error}`, 'maxun'); // Use console.error
      return null;
    }
  }

  /**
   * Process meeting data from Maxun and store it in our database
   */
  async processMeetingData(data: any[]): Promise<void> {
    try {
      for (const item of data) {
        // Example transformation of Maxun scraped data to our schema
        const meetingData = {
          title: item.title,
          type: item.meetingType || 'Regular Council Meeting',
          date: new Date(item.date),
          startTime: item.startTime || '19:00',
          duration: item.duration || '',
          status: item.status || 'Scheduled',
          topics: item.topics || [],
          participants: item.participants || 0,
          hasVideo: item.hasVideo || false,
          hasTranscript: item.hasTranscript || false,
          hasMinutes: item.hasMinutes || false,
        };

        // Check if meeting already exists
        const existingMeetings = await db.select()
          .from(meetings)
          .where(
            sql`${meetings.title} = ${meetingData.title} AND 
                ${meetings.date} = ${meetingData.date}`
          );

        if (existingMeetings.length === 0) {
          // Create new meeting
          await db.insert(meetings).values(meetingData);
          console.log(`Added new meeting: ${meetingData.title}`, 'maxun'); // Use console.log
        } else {
          // Update existing meeting
          await db.update(meetings)
            .set(meetingData)
            .where(eq(meetings.id, existingMeetings[0].id));
          console.log(`Updated meeting: ${meetingData.title}`, 'maxun'); // Use console.log
        }

        // Process any decisions from the meeting
        if (item.decisions && Array.isArray(item.decisions)) {
          for (const decision of item.decisions) {
            await this.processDecisionData(decision, existingMeetings[0]?.id);
          }
        }

        // Process any topics from the meeting
        if (item.topics && Array.isArray(item.topics)) {
          for (const topicName of item.topics) {
            await this.processTopicData(topicName);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing meeting data: ${error}`, 'maxun'); // Use console.error
    }
  }

  /**
   * Process decision data from Maxun and store it in our database
   */
  private async processDecisionData(decisionData: any, meetingId: number): Promise<void> {
    try {
      const decision = {
        meetingId,
        title: decisionData.title,
        description: decisionData.description,
        date: new Date(decisionData.date),
        meeting: decisionData.meeting || '',
        meetingType: decisionData.meetingType || '',
        topics: decisionData.topics || [],
        votesFor: decisionData.votesFor || null,
        votesAgainst: decisionData.votesAgainst || null,
        status: decisionData.status || 'Approved',
        type: decisionData.type || 'Motion',
      };

      // Check if decision already exists
      const existingDecisions = await db.select()
        .from(decisions)
        .where(
          sql`${decisions.title} = ${decision.title} AND 
              ${decisions.meetingId} = ${meetingId}`
        );

      if (existingDecisions.length === 0) {
        // Create new decision
        await db.insert(decisions).values(decision);
        console.log(`Added new decision: ${decision.title}`, 'maxun'); // Use console.log
      } else {
        // Update existing decision
        await db.update(decisions)
          .set(decision)
          .where(eq(decisions.id, existingDecisions[0].id));
        console.log(`Updated decision: ${decision.title}`, 'maxun'); // Use console.log
      }
    } catch (error) {
      console.error(`Error processing decision data: ${error}`, 'maxun'); // Use console.error
    }
  }

  /**
   * Process topic data from Maxun and store it in our database
   */
  private async processTopicData(topicName: string): Promise<void> {
    try {
      // Check if topic already exists
      const existingTopics = await db.select()
        .from(topics)
        .where(sql`${topics.name} = ${topicName}`);

      if (existingTopics.length === 0) {
        // Create new topic
        await db.insert(topics).values({
          name: topicName,
          count: 1,
          lastDiscussed: new Date(),
        });
        console.log(`Added new topic: ${topicName}`, 'maxun'); // Use console.log
      } else {
        // Update existing topic - increment count
        await db.update(topics)
          .set({
            count: existingTopics[0].count + 1,
            lastDiscussed: new Date(),
          })
          .where(eq(topics.id, existingTopics[0].id));
        console.log(`Updated topic: ${topicName}`, 'maxun'); // Use console.log
      }
    } catch (error) {
      console.error(`Error processing topic data: ${error}`, 'maxun'); // Use console.error
    }
  }
}

// Create a router for Maxun-related endpoints
export const router = Router();

// Instantiate the client with environment variables
const maxunClient = new MaxunClient({
  baseUrl: process.env.VITE_MAXUN_URL || process.env.MAXUN_URL || 'http://localhost:8080',
  apiKey: process.env.MAXUN_API_KEY,
  username: process.env.MAXUN_USERNAME,
  password: process.env.MAXUN_PASSWORD,
  // Use API key if available, otherwise fall back to credentials
  authMethod: process.env.MAXUN_API_KEY ? 'apiKey' : 'credentials',
});

/**
 * Get a list of Maxun robots
 */
router.get('/robots', async (req, res) => {
  try {
    const robots = await maxunClient.getRobots();
    res.json({ robots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch robots' });
  }
});

/**
 * Run a Maxun robot
 */
router.post('/robots/:id/run', async (req, res) => {
  try {
    const jobId = await maxunClient.runRobot(req.params.id, req.body.params);
    if (!jobId) {
      return res.status(400).json({ error: 'Failed to run robot' });
    }
    res.json({ jobId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run robot' });
  }
});

/**
 * Get robot job results
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const result = await maxunClient.getRobotResults(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ job: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job results' });
  }
});

/**
 * Sync robot data to our database
 */
router.post('/sync/:id', async (req, res) => {
  try {
    const result = await maxunClient.getRobotResults(req.params.id);
    if (!result || result.status !== 'completed') {
      return res.status(400).json({ error: 'Job not completed or not found' });
    }
    
    await maxunClient.processMeetingData(result.data);
    res.json({ success: true, message: 'Data synchronized successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

// Export the router and client
export default { router, maxunClient };