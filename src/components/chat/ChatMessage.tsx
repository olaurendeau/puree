import { ChatMessageProps } from '@/domain/chat/types';
import { ShareButton } from './ShareButton';
import { useTranslations } from 'next-intl';

export const ChatMessage = ({ message, previousMessage }: ChatMessageProps) => {
  const t = useTranslations('Chat');
  const showShareButton = message.role === 'assistant' && previousMessage?.role === 'user';

  return (
    <div className="flex gap-4 items-start">
      <div 
        className={`w-8 h-8 rounded-full ${
          message.role === 'user' ? 'bg-zinc-700' : 'bg-purple-700'
        } flex items-center justify-center`}
        aria-label={message.role === 'user' ? t('userAvatar') : t('assistantAvatar')}
      >
        <span className="text-sm">{message.role === 'user' ? '👤' : '🤖'}</span>
      </div>
      <div className="flex-1">
        <pre className="text-zinc-200 whitespace-pre-wrap font-sans">
          {message.content}
        </pre>
      </div>
      {showShareButton && previousMessage && (
        <div className="flex-shrink-0 pt-1">
          <ShareButton
            userMessage={previousMessage}
            assistantMessage={message}
          />
        </div>
      )}
    </div>
  );
}; 