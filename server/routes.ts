import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
        meeting.topics.some(topic => topic.toLowerCase() === topicName.toLowerCase())
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

  const httpServer = createServer(app);
  return httpServer;
}
