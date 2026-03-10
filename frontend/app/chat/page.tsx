'use client';

import { Header } from '@/components/Header';
import { BrainCircuit, PlusCircle, Smile, Send, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chat, chatVoice } from '@/lib/apiClient';
import { startRecording, stopRecording } from '@/lib/voiceRecorder';
import { useVisualViewport } from '@/hooks/useVisualViewport';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

interface CrisisData {
  crisis_trigger: boolean;
  helplines: Array<{ name: string; number: string; description: string }>;
}

export default function Chat() {
  const { user, nickname } = useAuth();
  const vpHeight = useVisualViewport();

  // States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there 🌿 Welcome to your safe space. I'm here to listen and help you build emotional resilience.\n\nHow are you feeling today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisData, setCrisisData] = useState<CrisisData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingVoice, setIsSendingVoice] = useState(false);

  // Persist session across this component lifecycle
  const [sessionId] = useState(() => uuidv4());

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, crisisData]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add User Message Optimistically
    setMessages(prev => [...prev, { id: uuidv4(), role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const resp = await chat(sessionId, userMessage);

      // Update Crisis State
      if (resp.crisis?.crisis_trigger) {
        setCrisisData(resp.crisis);
      } else {
        // Clear old crisis warnings if the new turn is fine
        setCrisisData(null);
      }

      setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: resp.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my thoughts right now. Please try again.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Stop recording and send
      setIsRecording(false);
      setIsSendingVoice(true);
      setLoading(true);

      try {
        const audioBlob = await stopRecording();
        const result = await chatVoice(sessionId, audioBlob);

        // Show user transcript as a user message
        if (result.userTranscript) {
          setMessages(prev => [...prev, { id: uuidv4(), role: 'user', content: result.userTranscript }]);
        }

        // Show AI text response as assistant message
        if (result.aiResponseText) {
          setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: result.aiResponseText }]);
        }

        // Play AI voice response
        if (result.audioUrl) {
          const audio = new Audio(result.audioUrl);
          audio.play().catch(err => console.error('Audio playback failed:', err));
        }
      } catch (error) {
        console.error('Voice chat error:', error);
        setMessages(prev => [...prev, {
          id: uuidv4(),
          role: 'assistant',
          content: "I couldn't process your voice message. Please check your microphone permissions and try again.",
          isError: true,
        }]);
      } finally {
        setIsSendingVoice(false);
        setLoading(false);
      }
    } else {
      // Start recording
      try {
        await startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
        setMessages(prev => [...prev, {
          id: uuidv4(),
          role: 'assistant',
          content: 'Microphone access was denied. Please allow microphone permissions in your browser settings to use voice chat.',
          isError: true,
        }]);
      }
    }
  };

  return (
    <main
      className="flex flex-col bg-transparent overflow-hidden"
      style={{ height: vpHeight ? `${vpHeight}px` : '100dvh' }}
    >
      <Header title={nickname || 'Anonymous'} />

      {/* Persistent Crisis Banner */}
      {crisisData?.crisis_trigger && (
        <div className="bg-rose-500 text-white p-4 text-sm shadow-md animate-in slide-in-from-top-2 relative z-10 shrink-0">
          <p className="font-bold mb-2">It sounds like you're going through a really difficult time.</p>
          <div className="space-y-1">
            {crisisData.helplines?.map((line, i) => (
              <p key={i}><strong>{line.name}:</strong> <a href={`tel:${line.number}`} className="underline">{line.number}</a></p>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
        <div className="space-y-6">
          {messages.map((msg) => (
            msg.role === 'assistant' ? (
              <div key={msg.id} className="flex flex-col items-start gap-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400">AI Companion</span>
                </div>
                <div className={`bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border ${msg.isError ? 'border-rose-200 text-rose-700' : 'border-slate-100 text-slate-700'}`}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-col items-end gap-2 max-w-[85%] ml-auto">
                <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-sm">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          ))}

          {loading && (
            <div className="flex flex-col items-start gap-2 max-w-[85%]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400">AI Companion</span>
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-2 w-16 h-12 items-center justify-center">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          )}

          <div ref={endOfMessagesRef} className="h-4" />
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-100 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-rose-600">Recording… Tap mic to stop</span>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="px-4 py-4 bg-slate-50 pb-24 border-t border-slate-200/50">
        <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 p-2 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
            <PlusCircle className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading || isRecording}
            placeholder={isRecording ? 'Listening...' : 'Share what\'s on your mind...'}
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-sm py-2 outline-none px-2"
          />
          <div className="flex items-center gap-1 px-1">
            <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Smile className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={loading && !isRecording}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                } disabled:opacity-50`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              type="submit"
              disabled={loading || !inputValue.trim() || isRecording}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
