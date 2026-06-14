import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
export const isGeminiAvailable = !!geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY" && geminiApiKey !== "";

let ai: GoogleGenAI | null = null;

if (isGeminiAvailable) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("[Gemini] Client initialized successfully.");
  } catch (err) {
    console.error("[Gemini] Failed to initialize Gemini Client: ", err);
  }
} else {
  console.log("[Gemini] Using offline/simulated fallback. Register GEMINI_API_KEY in Secrets for live processing.");
}

export function getGeminiClient(): GoogleGenAI | null {
  return ai;
}
