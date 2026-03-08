// Chat API Service

import api from '../api';
import type { ChatRequest, ChatResponse } from './types';

const CHAT_ENDPOINTS = {
  send: '/api/chat',
};

/**
 * Send a message to the AI chat companion
 * @param request - Chat request with session_id and message
 * @returns Chat response with AI reply and emotion analysis
 */
export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  return api.post<ChatResponse>(CHAT_ENDPOINTS.send, request);
}

/**
 * Generate a new session ID for chat
 * @returns New session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export chat API object
export const chatApi = {
  sendMessage,
  generateSessionId,
};
