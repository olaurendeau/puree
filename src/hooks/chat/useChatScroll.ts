import { useEffect, useRef } from 'react';
import { Message } from '@/domain/chat/types';

export const useChatScroll = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return messagesEndRef;
}; 