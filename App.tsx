import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { isApiKeyAvailable, createChat, sendMessageStream } from './services/geminiService';
import { GeminiModel, Message } from './types';
import { ChatBubble } from './components/ChatBubble';
import { InputArea } from './components/InputArea';
import { ModelSelector } from './components/ModelSelector';
import { Plus, PanelLeftClose, PanelLeftOpen, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from './components/ui/Button';

// Utility for file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
       const result = reader.result as string;
       // Remove "data:image/png;base64," prefix
       const base64 = result.split(',')[1];
       resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModel, setCurrentModel] = useState<GeminiModel>(GeminiModel.FLASH);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for the current chat session
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKeyOk = isApiKeyAvailable();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Chat
  useEffect(() => {
    if (apiKeyOk) {
      chatRef.current = createChat(currentModel);
      setMessages([]); // Reset messages on model change or init
    }
  }, [currentModel, apiKeyOk]);

  const handleSendMessage = async (text: string, files: File[]) => {
    if (!apiKeyOk) {
      setError("API Key is missing. Please check your environment variables.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Prepare attachments
    const attachments = await Promise.all(files.map(async (file) => ({
      mimeType: file.type,
      data: await fileToBase64(file)
    })));

    // Create User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
      attachments
    };

    setMessages(prev => [...prev, userMessage]);

    // Create placeholder for Bot Message
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      role: 'model',
      text: '',
      isStreaming: true,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, botMessage]);

    try {
      // Re-initialize chat if needed or for fresh context with model switch
      if (!chatRef.current) {
        chatRef.current = createChat(currentModel);
      }

      // Stream Response
      const resultStream = await sendMessageStream(chatRef.current, text, attachments);
      
      let fullText = '';
      
      for await (const chunk of resultStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
            fullText += chunkText;
            setMessages(prev => prev.map(msg => 
                msg.id === botMessageId 
                ? { ...msg, text: fullText } 
                : msg
            ));
        }
      }

      // Finalize message
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
        ? { ...msg, isStreaming: false } 
        : msg
      ));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating the response.");
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId)); // Remove failed message
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    chatRef.current = createChat(currentModel);
    setError(null);
  };

  if (!apiKeyOk) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
              <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
                  <AlertTriangle size={48} />
              </div>
              <h1 className="text-2xl font-bold mb-2">Configuration Missing</h1>
              <p className="text-muted-foreground max-w-md">
                  This application requires a Google Gemini API Key. 
                  The key must be provided via the <code>process.env.API_KEY</code> environment variable.
              </p>
          </div>
      )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      
      {/* Sidebar - Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform bg-card border-r border-border transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 pointer-events-none'}
        md:relative md:translate-x-0 
        ${!isSidebarOpen && 'md:w-0 md:opacity-0 md:overflow-hidden'}
      `}>
        <div className="flex flex-col h-full">
            <div className="h-14 flex items-center px-4 border-b border-border/50">
                 <div className="flex items-center gap-2 font-semibold">
                    <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center">G</div>
                    <span>Gemini Chat</span>
                 </div>
            </div>
            
            <div className="p-3">
                <Button onClick={handleNewChat} className="w-full justify-start gap-2" variant="outline">
                    <Plus size={16} /> New Chat
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 pt-0">
               <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Recent</div>
               <Button variant="ghost" className="w-full justify-start text-sm font-normal text-muted-foreground hover:text-foreground">
                  <MessageSquare size={14} className="mr-2" /> 
                  Previous conversation...
               </Button>
               {/* Placeholder for history list */}
            </div>

            <div className="p-4 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                    Powered by Google GenAI SDK
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-muted-foreground"
            >
                {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </Button>
            <ModelSelector 
                currentModel={currentModel} 
                onModelChange={setCurrentModel} 
                disabled={messages.length > 0 && isLoading}
            />
          </div>
          <div>
            {/* Right side actions (Theme toggle, etc could go here) */}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-4 pb-4">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200" style={{opacity: 1}}>
                    <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-6">
                        <Plus className="text-primary w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight mb-2">How can I help you today?</h2>
                    <p className="text-muted-foreground max-w-sm">
                        Ask about complex topics, upload images for analysis, or get help with coding tasks.
                    </p>
                </div>
            ) : (
                messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))
            )}
            
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="z-20 bg-background">
             <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>

      </div>
    </div>
  );
}

export default App;
