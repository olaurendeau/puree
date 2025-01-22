import { toJpeg } from 'html-to-image';
import { Message } from '@/domain/chat/types';
import { generateShareSummary } from '@/app/actions/chat';
import { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

interface ShareButtonProps {
  userMessage: Message;
  assistantMessage: Message;
}

export const ShareButton = ({ userMessage, assistantMessage }: ShareButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const generateImage = async () => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    
    element.innerHTML = `
      <div style="
        background-color: #0C0C0C;
        padding: 32px;
        color: white;
        width: 400px;
        font-family: system-ui, -apple-system, sans-serif;
        display: inline-block;
      ">
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 9999px;
              background-color: #3f3f46;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            ">
              <span style="font-size: 18px;">👤</span>
            </div>
            <div style="flex: 1;">
              <pre style="
                color: #e4e4e7;
                white-space: pre-wrap;
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
              ">${userMessage.content}</pre>
            </div>
          </div>
          
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 9999px;
              background-color: #7e22ce;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            ">
              <span style="font-size: 18px;">🤖</span>
            </div>
            <div style="flex: 1;">
              <pre style="
                color: #e4e4e7;
                white-space: pre-wrap;
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
              ">${assistantMessage.content}</pre>
            </div>
          </div>
        </div>
        
        <div style="
          margin-top: 24px;
          font-size: 14px;
          color: #71717a;
        ">
          Généré avec purée - https://puree.chat
        </div>
      </div>
    `;

    document.body.appendChild(element);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const contentElement = element.firstElementChild as HTMLElement;
      const dataUrl = await toJpeg(contentElement, {
        quality: 0.95,
        backgroundColor: '#0C0C0C',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${contentElement.offsetWidth}px`,
          height: `${contentElement.offsetHeight}px`,
        },
      });

      return dataUrl;
    } finally {
      document.body.removeChild(element);
    }
  };

  const handleShare = async () => {
    try {
       setIsModalOpen(true);
    //   setIsGenerating(true);
    //   setDownloadComplete(false);
      
      const imageUrl = await generateImage();
      setPreviewUrl(imageUrl);
    //   setIsGenerating(false);
      
      const summary = await generateShareSummary([userMessage, assistantMessage]);

      if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${summary.filename}.jpeg`, { type: 'image/jpeg' });

        await navigator.share({
          files: [file],
          title: summary.title,
          text: summary.text,
        });

        // setIsModalOpen(false);
        setPreviewUrl(null);
      } else {
        const link = document.createElement('a');
        link.download = `${summary.filename}.jpeg`;
        link.href = imageUrl;
        link.click();
        setMessage('La conversation a été téléchargée, ouvrez votre dossier de téléchargement.');
      }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Erreur lors du partage:', message);
        sendGAEvent('event', 'sharing_failed', {
            error: message
        });
        setMessage('Une erreur est survenue lors du partage : ' + message);    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="inline-flex items-center justify-center p-2 rounded-lg bg-purple-500 text-zinc-100 hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        aria-label="Partager cet échange"
        role="button"
        tabIndex={0}
        title="Partager cet échange"
      >
        {/ios/.test(navigator.userAgent) ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="17" cy="5" r="3" strokeWidth="2"/>
            <circle cx="7" cy="14" r="3" strokeWidth="2"/>
            <circle cx="17" cy="19" r="3" strokeWidth="2"/>
            <line x1="14.5" y1="6.5" x2="9.5" y2="12.5" strokeWidth="2"/>
            <line x1="14.5" y1="17.5" x2="9.5" y2="15.5" strokeWidth="2"/>
          </svg>
        )}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100"
              aria-label="Fermer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div>
                <h2 className="text-xl font-semibold text-zinc-100 mb-4">
                Previsualisation du partage
                </h2>
                <div className="relative aspect-[4/3] bg-black/50 rounded-lg overflow-hidden">
                    { previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Prévisualisation du partage"
                        className="w-full h-full object-contain"
                    />
                    )}
                </div>

                {message && (
                <p className="mt-4 text-zinc-300 text-sm">
                    {message}
                </p>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 