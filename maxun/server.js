const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { Pool } = require('pg');
const { Storage } = require('@google-cloud/storage');
const adaptiveScraperRoutes = require('./api-routes');

// Initialize Express app
const app = express();
app.use(express.json());

// Configure environment variables
require('dotenv').config();

// Check for the Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (GEMINI_API_KEY) {
  console.log('Gemini API key detected, adaptive scraping enabled');
} else {
  console.log('No Gemini API key found. To enable adaptive scraping, set GEMINI_API_KEY environment variable');
}

// Enable CORS for Vercel frontend
app.use((req, res, next) => {
  // Replace with your actual Vercel app URL in production
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.ALLOWED_ORIGIN
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Database connection
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for some PostgreSQL providers like Neon
    }
  });
  
  // Test database connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Database connected successfully, server time:', res.rows[0].now);
    }
  });
}

// Initialize Google Cloud Storage (if configured)
let storage;
let bucket;
if (process.env.GCS_BUCKET_NAME) {
  storage = new Storage();
  bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  console.log(`GCS bucket '${process.env.GCS_BUCKET_NAME}' configured`);
}

// Robot management
const robotsDir = path.join(__dirname, 'robots');
const robots = {};

// Load robots from directory
function loadRobots() {
  if (!fs.existsSync(robotsDir)) {
    fs.mkdirSync(robotsDir, { recursive: true });
    console.log('Created robots directory');
    return;
  }
  
  try {
    const files = fs.readdirSync(robotsDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const robotId = file.replace('.js', '');
        const robotPath = path.join(robotsDir, file);
        try {
          delete require.cache[require.resolve(robotPath)]; // Clear cache
          const robot = require(robotPath);
          robots[robotId] = robot;
          console.log(`Loaded robot: ${robotId}`);
        } catch (error) {
          console.error(`Error loading robot ${robotId}:`, error);
        }
      }
    });
    console.log(`Loaded ${Object.keys(robots).length} robots`);
  } catch (error) {
    console.error('Error loading robots:', error);
  }
}

// Load robots initially
loadRobots();

// Store running jobs
const jobs = {};

// Sample robot for testing if none exists
if (Object.keys(robots).length === 0) {
  const sampleRobotPath = path.join(robotsDir, 'sample-council-robot.js');
  const sampleRobotContent = `module.exports = {
  name: "Sample Council Meeting Robot",
  description: "Demo robot that shows council meeting extraction",
  version: "1.0.0",
  url: "https://example.org/council-meetings",
  
  async run(page, context) {
    await page.goto(this.url);
    console.log("Running sample robot...");
    
    // This is a mock response for demonstration
    return [
      {
        title: "Regular Council Meeting",
        date: new Date().toISOString(),
        type: "Regular",
        status: "Completed",
        topics: ["Budget", "Infrastructure", "Parks"]
      }
    ];
  }
};`;

  fs.writeFileSync(sampleRobotPath, sampleRobotContent);
  console.log('Created sample robot for demonstration');
  loadRobots(); // Reload robots
}

// Utility to store results in Google Cloud Storage
async function storeResultsInGCS(jobId, results) {
  if (!bucket) return null;
  
  try {
    const file = bucket.file(`results/${jobId}.json`);
    await file.save(JSON.stringify(results), {
      contentType: 'application/json',
    });
    return `gs://${bucket.name}/results/${jobId}.json`;
  } catch (error) {
    console.error('Error storing results in GCS:', error);
    return null;
  }
}

// API endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    features: {
      robots: true,
      adaptiveScraping: !!GEMINI_API_KEY
    }
  });
});

// Register adaptive scraper routes if Gemini API key is available
if (GEMINI_API_KEY) {
  app.use('/api/adaptive', adaptiveScraperRoutes);
}

// List available robots
app.get('/api/maxun/robots', (req, res) => {
  const robotList = Object.entries(robots).map(([id, robot]) => ({
    id,
    name: robot.name || id,
    description: robot.description || '',
    url: robot.url || '',
    version: robot.version || '1.0.0'
  }));
  
  res.json(robotList);
});

// Get robot details
app.get('/api/maxun/robots/:id', (req, res) => {
  const { id } = req.params;
  const robot = robots[id];
  
  if (!robot) {
    return res.status(404).json({ error: 'Robot not found' });
  }
  
  res.json({
    id,
    name: robot.name || id,
    description: robot.description || '',
    url: robot.url || '',
    version: robot.version || '1.0.0'
  });
});

// Run a robot
app.post('/api/maxun/robots/:id/run', async (req, res) => {
  const { id } = req.params;
  const robot = robots[id];
  
  if (!robot) {
    return res.status(404).json({ error: 'Robot not found' });
  }
  
  try {
    const jobId = `${id}-${Date.now()}`;
    
    // Start job in the background
    jobs[jobId] = {
      id: jobId,
      robotId: id,
      status: 'running',
      startedAt: new Date(),
      data: null
    };
    
    // Respond immediately with job ID
    res.json({ jobId, status: 'running' });
    
    // Run the robot in background
    runRobot(jobId, robot, req.body.params);
    
  } catch (error) {
    console.error(`Error running robot ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get job status and results
app.get('/api/maxun/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = jobs[id];
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  // Don't include full data in response if it's large
  const responseJob = {...job};
  if (job.data && job.data.length > 0 && job.gcsUrl) {
    responseJob.data = `Data stored in GCS: ${job.gcsUrl}`;
  }
  
  res.json(responseJob);
});

// Get job results data
app.get('/api/maxun/jobs/:id/data', (req, res) => {
  const { id } = req.params;
  const job = jobs[id];
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Job not completed yet' });
  }
  
  if (!job.data) {
    return res.status(404).json({ error: 'No data available for this job' });
  }
  
  res.json(job.data);
});

// Sync data to database
app.post('/api/maxun/sync', async (req, res) => {
  const { jobId } = req.body;
  
  if (!jobId) {
    return res.status(400).json({ error: 'jobId is required' });
  }
  
  const job = jobs[jobId];
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Job not completed yet' });
  }
  
  if (!job.data) {
    return res.status(404).json({ error: 'No data available for this job' });
  }
  
  try {
    await syncToDatabase(job);
    res.json({ success: true, message: 'Data synced to database successfully' });
  } catch (error) {
    console.error('Error syncing data to database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to run a robot
async function runRobot(jobId, robot, params = {}) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set default viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set default timeout (5 minutes)
    page.setDefaultTimeout(300000);
    
    // Run the robot
    console.log(`Running robot for job ${jobId}...`);
    const context = { params };
    const results = await robot.run(page, context);
    
    // Store results
    jobs[jobId].status = 'completed';
    jobs[jobId].finishedAt = new Date();
    jobs[jobId].data = results;
    
    // Store in GCS if configured
    if (bucket) {
      const gcsUrl = await storeResultsInGCS(jobId, results);
      if (gcsUrl) {
        jobs[jobId].gcsUrl = gcsUrl;
      }
    }
    
    console.log(`Job ${jobId} completed successfully`);
    
  } catch (error) {
    console.error(`Error in job ${jobId}:`, error);
    jobs[jobId].status = 'failed';
    jobs[jobId].error = error.message;
    jobs[jobId].finishedAt = new Date();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Sync data to database
async function syncToDatabase(job) {
  if (!pool) {
    throw new Error('Database not configured');
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const item of job.data) {
      // Determine what type of data this is and insert accordingly
      if (item.title && item.date && item.type) {
        // Looks like a meeting
        const result = await client.query(
          `INSERT INTO meetings (title, date, type, status, start_time, duration)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            item.title,
            new Date(item.date),
            item.type,
            item.status || 'Scheduled',
            item.startTime || '19:00',
            item.duration || '2 hours'
          ]
        );
        
        const meetingId = result.rows[0].id;
        console.log(`Inserted meeting with ID ${meetingId}`);
        
        // Insert topics if available
        if (item.topics && Array.isArray(item.topics)) {
          for (const topicName of item.topics) {
            // Check if topic exists
            const topicResult = await client.query(
              `SELECT id FROM topics WHERE name = $1`,
              [topicName]
            );
            
            let topicId;
            if (topicResult.rows.length > 0) {
              topicId = topicResult.rows[0].id;
            } else {
              // Create new topic
              const newTopicResult = await client.query(
                `INSERT INTO topics (name, count) VALUES ($1, $2) RETURNING id`,
                [topicName, 1]
              );
              topicId = newTopicResult.rows[0].id;
            }
            
            // Create meeting-topic relationship (if you have such a table)
            // This is just an example, adjust based on your actual schema
            try {
              await client.query(
                `INSERT INTO meeting_topics (meeting_id, topic_id) VALUES ($1, $2)`,
                [meetingId, topicId]
              );
            } catch (e) {
              // If meeting_topics table doesn't exist, just log and continue
              console.log('Note: meeting_topics table might not exist');
            }
          }
        }
      } else if (item.meetingId && item.title && item.description) {
        // Looks like a decision
        await client.query(
          `INSERT INTO decisions (title, meeting_id, description, status, type, date)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            item.title,
            item.meetingId,
            item.description,
            item.status || 'Approved',
            item.type || 'Resolution',
            new Date(item.date || new Date())
          ]
        );
      }
      
      // Add more data types as needed
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Maxun service running on port ${PORT}`);
});