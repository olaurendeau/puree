'use client';

import { getStarredConversations, type StarredConversation } from '@/app/actions/starred-conversations';
import { StarredConversation as StarredConversationComponent } from '@/components/chat/StarredConversation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const PAGE_SIZE = 10;

type StarredConversationListProps = {
  locale: string;
  initialConversations: StarredConversation[];
  hasMoreInitial: boolean;
};

export const StarredConversationList = ({ locale, initialConversations, hasMoreInitial }: StarredConversationListProps) => {
  const t = useTranslations('Starred');
  const language = locale.split('-')[0];
  const [conversations, setConversations] = useState<StarredConversation[]>(initialConversations);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [isLoading, setIsLoading] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: hasMore ? conversations.length + 1 : conversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Hauteur estimée d'une conversation
    overscan: 10, // Nombre d'éléments à pré-rendre
  });

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const page = Math.floor(conversations.length / PAGE_SIZE);
      const result = await getStarredConversations(language, page, PAGE_SIZE);
      
      // Vérifier les doublons avant d'ajouter les nouvelles conversations
      const newConversations = result.conversations.filter(
        newConv => !conversations.some(existingConv => existingConv.id === newConv.id)
      );
      
      setConversations(prev => [...prev, ...newConversations]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Observer le dernier élément pour le chargement infini
  useEffect(() => {
    const lastIndex = virtualizer.getVirtualItems().length - 1;
    const lastItem = virtualizer.getVirtualItems()[lastIndex];

    if (lastItem && lastItem.index >= conversations.length - 1) {
      loadMore();
    }
  }, [virtualizer.getVirtualItems()]);

  if (conversations.length === 0 && !isLoading) {
    return (
      <p className="text-zinc-400 text-center py-8">{t('noStarredConversations')}</p>
    );
  }

  return (
    <div 
      ref={parentRef} 
      className="h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-600"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
        className="overflow-hidden"
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index === conversations.length;
          const conversation = conversations[virtualRow.index];
          
          // Élément de chargement
          if (isLoaderRow) {
            return (
              <div
                key={`loader-${virtualRow.index}`}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="py-4 text-center"
              >
                <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            );
          }

          return (
            <div
              key={`row-${virtualRow.index}-${conversation.id}`}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="py-3">
                <StarredConversationComponent
                  conversation={conversation}
                  locale={locale}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 