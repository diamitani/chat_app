import React from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { User, Bot, Loader2 } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] lg:max-w-[65%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border shadow-sm
          ${isUser ? 'bg-primary text-primary-foreground' : 'bg-background border-border text-foreground'}
        `}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            relative px-4 py-3 rounded-2xl shadow-sm border
            ${isUser 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-card text-card-foreground border-border'}
            ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
          `}>
             {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {message.attachments.map((att, idx) => (
                   att.mimeType.startsWith('image/') ? (
                    <img 
                      key={idx} 
                      src={`data:${att.mimeType};base64,${att.data}`} 
                      alt="attachment" 
                      className="max-h-48 rounded-lg border border-border/50 object-cover"
                    />
                   ) : (
                     <div key={idx} className="p-2 bg-background/20 rounded text-xs">
                       Attachment ({att.mimeType})
                     </div>
                   )
                ))}
              </div>
            )}

            {/* Text Content */}
            <div className={isUser ? "text-sm" : "text-sm leading-relaxed"}>
              {isUser ? (
                 <div className="whitespace-pre-wrap">{message.text}</div>
              ) : (
                 <MarkdownRenderer content={message.text} />
              )}
            </div>
            
             {/* Streaming Indicator */}
             {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary/50 animate-pulse rounded-full" />
             )}
          </div>
          
          <span className="text-[10px] text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
