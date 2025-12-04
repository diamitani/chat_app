import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: File[]) => void;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if ((!text.trim() && files.length === 0) || disabled) return;
    
    onSendMessage(text, files);
    setText('');
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="p-4 bg-background border-t border-border">
      <div className="max-w-3xl mx-auto">
        
        {/* File Previews */}
        {files.length > 0 && (
          <div className="flex gap-3 mb-3 overflow-x-auto py-2">
            {files.map((file, idx) => (
              <div key={idx} className="relative group flex-shrink-0">
                <div className="h-16 w-16 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                   {file.type.startsWith('image/') ? (
                     <img 
                       src={URL.createObjectURL(file)} 
                       alt="preview" 
                       className="h-full w-full object-cover opacity-80"
                       onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                     />
                   ) : (
                     <ImageIcon size={24} className="text-muted-foreground" />
                   )}
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <div className="relative flex items-end gap-2 bg-muted/50 border border-input focus-within:ring-1 focus-within:ring-ring rounded-xl p-2 transition-all">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple
            accept="image/*,application/pdf,text/*"
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg text-muted-foreground hover:text-foreground h-9 w-9 mb-0.5 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Attach file"
          >
            <Paperclip size={18} />
          </Button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 max-h-[200px] min-h-[24px] bg-transparent border-none focus:ring-0 resize-none py-2 text-sm placeholder:text-muted-foreground"
            rows={1}
            disabled={disabled}
          />

          <Button 
            variant={text.trim() || files.length > 0 ? "primary" : "ghost"} 
            size="icon" 
            className={`rounded-lg h-9 w-9 mb-0.5 flex-shrink-0 transition-all ${
              !text.trim() && files.length === 0 ? 'text-muted-foreground opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSubmit}
            disabled={disabled || (!text.trim() && files.length === 0)}
          >
            <Send size={18} />
          </Button>
        </div>
        
        <div className="text-[10px] text-center text-muted-foreground mt-2">
          AI can make mistakes. Please verify important information.
        </div>
      </div>
    </div>
  );
};
