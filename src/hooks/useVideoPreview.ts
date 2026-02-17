import { useState, useCallback } from 'react';

interface UseVideoPreviewProps {
  previewDelay?: number;
}

export const useVideoPreview = ({ previewDelay = 1500 }: UseVideoPreviewProps = {}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [previewTimeout, setPreviewTimeout] = useState<number | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handleCardHover = useCallback((cardId: string, hasPreview: boolean = true) => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }

    setHoveredCard(cardId);
    
    if (hasPreview) {
      const timeout = setTimeout(() => {
        setPlayingPreview(cardId);
      }, previewDelay);
      setPreviewTimeout(timeout);
    }
  }, [previewDelay, previewTimeout]);

  const handleCardLeave = useCallback(() => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }
    setHoveredCard(null);
    setPlayingPreview(null);
  }, [previewTimeout]);

  return {
    hoveredCard,
    playingPreview,
    handleCardHover,
    handleCardLeave
  };
};
