'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/domain/chat/types';
import { Header } from '@/components/ui/Header';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ThinkingIndicator } from '@/components/chat/ThinkingIndicator';
import { useChatScroll } from '@/hooks/chat/useChatScroll';
import { messageService } from '@/services/chat/messageService';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useChatScroll(messages);
  const chatInputRef = useRef<{ focus: () => void }>(null);

  useEffect(() => {
    if (!isThinking) {
      // Petit délai pour s'assurer que le DOM est mis à jour
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 0);
    }
  }, [isThinking]);

  const handleSubmit = async (content: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsThinking(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, messageService.getThinkingTime()));
    
    // Add AI response
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: messageService.getRandomResponse() 
    }]);
    setIsThinking(false);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white">
      <Header />
      
      <main className="flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="flex-1 overflow-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-medium text-zinc-200">Bienvenue sur purée</h2>
                  <p className="text-zinc-400">L&apos;IA qui te suggère de ne pas utiliser l&apos;IA</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={`${message.role}-${index}-${message.content.substring(0, 10)}`}
                    message={message}
                  />
                ))}
                
                {isThinking && <ThinkingIndicator />}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4">
          <ChatInput ref={chatInputRef} onSubmit={handleSubmit} isThinking={isThinking} />
        </div>
      </main>
    </div>
  );
}
