export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
}

export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  FLASH_THINKING = 'gemini-2.5-flash-thinking-preview-0121' // Hypothetical fallback or specific version
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}
