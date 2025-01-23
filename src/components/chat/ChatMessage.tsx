import { ChatMessageProps } from '@/domain/chat/types';
import { ShareButton } from './ShareButton';
import { StarButton } from './StarButton';
import { useState, useEffect } from 'react';
import { isConversationStarred, toggleStarredConversation } from '@/app/actions/starred-conversations';
import { userInteractionsService } from '@/services/localStorage/userInteractionsService';
import { Toast } from '@/components/ui/Toast';
import { useTranslations } from 'next-intl';

export const ChatMessage = ({ locale, message, previousMessage }: ChatMessageProps) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const language = locale.split('-')[0];
  const t = useTranslations('Chat');

  useEffect(() => {
    const checkStarredStatus = async () => {
      if (message.role === 'assistant' && previousMessage) {
        const starred = await isConversationStarred(language, previousMessage, message);
        setIsStarred(starred);
      }
    };

    checkStarredStatus();
  }, [message, previousMessage, language]);

  const handleToggleStar = async () => {
    if (previousMessage && !isLoading) {
      try {
        setIsLoading(true);
        const {id, isStarred: newIsStarred} = await toggleStarredConversation(language, previousMessage, message);
        setIsStarred(newIsStarred);

        // Si la conversation est marquée comme favorite, on la marque aussi comme upvotée
        if (newIsStarred !== false && id) {
          userInteractionsService.markConversationAsUpvoted(id);
          setShowToast(true);
        }
      } catch (error) {
        console.error('Error toggling star:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.role === 'user' ? 'bg-zinc-700' : 'bg-purple-700'
        }`}>
          <span className="text-lg">
            {message.role === 'user' ? '👤' : '🤖'}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="prose prose-invert max-w-none">
            <pre className="text-zinc-200 whitespace-pre-wrap font-sans">
              {message.content}
            </pre>
          </div>
        </div>
      </div>

      {message.role === 'assistant' && previousMessage && (
        <div className="flex gap-2 justify-end">
          <StarButton
            userMessage={previousMessage}
            assistantMessage={message}
            isStarred={isStarred}
            onToggleStar={handleToggleStar}
          />
          <ShareButton
            userMessage={previousMessage}
            assistantMessage={message}
          />
        </div>
      )}

      {showToast && (
        <Toast
          message={t('starredMessage')}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}; 