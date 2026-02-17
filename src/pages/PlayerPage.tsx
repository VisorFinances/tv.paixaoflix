import React from 'react';
import { X } from 'lucide-react';
import Player from '../components/Player';
import { Episode } from '../types';

interface PlayerPageProps {
  episode: Episode;
  onClose: () => void;
}

const PlayerPage: React.FC<PlayerPageProps> = ({ episode, onClose }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <Player episode={episode} />
      </div>
    </div>
  );
};

export default PlayerPage;
