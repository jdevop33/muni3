const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// Use puppeteer-extra to apply stealth plugin
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Pool } = require('pg');
const { Storage } = require('@google-cloud/storage');
const adaptiveScraperRoutes = require('./api-routes.js');

// Apply the stealth plugin
puppeteer.use(StealthPlugin());

// Initialize Express app
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Database Configuration ---
let pool;
try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon DB connections
    }
  });

  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error', err.stack);
    } else {
      console.log('Database connected successfully, server time:', res.rows[0].now);
    }
  });
} catch (error) {
  console.error("Failed to create database pool:", error);
  // Exit if DB connection fails?
  process.exit(1);
}

// --- GCS Configuration ---
let storage;
let bucket;
const bucketName = process.env.GCS_BUCKET_NAME;
try {
  if (bucketName) {
    storage = new Storage();
    bucket = storage.bucket(bucketName);
    console.log(`GCS bucket '${bucketName}' configured`);
  } else {
    console.warn('GCS_BUCKET_NAME not set, screenshot uploads will be disabled.');
  }
} catch (error) {
  console.error("Failed to configure GCS:", error);
}

// --- Gemini Configuration ---
let geminiAssistant = null; // Initialize as null
function getGeminiAssistant() { // Lazy initialization
  if (geminiAssistant) return geminiAssistant;
  try {
    const { createGeminiAssistant } = require('./gemini-integration.js');
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      geminiAssistant = createGeminiAssistant(geminiApiKey);
      console.log('Gemini Assistant Initialized.');
      return geminiAssistant;
    } else {
      console.log('No Gemini API key found in env vars. Adaptive scraping disabled.');
      return null;
    }
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.warn("Optional @google/genai module not found, adaptive scraping disabled.");
    } else {
        console.error("Error initializing Gemini Assistant:", error);
    }
    return null;
  }
}
// Make assistant available via app.locals if needed, but initialize lazily
app.locals.getGeminiAssistant = getGeminiAssistant;

// --- Robot Loading (Replace with dynamic loading if needed) ---
let robots = {};
try {
  const oakBayRobot = require('./robots/oakbay-council-robot.js');
  robots['oakbay-council-robot'] = oakBayRobot;
  console.log('Loaded robot: oakbay-council-robot');
  console.log(`Loaded ${Object.keys(robots).length} robots`);
} catch (error) {
  console.error("Error loading robots:", error);
}

// --- Job Management ---
const jobs = {}; // In-memory job store (replace with persistent store like Redis/DB for production)

async function runRobot(jobId, robot, params = {}) {
  let browser;
  try {
    console.log(`Launching Puppeteer-Extra for job ${jobId}`); // Updated log
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable', // Explicit path
      headless: 'new',
      timeout: 120000, // Increased browser launch timeout
      protocolTimeout: 240000, // Increased protocol timeout
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Often needed in containers
        '--disable-gpu'
      ]
    });
    console.log(`Puppeteer-Extra launched for job ${jobId}`); // Updated log

    const page = await browser.newPage();
    console.log(`New page created for job ${jobId}`);

    // Set default viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Set default navigation/action timeout (10 minutes)
    page.setDefaultTimeout(600000);

    // Run the robot
    console.log(`Running robot for job ${jobId}...`);
    const robotFunction = typeof robot === 'function' ? robot : robot.run; // Adapt if needed
    const results = await robotFunction(page, params);
    console.log(`Robot for job ${jobId} finished execution.`);

    // Store results and mark as completed
    jobs[jobId].status = 'completed';
    jobs[jobId].data = results;
    jobs[jobId].finishedAt = new Date();
    console.log(`Job ${jobId} completed successfully`);

    // Sync data to DB asynchronously
    if (results && Array.isArray(results) && results.length > 0) { // Added Array check
      syncDataToDB(jobs[jobId]).catch(syncError => {
          console.error(`Error syncing data for job ${jobId} after completion:`, syncError);
      });
    } else {
        console.log(`No results to sync for job ${jobId}`);
    }

  } catch (error) {
    console.error(`Error in job ${jobId}:`, error); // Log the full error
    jobs[jobId].status = 'failed';
    jobs[jobId].error = error.message; // Store only message for status
    jobs[jobId].finishedAt = new Date();

    // Attempt screenshot even on failure
    if (page) {
      try {
         const screenshotPath = `/tmp/error_screenshot_${Date.now()}.png`; // Use /tmp for Cloud Run
         await page.screenshot({ path: screenshotPath, fullPage: true });
         console.log(`Error screenshot saved to ${screenshotPath} (Note: /tmp is ephemeral)`);
      } catch (screenshotError) {
         console.error("Failed to take error screenshot:", screenshotError);
      }
    }

  } finally {
    if (browser) {
      console.log(`Closing browser for job ${jobId}`);
      await browser.close();
      console.log(`Browser closed for job ${jobId}`);
    }
  }
}

async function syncDataToDB(job) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log(`Syncing data for job ${job.id}...`);
    let insertedMeetings = 0;
    let insertedDecisions = 0;
    let insertedTopics = 0;

    if (!Array.isArray(job.data)) {
      console.warn(`Job ${job.id} data is not an array, skipping DB sync.`);
      await client.query('ROLLBACK'); // Rollback if data is invalid
      return;
    }

    for (const item of job.data) {
      // Determine what type of data this is and insert accordingly
      // Simple check based on expected properties
      if (item && item.title && item.date && item.type) { // Meeting check
        const result = await client.query(
          `INSERT INTO meetings (title, date, type, status, start_time, duration, topics, participants, has_video, has_transcript, has_minutes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (title, date) DO UPDATE SET
             type = EXCLUDED.type,
             status = EXCLUDED.status,
             start_time = EXCLUDED.start_time,
             duration = EXCLUDED.duration,
             topics = EXCLUDED.topics,
             participants = EXCLUDED.participants,
             has_video = EXCLUDED.has_video,
             has_transcript = EXCLUDED.has_transcript,
             has_minutes = EXCLUDED.has_minutes
           RETURNING id`, // Update existing meetings
          [
            item.title,
            new Date(item.date),
            item.type,
            item.status || 'Scheduled',
            item.startTime || '19:00',
            item.duration || '2 hours',
            JSON.stringify(item.topics || []), // Store topics as JSON array
            item.participants || null,
            item.hasVideo || false,
            item.hasTranscript || false,
            item.hasMinutes || false
          ]
        );
         const meetingId = result.rows[0].id;
         insertedMeetings++;
         // console.log(`Inserted/Updated meeting with ID ${meetingId}`);
         // Insert/Update topics
         if (item.topics && Array.isArray(item.topics)) {
           for (const topicName of item.topics) {
                const topicResult = await client.query(
                  `INSERT INTO topics (name, count, last_discussed)
                   VALUES ($1, 1, NOW())
                   ON CONFLICT (name) DO UPDATE SET
                     count = topics.count + 1,
                     last_discussed = NOW()
                   RETURNING id`,
                  [topicName]
                );
                if (topicResult.rows.length > 0) {
                    insertedTopics++; // Count insert/update
                }
                // Link meeting and topic (assuming meeting_topics table exists)
                // try {
                //     await client.query(
                //       `INSERT INTO meeting_topics (meeting_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                //       [meetingId, topicResult.rows[0].id]
                //     );
                // } catch (e) { console.warn('Skipping meeting_topics link'); }
           }
         }
      } else if (item && item.meetingId && item.title && item.description) { // Decision check
           const result = await client.query(
             `INSERT INTO decisions (title, meeting_id, description, status, type, date, topics, votes_for, votes_against, meeting, meeting_type)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (title, meeting_id) DO UPDATE SET
                description = EXCLUDED.description,
                status = EXCLUDED.status,
                type = EXCLUDED.type,
                date = EXCLUDED.date,
                topics = EXCLUDED.topics,
                votes_for = EXCLUDED.votes_for,
                votes_against = EXCLUDED.votes_against,
                meeting = EXCLUDED.meeting,
                meeting_type = EXCLUDED.meeting_type
              RETURNING id`,
             [
               item.title,
               item.meetingId,
               item.description,
               item.status || 'Approved',
               item.type || 'Resolution',
               new Date(item.date || new Date()),
               JSON.stringify(item.topics || []),
               item.votesFor || null,
               item.votesAgainst || null,
               item.meeting || null,
               item.meetingType || null
             ]
           );
           if (result.rows.length > 0) {
               insertedDecisions++;
               // console.log(`Inserted/Updated decision with ID ${result.rows[0].id}`);
           }
      }
    }
    console.log(`Sync complete for job ${job.id}: ${insertedMeetings} meetings, ${insertedDecisions} decisions, ${insertedTopics} topics processed.`);
    await client.query('COMMIT');
  } catch (error) {
    console.error(`ROLLBACK due to error during sync for job ${job.id}:`, error);
    await client.query('ROLLBACK');
    // Optionally update job status to reflect sync failure
    if (jobs[job.id]) jobs[job.id].error = "DB Sync Failed: " + error.message;
    // Do not re-throw here to allow the main job status to remain 'completed' or 'failed' based on scraping
  } finally {
    client.release();
  }
}


// --- API Routes ---
// Mount adaptive scraper routes (analyze-website, extract-data, configs)
app.use('/api', adaptiveScraperRoutes);

// Define routes for pre-defined robots and job status
const maxunRouter = express.Router();

// List available robots
maxunRouter.get('/robots', (req, res) => {
  const robotList = Object.keys(robots).map(id => ({ id, description: robots[id].description || 'No description' }));
  res.json({ robots: robotList });
});

// Run a specific robot
maxunRouter.post('/robots/:robotId/run', (req, res) => {
  const { robotId } = req.params;
  const robot = robots[robotId];

  if (!robot) {
    return res.status(404).json({ error: 'Robot not found' });
  }

  const jobId = `${robotId}-${Date.now()}`;
  jobs[jobId] = { id: jobId, robotId, status: 'pending', createdAt: new Date() };

  // Run the robot asynchronously (don't wait for it to finish)
  runRobot(jobId, robot, req.body.params);

  // Return immediately with job ID
  res.status(200).json({ jobId, status: 'running' }); 
});

// Get job status and results
maxunRouter.get('/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Optionally remove sensitive data before sending?
  const { data, ...jobStatus } = job;
  if (job.status === 'completed') {
      res.json({ ...jobStatus, data }); // Send data if completed
  } else {
      res.json(jobStatus);
  }
});

// Mount the maxun robot routes under /api/maxun
app.use('/api/maxun', maxunRouter);

// Add a basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Fallback for undefined routes
app.use((req, res) => {
  console.warn(`404 Not Found for route: ${req.method} ${req.originalUrl}`); // Log 404s
  res.status(404).send({ error: 'Not Found' });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Maxun service running on port ${port}`);
});

module.exports = { app, jobs, runRobot, robots }; // Export for testing or direct invocation if needed
