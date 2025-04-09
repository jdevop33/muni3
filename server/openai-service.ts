import OpenAI from "openai";
import fs from "fs";
import { promisify } from "util";
import path from "path";

const readFile = promisify(fs.readFile);

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export interface ImageAnalysisResult {
  description: string;
  tags: string[];
  locations?: { name: string; description: string }[];
  confidence: number;
}

export interface DocumentAnalysisResult {
  title?: string;
  summary: string;
  keyPoints: string[];
  topics: string[];
  locations?: { name: string; lat?: number; lng?: number; description?: string }[];
  recommendations?: string[];
}

export interface MapAnalysisResult {
  regions: { name: string; description: string }[];
  keyFeatures: { name: string; type: string; description: string }[];
  summary: string;
  impactedAreas?: string[];
}

/**
 * OpenAI multimodal service for analyzing various types of data
 */
export class OpenAIService {
  /**
   * Analyze an image and extract information
   * @param imagePathOrBase64 Path to image or base64 encoded image data
   * @param prompt Optional prompt to guide the analysis
   */
  async analyzeImage(
    imagePathOrBase64: string,
    prompt: string = "Analyze this image in detail and describe what you see."
  ): Promise<ImageAnalysisResult> {
    let imageData: string;

    // Check if input is a path or base64 data
    if (imagePathOrBase64.startsWith("data:image")) {
      imageData = imagePathOrBase64;
    } else {
      // Read from file
      const buffer = await readFile(imagePathOrBase64);
      const extension = path.extname(imagePathOrBase64).substring(1);
      imageData = `data:image/${extension};base64,${buffer.toString("base64")}`;
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in analyzing municipal images and maps. Extract detailed information about the content.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt} Respond in JSON format with fields: description (string), tags (array of strings), locations (array of objects with name and description), and confidence (number 0-1).`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      description: result.description || "",
      tags: result.tags || [],
      locations: result.locations || [],
      confidence: result.confidence || 0.5,
    };
  }

  /**
   * Analyze a document for key information
   * @param documentText Document content
   * @param documentType Type of document (e.g., "meeting minutes", "proposal", "zoning application")
   */
  async analyzeDocument(
    documentText: string,
    documentType: string
  ): Promise<DocumentAnalysisResult> {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in analyzing municipal documents. Extract detailed information and structure it appropriately.",
        },
        {
          role: "user",
          content: `Analyze this ${documentType} document and extract key information. Respond in JSON format with fields: title, summary, keyPoints (array), topics (array), locations (array of objects with name and optional lat, lng, description), and recommendations (array).\n\nDocument:\n${documentText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      title: result.title,
      summary: result.summary || "",
      keyPoints: result.keyPoints || [],
      topics: result.topics || [],
      locations: result.locations || [],
      recommendations: result.recommendations || [],
    };
  }

  /**
   * Analyze a map image and extract geographical information
   * @param mapImagePath Path to map image
   * @param context Optional context about the map
   */
  async analyzeMap(
    mapImagePath: string,
    context: string = ""
  ): Promise<MapAnalysisResult> {
    const buffer = await readFile(mapImagePath);
    const extension = path.extname(mapImagePath).substring(1);
    const imageData = `data:image/${extension};base64,${buffer.toString(
      "base64"
    )}`;

    const prompt =
      "Analyze this map in detail. " +
      (context ? `Context: ${context}. ` : "") +
      "Identify regions, key features, and provide a summary of what this map represents. " +
      "Respond in JSON format with fields: regions (array of objects with name and description), " +
      "keyFeatures (array of objects with name, type, and description), summary (string), and impactedAreas (array of strings).";

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in analyzing maps and geographical data. Extract detailed information about regions, features, and geographical significance.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      regions: result.regions || [],
      keyFeatures: result.keyFeatures || [],
      summary: result.summary || "",
      impactedAreas: result.impactedAreas || [],
    };
  }

  /**
   * Extract location data from a document
   * @param text Document text
   */
  async extractLocationData(text: string): Promise<any> {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in extracting location data from municipal documents. Find all mentions of locations, addresses, and geographical references.",
        },
        {
          role: "user",
          content:
            `Extract all location references from the following text. For each location, provide the name, type (address, neighborhood, landmark, etc.), ` +
            `and any contextual information about why it's mentioned. Respond in JSON format with an array of location objects.\n\nText:\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  /**
   * Generate a text-to-image visualization
   * @param prompt Description of the image to generate
   * @param size Image size (default: 1024x1024)
   */
  async generateVisualization(
    prompt: string,
    size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024"
  ): Promise<string> {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a visualization for a municipal council meeting platform: ${prompt}`,
      n: 1,
      size: size,
      quality: "standard",
    });

    return response.data[0].url || "";
  }
}

const openAIService = new OpenAIService();
export default openAIService;