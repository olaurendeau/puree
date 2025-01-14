import { toJpeg } from 'html-to-image';
import { Message } from '@/domain/chat/types';
import { generateShareSummary } from '@/app/actions/chat';
import { uploadToS3 } from '@/app/actions/s3';

interface ShareButtonProps {
  userMessage: Message;
  assistantMessage: Message;
}

export const ShareButton = ({ userMessage, assistantMessage }: ShareButtonProps) => {
  const generateImage = async () => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    
    // Créer une version stylisée des messages pour la capture
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
          text-align: right;
        ">
          Généré avec purée - https://puree.chat
        </div>
      </div>
    `;

    document.body.appendChild(element);

    try {
      // Attendre que l'élément soit rendu
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
      const imageUrl = await generateImage();
      const summary = await generateShareSummary([userMessage, assistantMessage]);

      // Extraire la partie base64 de l'URL de données
      const base64Data = imageUrl.replace(/^data:image\/jpeg;base64,/, '');

      // Télécharger sur S3 en utilisant la chaîne base64
      const s3Url = await uploadToS3(base64Data, `${summary.filename}.jpeg`);

      if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
        await navigator.share({
          title: summary.title,
          text: summary.text,
          url: s3Url,
        });
      } else {
        // Fallback : téléchargement direct
        const link = document.createElement('a');
        link.href = s3Url;
        link.target = '_blank';
        link.click();
      }
    } catch (error) {
      console.warn('Erreur lors du partage:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-zinc-500 hover:text-zinc-300 transition-colors"
      aria-label="Partager cet échange"
    >
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
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  );
}; 