import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceInput({ onResult, placeholder = "Speak now...", className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    // Stub for Web Speech API integration
    if (!isListening) {
      setIsListening(true);
      // Simulate speech recognition after 2 seconds
      setTimeout(() => {
        onResult("Wheat 50 Quintals");
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={twMerge(
        clsx(
          "flex items-center justify-center p-3 rounded-full transition-all duration-300 shadow-sm",
          isListening 
            ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
            : "bg-krishi-light text-krishi-dark hover:bg-krishi hover:text-white",
          className
        )
      )}
      title={isListening ? "Listening..." : "Click to speak"}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}
