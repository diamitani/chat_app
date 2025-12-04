import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GeminiModel, Message } from "../types";

// Initialize the API client. 
// Note: process.env.API_KEY is injected by the environment.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const createChat = (model: string) => {
  return ai.chats.create({
    model: model,
    config: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      // System instructions can be added here if needed
      systemInstruction: "You are a helpful, intelligent, and precise AI assistant. You use Markdown to format your responses effectively.",
    },
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  messageText: string, 
  attachments: { mimeType: string; data: string }[] = []
) => {
  try {
    let responseStream;

    if (attachments.length > 0) {
      // If there are attachments, we need to format the contents properly for the SDK
      // The SDK's chat.sendMessageStream expects a 'message' property which can be string or Part[]
      
      const parts: any[] = [];
      
      // Add attachments
      attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });

      // Add text
      if (messageText) {
        parts.push({ text: messageText });
      }

      // Important: The SDK structure might require specific handling for multimodal inputs in chat.
      // Based on current docs, we pass the parts array.
       responseStream = await chat.sendMessageStream({
        message: {
           role: 'user', 
           parts: parts
        } as any // Casting to any to bypass strict typing if SDK types are slightly behind multimodal chat structures
      });
      
    } else {
      // Text-only message
      responseStream = await chat.sendMessageStream({ message: messageText });
    }
    
    return responseStream;

  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Helper to validate API key availability
 */
export const isApiKeyAvailable = (): boolean => {
  return !!apiKey;
};
