import { ChatInputProps } from '@/domain/chat/types';
import { useRef, useImperativeHandle, forwardRef } from 'react';
import { sendGAEvent } from '@next/third-parties/google'

export const ChatInput = forwardRef<{ focus: () => void }, ChatInputProps>(({ onSubmit, isThinking }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    }
  }));
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const lineHeight = 24;
    const maxHeight = lineHeight * 5;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    sendGAEvent('event', 'chat_input_submitted');

    e.preventDefault();
    
    if (!textareaRef.current) return;
    
    const message = textareaRef.current.value.trim();
    if (!message) return;
    
    onSubmit(message);
    textareaRef.current.value = '';
    textareaRef.current.style.height = 'auto';
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="relative">
        <textarea
          ref={textareaRef}
          name="question"
          placeholder="Pose ta question à la purée..."
          className="w-full p-4 pr-24 bg-zinc-900 border border-zinc-700 rounded-lg 
            focus:outline-none focus:border-purple-500 resize-none overflow-y-auto
            scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
          rows={1}
          required
          autoFocus
          disabled={isThinking}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaInput}
          style={{
            minHeight: '60px',
            maxHeight: '120px',
            lineHeight: '24px'
          }}
        />
        <button
          type="submit"
          disabled={isThinking}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput'; 