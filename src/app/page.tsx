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
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 0);
    }
  }, [isThinking]);

  const handleSubmit = async (content: string) => {
    try {
      const newMessages: Message[] = [...messages, { role: 'user', content }];
      setMessages(newMessages);
      setIsThinking(true);
      
      const response = await messageService.generateResponse(newMessages);
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: response 
      }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, j'ai rencontré une erreur. Peux-tu réessayer ?" 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0C0C0C] text-white">
      <Header />
      
      <main className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            <div className="text-center space-y-3 mb-6">
              <h2 className="text-2xl font-medium text-zinc-200">Bienvenue sur purée</h2>
              <p className="text-zinc-400">L&apos;IA qui te suggère de ne pas utiliser l&apos;IA</p>
            </div>
            <div className="w-full max-w-3xl">
              <ChatInput ref={chatInputRef} onSubmit={handleSubmit} isThinking={isThinking} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={`${message.role}-${index}-${message.content.substring(0, 10)}`}
                    message={message}
                  />
                ))}
                
                {isThinking && <ThinkingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-zinc-800 p-4 bg-[#0C0C0C]">
              <ChatInput ref={chatInputRef} onSubmit={handleSubmit} isThinking={isThinking} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
