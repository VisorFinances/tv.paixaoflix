import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Episode } from '../lib/api';

interface EpisodeCardProps {
  episode: Episode;
  index: number;
  isFocused: boolean;
  onFocus: (index: number) => void;
  onClick: () => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ 
  episode, 
  index, 
  isFocused, 
  onFocus, 
  onClick
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [previewTimeout, setPreviewTimeout] = useState<number | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handleCardHover = (cardId: string) => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }

    setHoveredCard(cardId);
    
    if (episode.previewUrl) {
      const timeout = setTimeout(() => {
        setPlayingPreview(episode.id);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gray-900 rounded-lg overflow-hidden cursor-pointer group ${
        isFocused ? 'ring-2 ring-red-600' : ''
      }`}
      onClick={onClick}
      tabIndex={0}
      onMouseEnter={() => handleCardHover(episode.id)}
      onMouseLeave={handleCardLeave}
      onFocus={() => onFocus(index)}
    >
      <div className="relative aspect-video">
        {playingPreview === episode.id && episode.previewUrl ? (
          <video
            src={episode.previewUrl}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={episode.thumbnail}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Episódio {episode.number}</span>
        </div>
        <h3 className="font-semibold mb-2">{episode.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{episode.description}</p>
      </div>
    </motion.div>
  );
};

export default EpisodeCard;
