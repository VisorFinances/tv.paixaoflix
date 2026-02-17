import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Series } from '../lib/api';

interface SeriesCardProps {
  series: Series;
  index: number;
  isFocused: boolean;
  onFocus: (index: number) => void;
  onClick: () => void;
  isMobile: boolean;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ 
  series, 
  index, 
  isFocused, 
  onFocus, 
  onClick, 
  isMobile 
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [previewTimeout, setPreviewTimeout] = useState<number | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handleCardHover = (cardId: string) => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }

    setHoveredCard(cardId);
    
    if (series.previewUrl) {
      const timeout = setTimeout(() => {
        setPlayingPreview(series.id);
      }, 1500);
      setPreviewTimeout(timeout);
    }
  };

  const handleCardLeave = () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }
    setHoveredCard(null);
    setPlayingPreview(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => handleCardHover(series.id)}
      onHoverEnd={handleCardLeave}
      onClick={onClick}
      className={`relative cursor-pointer group ${
        isFocused ? 'ring-2 ring-red-600 rounded-lg' : ''
      }`}
      tabIndex={0}
      onFocus={() => onFocus(index)}
    >
      <div className="aspect-[3/4] rounded-lg overflow-hidden">
        {playingPreview === series.id && series.previewUrl ? (
          <video
            src={series.previewUrl}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={series.thumbnail}
            alt={series.title}
            className="w-full h-full object-cover"
          />
        )}
        <AnimatePresence>
          {hoveredCard === series.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex flex-col justify-end p-4"
            >
              <h3 className="font-semibold text-sm mb-1">{series.title}</h3>
              <p className="text-xs text-gray-300 line-clamp-2">{series.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SeriesCard;
