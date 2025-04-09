/**
 * Gemini LLM Integration for Enhanced Data Ingestion
 * 
 * This module provides functionality to use Google's Gemini 2.5 Pro model
 * to assist in analyzing and extracting data from various municipal websites.
 */

const { GoogleGenerativeAI } = require("@google/genai");

// Configuration
const MODEL_NAME = "gemini-2.5-pro-preview-03-25";

/**
 * GeminiAssistant provides methods to analyze municipal websites and extract structured data
 */
class GeminiAssistant {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: `You are an expert data extraction assistant for municipal government websites.
Your task is to analyze website structures, identify patterns for meeting information,
and generate extraction logic that can be used to collect data in a consistent format.
Always be precise, detailed, and focus only on factual information present on the website.`
    });
  }

  /**
   * Analyzes a municipal website to identify its structure and data patterns
   * 
   * @param {string} url The URL of the municipal website to analyze
   * @param {string} html The HTML content of the website's meetings page
   * @returns {Object} Analysis of the website structure and data patterns
   */
  async analyzeWebsiteStructure(url, html) {
    const prompt = `
      I need to extract meeting data from this municipal website: ${url}
      
      Here's a sample of the HTML from their meetings page:
      
      \`\`\`html
      ${html.substring(0, 5000)} // Truncate to avoid token limits
      \`\`\`
      
      Please analyze this HTML and identify:
      1. The common patterns for meeting listings (CSS selectors or XPath)
      2. How meeting dates are formatted
      3. How to identify meeting types
      4. Links to meeting documents, minutes, or recordings
      5. How to extract agenda items or topics
      
      Format your response as a JSON object that I can use to configure an extractor.
    `;
    
    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from the response
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/{[\s\S]*}/);
                       
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse JSON from response:", e);
          return { error: "Could not parse structure", raw: responseText };
        }
      }
      
      return { error: "Could not identify structure", raw: responseText };
    } catch (error) {
      console.error("Error analyzing website structure:", error);
      throw error;
    }
  }
  
  /**
   * Generates extraction code based on the website analysis
   * 
   * @param {Object} websiteAnalysis The analysis of the website structure
   * @returns {string} JavaScript code that can extract data from the website
   */
  async generateExtractionCode(websiteAnalysis) {
    const prompt = `
      Based on this analysis of a municipal website structure:
      
      \`\`\`json
      ${JSON.stringify(websiteAnalysis, null, 2)}
      \`\`\`
      
      Generate JavaScript code (using Puppeteer) that can:
      1. Navigate to the meetings page
      2. Extract all meetings listed, including their dates, types, and links
      3. Follow links to get detailed meeting information
      4. Extract agenda items, decisions, and documents
      5. Format the data in a structured JSON format
      
      Return ONLY the JavaScript code without explanation.
    `;
    
    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract code block from the response
      const codeMatch = responseText.match(/```javascript\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```js\s*([\s\S]*?)\s*```/);
                       
      if (codeMatch) {
        return codeMatch[1];
      }
      
      return responseText; // Return the raw text if no code block is found
    } catch (error) {
      console.error("Error generating extraction code:", error);
      throw error;
    }
  }
  
  /**
   * Processes and standardizes extracted data from a municipal website
   * 
   * @param {Object} rawData The raw data extracted from the website
   * @returns {Object} Standardized data that matches our application's schema
   */
  async standardizeData(rawData) {
    const prompt = `
      I have extracted the following raw data from a municipal website:
      
      \`\`\`json
      ${JSON.stringify(rawData, null, 2)}
      \`\`\`
      
      Please transform this into a standardized format that matches our application schema:
      
      1. Each meeting should have: id, type, status, date, title, startTime, duration, participants
      2. Topics should be extracted from agenda items
      3. Decisions should include: id, type, status, date, title, description, meetingId, topics, votesFor, votesAgainst
      
      Return a JSON object with two arrays: "meetings" and "decisions".
    `;
    
    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from the response
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/{[\s\S]*}/);
                       
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse JSON from response:", e);
          return { error: "Could not parse standardized data", raw: responseText };
        }
      }
      
      return { error: "Could not standardize data", raw: responseText };
    } catch (error) {
      console.error("Error standardizing data:", error);
      throw error;
    }
  }
}

/**
 * Create and configure the Gemini assistant
 * 
 * @param {string} apiKey The Gemini API key
 * @returns {GeminiAssistant} A configured Gemini assistant
 */
function createGeminiAssistant(apiKey) {
  return new GeminiAssistant(apiKey);
}

module.exports = {
  createGeminiAssistant
};