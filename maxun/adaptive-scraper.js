/**
 * Adaptive Scraper Module for Municipal Websites
 * 
 * This module provides an enhanced web scraping solution that combines:
 * 1. Maxun's robust web scraping capabilities
 * 2. Google's Gemini 2.5 Pro model for website analysis and extraction logic
 * 3. Dynamic configuration for different municipal websites
 */

const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { createGeminiAssistant } = require('./gemini-integration');

/**
 * AdaptiveScraper class that can analyze and extract data from various municipal websites
 */
class AdaptiveScraper {
  /**
   * Create a new AdaptiveScraper
   * @param {Object} options Configuration options
   * @param {string} options.geminiApiKey The Google Gemini API key
   * @param {string} options.configDir Directory to store website configurations
   */
  constructor(options) {
    this.geminiApiKey = options.geminiApiKey;
    this.configDir = options.configDir || path.join(__dirname, 'configs');
    this.geminiAssistant = createGeminiAssistant(this.geminiApiKey);
    
    // Ensure config directory exists
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }
  
  /**
   * Get website configuration for a municipal website
   * @param {string} url The URL of the municipal website
   * @returns {Promise<Object>} The website configuration
   */
  async getWebsiteConfig(url) {
    const domain = new URL(url).hostname;
    const configPath = path.join(this.configDir, `${domain}.json`);
    
    // Check if configuration already exists
    if (fs.existsSync(configPath)) {
      console.log(`Using existing configuration for ${domain}`);
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    
    console.log(`Analyzing website structure for ${domain}...`);
    
    // Fetch the HTML of the main meetings page
    const html = await this.fetchWebsiteHtml(url);
    
    // Use Gemini to analyze the website structure
    const analysisResult = await this.geminiAssistant.analyzeWebsiteStructure(url, html);
    
    // Generate extraction code based on the analysis
    const extractionCode = await this.geminiAssistant.generateExtractionCode(analysisResult);
    
    // Create and save the configuration
    const config = {
      domain,
      url,
      analysis: analysisResult,
      extractionCode,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`Configuration for ${domain} created and saved`);
    
    return config;
  }
  
  /**
   * Fetch HTML content from a URL
   * @param {string} url The URL to fetch
   * @returns {Promise<string>} The HTML content
   */
  async fetchWebsiteHtml(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      
      // Fall back to Puppeteer for JavaScript-heavy sites
      console.log('Falling back to Puppeteer...');
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      const content = await page.content();
      await browser.close();
      return content;
    }
  }
  
  /**
   * Extract meeting data from a municipal website
   * @param {string} url The URL of the municipal website
   * @returns {Promise<Object>} Extracted data in standardized format
   */
  async extractMeetingData(url) {
    const config = await this.getWebsiteConfig(url);
    
    // Use Puppeteer to execute the extraction code
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Execute the extraction code
      const extractionFunction = new Function('page', 'return ' + config.extractionCode);
      const rawData = await extractionFunction()(page);
      
      await browser.close();
      
      // Standardize the extracted data
      const standardizedData = await this.geminiAssistant.standardizeData(rawData);
      
      return standardizedData;
    } catch (error) {
      await browser.close();
      console.error(`Error extracting data from ${url}:`, error);
      throw error;
    }
  }
}

module.exports = {
  AdaptiveScraper
};