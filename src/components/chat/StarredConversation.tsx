'use client';

import { StarredConversation as StarredConversationType, upvoteConversation } from '@/app/actions/starred-conversations';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { userInteractionsService } from '@/services/localStorage/userInteractionsService';
import { RelativeTime } from '@/components/ui/RelativeTime';

type StarredConversationProps = {
  conversation: StarredConversationType;
  locale: string;
};

export const StarredConversation = ({ conversation, locale }: StarredConversationProps) => {
  const t = useTranslations('Chat');
  const [upvotes, setUpvotes] = useState(conversation.upvotes);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    setHasUpvoted(userInteractionsService.hasUpvotedConversation(conversation.id));
  }, [conversation.id]);

  const handleUpvote = async () => {
    if (!isUpvoting && !hasUpvoted) {
      try {
        setIsUpvoting(true);
        const newUpvotes = await upvoteConversation(conversation.id);
        setUpvotes(newUpvotes);
        userInteractionsService.markConversationAsUpvoted(conversation.id);
        setHasUpvoted(true);
      } catch (error) {
        console.error('Error upvoting:', error);
      } finally {
        setIsUpvoting(false);
      }
    }
  };

  return (
    <div className="border border-zinc-800 rounded-lg p-4 space-y-4">
      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">👤</span>
        </div>
        <div className="flex-1">
          <pre className="text-zinc-200 whitespace-pre-wrap font-sans">
            {conversation.userMessage}
          </pre>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🤖</span>
        </div>
        <div className="flex-1">
          <pre className="text-zinc-200 whitespace-pre-wrap font-sans">
            {conversation.assistantMessage}
          </pre>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <RelativeTime 
          date={conversation.createdAt} 
          locale={locale}
          className="text-zinc-400"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center gap-2 p-2 rounded-lg transition-colors ${
              hasUpvoted 
                ? 'bg-purple-700 text-zinc-200 cursor-not-allowed' 
                : isUpvoting 
                  ? 'bg-purple-700 text-zinc-200' 
                  : 'bg-purple-500 text-zinc-100 hover:bg-purple-400'
            }`}
            disabled={isUpvoting || hasUpvoted}
            aria-label={hasUpvoted ? t('alreadyUpvoted') : t('upvote')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor" 
              stroke="none"
              aria-hidden="true"
              className={isUpvoting || hasUpvoted ? 'opacity-50' : ''}
            >
              <path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1 1 0 004 14h4v7a1 1 0 001 1h6a1 1 0 001-1v-7h4a1 1 0 00.781-1.625l-8-10z" />
            </svg>
            <span>{upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 