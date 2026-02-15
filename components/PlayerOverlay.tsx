import React from 'react';
import { X } from 'lucide-react';
import { Movie, PlayerOverlayProps } from '../types';
import VideoPlayer from './VideoPlayer';

const PlayerOverlay: React.FC<PlayerOverlayProps> = ({ movie, onClose, onTimeUpdate }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header do player */}
      <div className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur">
        <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
        <button 
          onClick={onClose} 
          className="text-muted-foreground hover:text-foreground transition"
          aria-label="Fechar player"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Container do player */}
      <div className="flex-1 flex items-center justify-center">
        <VideoPlayer
          url={movie.streamUrl || ''}
          onTimeUpdate={(current, duration) => {
            if (duration > 0) {
              const progress = Math.round((current / duration) * 100);
              onTimeUpdate(movie.id, progress);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PlayerOverlay;
