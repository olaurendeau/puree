import { ChatMessageProps } from '@/domain/chat/types';

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-8 h-8 rounded-full ${
        message.role === 'user' ? 'bg-zinc-700' : 'bg-purple-700'
      } flex items-center justify-center`}>
        <span className="text-sm">{message.role === 'user' ? '👤' : '🤖'}</span>
      </div>
      <div className="flex-1">
        <pre className="text-zinc-200 whitespace-pre-wrap font-sans">
          {message.content}
        </pre>
      </div>
    </div>
  );
}; 