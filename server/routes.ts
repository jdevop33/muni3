import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { router as maxunRouter } from "./maxun-client";
import { router as multimodalRouter } from "./routes/multimodal";
import { log } from "./vite";
import { setupAuth, roleCheck } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Mount the API routers
  app.use('/api/maxun', maxunRouter);
  app.use('/api/multimodal', multimodalRouter);
  // API Routes
  // Dashboard stats
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const recentMeetings = await storage.getRecentMeetings();
      const allDecisions = await storage.getDecisions();
      const topics = await storage.getTopics();
      
      res.json({
        recentMeetings: recentMeetings.length,
        keyDecisions: allDecisions.length,
        activeTopics: topics.length,
        publicDelegations: 32 // For demo purposes
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
  });

  // Meetings
  app.get('/api/meetings', async (req: Request, res: Response) => {
    try {
      const meetings = await storage.getMeetings();
      res.json(meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      res.status(500).json({ message: 'Error fetching meetings' });
    }
  });

  app.get('/api/meetings/recent', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const meetings = await storage.getRecentMeetings(limit);
      res.json(meetings);
    } catch (error) {
      console.error('Error fetching recent meetings:', error);
      res.status(500).json({ message: 'Error fetching recent meetings' });
    }
  });

  app.get('/api/meetings/upcoming', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const meetings = await storage.getUpcomingMeetings(limit);
      res.json(meetings);
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      res.status(500).json({ message: 'Error fetching upcoming meetings' });
    }
  });

  app.get('/api/meetings/:id', async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const meeting = await storage.getMeeting(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
      
      res.json(meeting);
    } catch (error) {
      console.error(`Error fetching meeting ${req.params.id}:`, error);
      res.status(500).json({ message: `Error fetching meeting ${req.params.id}` });
    }
  });

  // Filter meetings by type
  app.get('/api/meetings', async (req: Request, res: Response) => {
    try {
      const filterType = req.query.type as string;
      
      if (filterType && filterType !== 'all') {
        const meetings = await storage.getMeetingsByType(filterType);
        return res.json(meetings);
      }
      
      const meetings = await storage.getMeetings();
      res.json(meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      res.status(500).json({ message: 'Error fetching meetings' });
    }
  });

  // Meeting discussions
  app.get('/api/meetings/:id/discussions', async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const discussions = await storage.getMeetingDiscussions(meetingId);
      res.json(discussions);
    } catch (error) {
      console.error(`Error fetching meeting discussions for meeting ${req.params.id}:`, error);
      res.status(500).json({ message: `Error fetching meeting discussions for meeting ${req.params.id}` });
    }
  });

  // Meeting key moments
  app.get('/api/meetings/:id/key-moments', async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const keyMoments = await storage.getMeetingKeyMoments(meetingId);
      res.json(keyMoments);
    } catch (error) {
      console.error(`Error fetching key moments for meeting ${req.params.id}:`, error);
      res.status(500).json({ message: `Error fetching key moments for meeting ${req.params.id}` });
    }
  });

  // Decisions
  app.get('/api/decisions', async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      
      if (status) {
        const decisions = await storage.getDecisionsByStatus(status);
        return res.json(decisions);
      }
      
      const decisions = await storage.getDecisions();
      res.json(decisions);
    } catch (error) {
      console.error('Error fetching decisions:', error);
      res.status(500).json({ message: 'Error fetching decisions' });
    }
  });

  app.get('/api/decisions/recent', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const decisions = await storage.getRecentDecisions(limit);
      res.json(decisions);
    } catch (error) {
      console.error('Error fetching recent decisions:', error);
      res.status(500).json({ message: 'Error fetching recent decisions' });
    }
  });

  app.get('/api/decisions/:id', async (req: Request, res: Response) => {
    try {
      const decisionId = parseInt(req.params.id);
      const decision = await storage.getDecision(decisionId);
      
      if (!decision) {
        return res.status(404).json({ message: 'Decision not found' });
      }
      
      res.json(decision);
    } catch (error) {
      console.error(`Error fetching decision ${req.params.id}:`, error);
      res.status(500).json({ message: `Error fetching decision ${req.params.id}` });
    }
  });

  app.get('/api/meetings/:id/decisions', async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const decisions = await storage.getDecisionsByMeeting(meetingId);
      res.json(decisions);
    } catch (error) {
      console.error(`Error fetching decisions for meeting ${req.params.id}:`, error);
      res.status(500).json({ message: `Error fetching decisions for meeting ${req.params.id}` });
    }
  });

  // Topics
  app.get('/api/topics', async (req: Request, res: Response) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      res.status(500).json({ message: 'Error fetching topics' });
    }
  });

  app.get('/api/topics/popular', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const topics = await storage.getPopularTopics(limit);
      res.json(topics);
    } catch (error) {
      console.error('Error fetching popular topics:', error);
      res.status(500).json({ message: 'Error fetching popular topics' });
    }
  });

  app.get('/api/topics/:name', async (req: Request, res: Response) => {
    try {
      const topicName = req.params.name;
      const topic = await storage.getTopicByName(topicName);
      
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
      
      res.json(topic);
    } catch (error) {
      console.error(`Error fetching topic ${req.params.name}:`, error);
      res.status(500).json({ message: `Error fetching topic ${req.params.name}` });
    }
  });

  // Return meetings related to a specific topic
  app.get('/api/topics/:name/meetings', async (req: Request, res: Response) => {
    try {
      const topicName = req.params.name;
      const meetings = await storage.getMeetings();
      
      // Filter meetings that have this topic
      const relatedMeetings = meetings.filter(meeting => 
        meeting.topics && meeting.topics.some(topic => topic.toLowerCase() === topicName.toLowerCase())
      );
      
      res.json(relatedMeetings);
    } catch (error) {
      console.error(`Error fetching meetings for topic ${req.params.name}:`, error);
      res.status(500).json({ message: `Error fetching meetings for topic ${req.params.name}` });
    }
  });

  // Neighborhoods
  app.get('/api/neighborhoods', async (req: Request, res: Response) => {
    try {
      const neighborhoods = await storage.getNeighborhoods();
      res.json(neighborhoods);
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      res.status(500).json({ message: 'Error fetching neighborhoods' });
    }
  });

  app.get('/api/neighborhoods/:id', async (req: Request, res: Response) => {
    try {
      const neighborhoodId = parseInt(req.params.id);
      const neighborhood = await storage.getNeighborhood(neighborhoodId);
      
      if (!neighborhood) {
        return res.status(404).json({ message: 'Neighborhood not found' });
      }
      
      res.json(neighborhood);
    } catch (error) {
      console.error(`Error fetching neighborhood ${req.params.id}:`, error);
      res.status(500).json({ message: `Error fetching neighborhood ${req.params.id}` });
    }
  });

  // Direct data upload routes - protected for staff/admin
  app.post('/api/meetings/upload', roleCheck(['admin', 'staff']), async (req: Request, res: Response) => {
    try {
      const { data } = req.body;
      
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array of meetings.' });
      }
      
      const results = [];
      
      for (const meetingData of data) {
        try {
          // Ensure dates are properly parsed
          if (typeof meetingData.date === 'string') {
            meetingData.date = new Date(meetingData.date);
          }
          
          // Ensure required fields are present
          if (!meetingData.topics) {
            meetingData.topics = [];
          }
          
          const meeting = await storage.createMeeting(meetingData);
          results.push(meeting);
        } catch (err) {
          console.error(`Error creating meeting:`, err);
        }
      }
      
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error('Failed to upload meetings data:', error);
      res.status(500).json({ error: 'Failed to upload meetings data' });
    }
  });

  app.post('/api/decisions/upload', roleCheck(['admin', 'staff']), async (req: Request, res: Response) => {
    try {
      const { data } = req.body;
      
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array of decisions.' });
      }
      
      const results = [];
      
      for (const decisionData of data) {
        try {
          // Ensure dates are properly parsed
          if (typeof decisionData.date === 'string') {
            decisionData.date = new Date(decisionData.date);
          }
          
          // Ensure required fields are present
          if (!decisionData.topics) {
            decisionData.topics = [];
          }
          
          const decision = await storage.createDecision(decisionData);
          results.push(decision);
        } catch (err) {
          console.error(`Error creating decision:`, err);
        }
      }
      
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error('Failed to upload decisions data:', error);
      res.status(500).json({ error: 'Failed to upload decisions data' });
    }
  });

  app.post('/api/topics/upload', roleCheck(['admin', 'staff']), async (req: Request, res: Response) => {
    try {
      const { data } = req.body;
      
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array of topics.' });
      }
      
      const results = [];
      
      for (const topicData of data) {
        try {
          // Ensure dates are properly parsed
          if (typeof topicData.lastDiscussed === 'string') {
            topicData.lastDiscussed = new Date(topicData.lastDiscussed);
          }
          
          const topic = await storage.createTopic(topicData);
          results.push(topic);
        } catch (err) {
          console.error(`Error creating topic:`, err);
        }
      }
      
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error('Failed to upload topics data:', error);
      res.status(500).json({ error: 'Failed to upload topics data' });
    }
  });

  // Documentation upload route - protected for staff/admin
  app.post('/api/documents/upload', roleCheck(['admin', 'staff']), async (req: Request, res: Response) => {
    try {
      const { documentType, meetingId, content, title } = req.body;
      
      if (!documentType || !content) {
        return res.status(400).json({ error: 'Missing required fields: documentType and content are required' });
      }
      
      // This is a placeholder for actual document processing
      // In a real implementation, we would process and store the document
      // For now, we'll just acknowledge receipt
      
      res.json({ 
        success: true, 
        message: `Document received: ${title || 'Untitled'} (${documentType})`,
        documentId: Date.now().toString() 
      });
    } catch (error) {
      console.error('Failed to process document upload:', error);
      res.status(500).json({ error: 'Failed to process document upload' });
    }
  });

  // User management routes (admin only)
  app.get('/api/users', roleCheck(['admin']), async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      
      // Remove sensitive info (passwords) from response
      const sanitizedUsers = users.map(user => {
        const userWithoutPassword = { ...user } as any;
        if (userWithoutPassword.password) {
          delete userWithoutPassword.password;
        }
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  app.patch('/api/users/:id', roleCheck(['admin']), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Prevent password updates through this endpoint
      if (userData.password) {
        delete (userData as any).password;
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const userWithoutPassword: any = { ...updatedUser };
      if (userWithoutPassword.password) {
        delete userWithoutPassword.password;
      }
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(`Failed to update user ${req.params.id}:`, error);
      res.status(500).json({ error: `Failed to update user ${req.params.id}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
