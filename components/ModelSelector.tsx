import React, { useState, useRef, useEffect } from 'react';
import { GeminiModel } from '../types';
import { ChevronDown, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { Button } from './ui/Button';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: GeminiModel) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onModelChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const models = [
    { 
      id: GeminiModel.FLASH, 
      name: "Gemini 2.5 Flash", 
      desc: "Fast, efficient, low latency", 
      icon: <Zap size={16} className="text-yellow-500" /> 
    },
    { 
      id: GeminiModel.PRO, 
      name: "Gemini 3 Pro", 
      desc: "Reasoning, coding, complex tasks", 
      icon: <Sparkles size={16} className="text-purple-500" /> 
    },
    {
      id: GeminiModel.FLASH_THINKING,
      name: "Gemini Flash Thinking",
      desc: "Analytical, careful reasoning",
      icon: <BrainCircuit size={16} className="text-blue-500" />
    }
  ];

  const selectedModel = models.find(m => m.id === currentModel) || models[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 font-medium text-foreground"
      >
        {selectedModel.icon}
        <span className="hidden sm:inline">{selectedModel.name}</span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 p-1 bg-popover border border-border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Select Model</div>
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-3 p-2 rounded-md transition-colors text-left
                ${currentModel === model.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
              `}
            >
              <div className="mt-0.5">{model.icon}</div>
              <div>
                <div className="text-sm font-medium">{model.name}</div>
                <div className="text-xs text-muted-foreground">{model.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
