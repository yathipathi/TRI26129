'use client';

import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInputButton({ onTranscript }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser environment. Using keyboard input.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'te-IN'; // Multi-lingual (Telugu + English) recognition

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`px-3 py-2 border-2 border-black font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-100 text-black hover:bg-black hover:text-white'
      }`}
      title="Voice Input (Supports Telugu & English)"
    >
      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-orange-500" />}
      <span>{isListening ? 'Listening...' : 'Voice Prompt'}</span>
    </button>
  );
}
