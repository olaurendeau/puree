import { useTranslations } from 'next-intl';
import { StarButtonProps } from '@/domain/chat/types';
import { sendGAEvent } from '@next/third-parties/google';

export const StarButton = ({ isStarred, onToggleStar }: StarButtonProps) => {
  const t = useTranslations('Chat');

  const handleClick = () => {
    sendGAEvent('event', 'star_button_clicked', {
      action: isStarred ? 'unstar' : 'star'
    });
    onToggleStar();
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center p-2 rounded-lg bg-purple-500 text-zinc-100 hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
        isStarred ? 'bg-purple-600' : ''
      }`}
      aria-label={isStarred ? t('unstarConversation') : t('starConversation')}
      role="button"
      tabIndex={0}
      title={isStarred ? t('unstarConversation') : t('starConversation')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isStarred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="transition-transform duration-200 ease-in-out"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}; 