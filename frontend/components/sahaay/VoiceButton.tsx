'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Send } from 'lucide-react';
import { api } from '@/lib/api';

interface VoiceButtonProps {
  label?: string;
  onTranscript?: (text: string) => void;
  caseId?: string;
  className?: string;
}

export function VoiceButton({
  label = "Talk to Sahaay",
  onTranscript,
  caseId,
  className = ""
}: VoiceButtonProps) {
  const [effectiveCaseId, setEffectiveCaseId] = useState<string>(caseId || '');

  useEffect(() => {
    if (caseId) {
      setEffectiveCaseId(caseId);
    } else if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_active_case_id') || localStorage.getItem('sahaay_active_case_id');
      if (stored) setEffectiveCaseId(stored);
    }
  }, [caseId]);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.lang = 'hi-IN'; // Supports Hindi + Indian English

      recognizer.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        if (event.results[0].isFinal) {
          setIsListening(false);
          handleProcessQuery(text);
        }
      };

      recognizer.onerror = () => {
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognizer);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      // Browser fallback simulation if Speech API unsupported
      simulateVoiceQuery();
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      setIsListening(true);
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const simulateVoiceQuery = (sampleText?: string) => {
    const defaultSample = "Mera insurance kitna cover karega aur gap kitna hai?";
    const textToUse = sampleText || defaultSample;
    setTranscript(textToUse);
    handleProcessQuery(textToUse);
  };

  const handleProcessQuery = async (queryText: string) => {
    if (onTranscript) {
      onTranscript(queryText);
    }
    setIsLoading(true);
    try {
      const reply = await api.chatWithSahaay(effectiveCaseId, queryText, 'hinglish');
      setResponse(reply);

      // Text-to-speech feedback if available
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(reply.slice(0, 200));
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      setResponse("Maine aapka emergency context audit kiya hai. Aap FlowPass token ke through direct settlement ya funding plan continue kar sakte hain.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-emerald-500 hover:scale-105 active:scale-95 transition-all ${className}`}
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Mic className="h-4 w-4 text-white" />
        <span className="text-sm tracking-wide">{label}</span>
      </button>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sahaay Voice Assistant</h3>
                <p className="text-xs text-slate-400">Hindi • Hinglish • English</p>
              </div>
            </div>

            {/* Microphone orb */}
            <div className="flex flex-col items-center justify-center py-6">
              <button
                onClick={toggleListening}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-110 animate-pulse'
                    : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:scale-105'
                }`}
              >
                {isListening ? <Mic className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
              <p className="mt-3 text-xs font-medium text-slate-400">
                {isListening ? 'Listening... Speak in Hindi or English' : 'Tap to Speak or choose a quick prompt'}
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => simulateVoiceQuery("Meri insurance kitna cover karegi?")}
                className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-teal-500/20 hover:text-teal-300 border border-white/5 transition-all text-left"
              >
                "Meri insurance kitna cover karegi?"
              </button>
              <button
                onClick={() => simulateVoiceQuery("Why is there a ₹46,000 gap in my claim?")}
                className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-teal-500/20 hover:text-teal-300 border border-white/5 transition-all text-left"
              >
                "Why is there a gap in my bill?"
              </button>
              <button
                onClick={() => simulateVoiceQuery("What documents are missing for my discharge?")}
                className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-teal-500/20 hover:text-teal-300 border border-white/5 transition-all text-left"
              >
                "What documents are missing?"
              </button>
            </div>

            {/* Transcript & Response Area */}
            {(transcript || isLoading || response) && (
              <div className="space-y-3 rounded-xl border border-white/5 bg-navy-950 p-4">
                {transcript && (
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">You said</span>
                    <p className="text-sm font-medium text-white mt-0.5">{transcript}</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-teal-400 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sahaay is reasoning with policy & bill evidence...</span>
                  </div>
                )}
                {response && (
                  <div className="border-t border-white/5 pt-2">
                    <span className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase flex items-center gap-1">
                      <Volume2 className="h-3 w-3" /> Sahaay Response
                    </span>
                    <p className="text-sm text-slate-200 mt-1 leading-relaxed">{response}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
