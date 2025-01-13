import { Message } from '@/domain/chat/types';
import { AI_RESPONSES, THINKING_TIME } from '@/domain/chat/constants';

export const messageService = {
  getRandomResponse: () => {
    return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
  },

  getThinkingTime: () => {
    return Math.random() * (THINKING_TIME.MAX - THINKING_TIME.MIN) + THINKING_TIME.MIN;
  },
}; 