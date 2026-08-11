import { useState } from 'react';

export function useShare() {
  const [isCopied, setIsCopied] = useState(false);

  const shareContent = async (title, text, url) => {
    const targetUrl = url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Campuzway Article',
          text: text || '',
          url: targetUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing content:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  };

  return { shareContent, isCopied };
}

export default useShare;
