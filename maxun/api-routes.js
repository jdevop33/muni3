/**
 * API routes for the Maxun service with Gemini LLM enhancement
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { AdaptiveScraper } = require('./adaptive-scraper');
const router = express.Router();

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize adaptive scraper
let adaptiveScraper = null;

/**
 * Ensure the adaptive scraper is initialized
 */
function ensureScraperInitialized(req, res, next) {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Missing Gemini API key',
      message: 'Please provide a GEMINI_API_KEY environment variable'
    });
  }
  
  if (!adaptiveScraper) {
    adaptiveScraper = new AdaptiveScraper({
      geminiApiKey: GEMINI_API_KEY,
      configDir: './configs'
    });
  }
  
  next();
}

/**
 * @route POST /api/analyze-website
 * @desc Analyze a municipal website structure
 * @access Private
 */
router.post('/analyze-website', ensureScraperInitialized, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Please provide a URL to analyze'
      });
    }
    
    const config = await adaptiveScraper.getWebsiteConfig(url);
    
    res.json({
      success: true,
      data: {
        domain: config.domain,
        analysis: config.analysis,
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    console.error('Error analyzing website:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * @route POST /api/extract-data
 * @desc Extract meeting data from a municipal website
 * @access Private
 */
router.post('/extract-data', ensureScraperInitialized, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Please provide a URL to extract data from'
      });
    }
    
    const data = await adaptiveScraper.extractMeetingData(url);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error extracting data:', error);
    res.status(500).json({
      error: 'Extraction failed',
      message: error.message
    });
  }
});

/**
 * @route GET /api/configs
 * @desc Get all website configurations
 * @access Private
 */
router.get('/configs', ensureScraperInitialized, (req, res) => {
  try {
    const configDir = adaptiveScraper.configDir;
    const configs = [];
    
    const files = fs.readdirSync(configDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const config = JSON.parse(fs.readFileSync(path.join(configDir, file), 'utf-8'));
        configs.push({
          domain: config.domain,
          url: config.url,
          updatedAt: config.updatedAt
        });
      }
    }
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Error getting configurations:', error);
    res.status(500).json({
      error: 'Failed to get configurations',
      message: error.message
    });
  }
});

module.exports = router;