import { Message } from '@/domain/chat/types';
import { generateAIResponse } from '@/app/actions/chat';

class MessageService {
  async generateResponse(messages: Message[]): Promise<string> {
    try {
      return await generateAIResponse(messages);
    } catch (error) {
      console.error('Error generating response:', error);
      return "Désolé, j'ai rencontré une erreur. Peux-tu réessayer ?";
    }
  }
}

export const messageService = new MessageService(); 