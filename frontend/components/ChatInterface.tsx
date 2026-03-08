'use client';

// Chat Interface Component

import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, BrainCircuit } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import type { ChatResponse, EmotionScore } from '@/lib/api/types';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  emotions?: EmotionScore[];
  crisis?: boolean;
}

interface ChatInterfaceProps {
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export function ChatInterface({ sessionId: initialSessionId, onSessionChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId || chatApi.generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onSessionChange) {
      onSessionChange(sessionId);
    }
  }, [sessionId, onSessionChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await chatApi.sendMessage({
        session_id: sessionId,
        message: input,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date(),
        emotions: response.emotions,
        crisis: response.crisis,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update session if changed
      if (response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-app-cream)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Hi there! 👋</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              I\'m your AI companion. Share how you\'re feeling, and I\'ll listen and support you.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.isUser
                  ? 'bg-gradient-to-br from-indigo-400 to-purple-400 text-white'
                  : 'bg-white text-slate-700 border border-slate-100'
              }`}
            >
              {!message.isUser && message.crisis && (
                <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">
                    💙 You're not alone. Help is available.
                  </p>
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              {!message.isUser && message.emotions && message.emotions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.emotions.slice(0, 3).map((emotion, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full"
                    >
                      {emotion.emotion} {Math.round(emotion.score * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-gradient-to-br from-indigo-400 to-purple-400 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
