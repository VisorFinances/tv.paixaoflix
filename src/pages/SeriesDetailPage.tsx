import React from 'react';
import { ChevronLeft } from 'lucide-react';
import EpisodeCard from '../components/EpisodeCard';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { Series, Episode } from '../types';

interface SeriesDetailPageProps {
  series: Series;
  onBack: () => void;
  onEpisodeSelect: (episode: Episode) => void;
}

const SeriesDetailPage: React.FC<SeriesDetailPageProps> = ({
  series,
  onBack,
  onEpisodeSelect
}) => {
  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: series.episodes.length,
    gridCols: 3,
    onEnter: (index) => onEpisodeSelect(series.episodes[index])
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar para Séries
        </button>
        
        <h1 className="text-4xl font-bold mb-8">{series.title}</h1>
        <p className="text-gray-300 mb-8">{series.description}</p>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          onKeyDown={handleKeyDown}
        >
          {series.episodes.map((episode, index) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              index={index}
              isFocused={focusedIndex === index}
              onFocus={() => {}}
              onClick={() => onEpisodeSelect(episode)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailPage;
