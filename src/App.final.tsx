import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from './services/apiService';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useVideoPreview } from './hooks/useVideoPreview';
import { useResponsive } from './hooks/useResponsive';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';
import { Series, Episode } from './types';
import Player from './components/Player';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import ErrorBoundary from './components/ErrorBoundary';
import { Play, Home, Tv, Search, User, X, ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { mobile, tablet, desktop } = useResponsive();
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [watchHistory, setWatchHistory] = useLocalStorage<Episode[]>('watchHistory', []);
  
  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: series.length,
    gridCols: mobile ? 2 : tablet ? 3 : desktop ? 4 : 6,
    onEnter: (index) => {
      const item = series[index];
      if (item) {
        setSelectedSeries(item);
      }
    }
  });

  const { handleCardHover, handleCardLeave, playingPreview } = useVideoPreview({
    previewDelay: 1500
  });

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const data = await apiService.getSeries();
        setSeries(data);
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, []);

  const filteredSeries = series.filter(s => 
    s.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handlePlayEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsPlaying(true);
    
    setWatchHistory(prev => [
      episode,
      ...prev.filter(e => e.id !== episode.id).slice(0, 9)
    ]);
  };

  const handleBackToSeries = () => {
    setSelectedSeries(null);
    setSelectedEpisode(null);
    setIsPlaying(false);
  };

  const handleBackToHome = () => {
    setSelectedSeries(null);
    setSelectedEpisode(null);
    setIsPlaying(false);
    setSearchQuery('');
  };

  if (isPlaying && selectedEpisode) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="relative">
          <button
            onClick={handleBackToSeries}
            className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <Player episode={selectedEpisode} />
        </div>
      </div>
    );
  }

  if (selectedSeries) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={handleBackToHome}
            className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar para Séries
          </button>
          
          <h1 className="text-4xl font-bold mb-8">{selectedSeries.title}</h1>
          <p className="text-gray-300 mb-8">{selectedSeries.description}</p>
          
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            onKeyDown={(e) => {
              const episodeGridCols = mobile ? 1 : tablet ? 2 : 3;
              const itemCount = selectedSeries.episodes.length;
              
              switch (e.key) {
                case 'ArrowRight':
                  e.preventDefault();
                  break;
                case 'ArrowLeft':
                  e.preventDefault();
                  break;
                case 'ArrowDown':
                  e.preventDefault();
                  break;
                case 'ArrowUp':
                  e.preventDefault();
                  break;
              }
            }}
          >
            {selectedSeries.episodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handlePlayEpisode(episode)}
                onMouseEnter={() => handleCardHover(episode.id, !!episode.previewUrl)}
                onMouseLeave={handleCardLeave}
                tabIndex={0}
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
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white">
        <div className="relative h-[70vh] bg-gradient-to-b from-gray-900 to-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent"
              >
                PaixãoFlix
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-300 mb-8"
              >
                As melhores séries para você
              </motion.p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar séries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {filteredSeries.length === 0 ? (
            <EmptyState
              title="Nenhuma série encontrada"
              description="Tente buscar com outros termos."
            />
          ) : (
            <div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              onKeyDown={handleKeyDown}
            >
              {filteredSeries.map((seriesItem, index) => (
                <motion.div
                  key={seriesItem.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => handleCardHover(seriesItem.id, !!seriesItem.previewUrl)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => setSelectedSeries(seriesItem)}
                  className={`relative cursor-pointer group ${
                    focusedIndex === index ? 'ring-2 ring-red-600 rounded-lg' : ''
                  }`}
                  tabIndex={0}
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden">
                    {playingPreview === seriesItem.id && seriesItem.previewUrl ? (
                      <video
                        src={seriesItem.previewUrl}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={seriesItem.thumbnail}
                        alt={seriesItem.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <AnimatePresence>
                      {playingPreview === seriesItem.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/80 flex flex-col justify-end p-4"
                        >
                          <h3 className="font-semibold text-sm mb-1">{seriesItem.title}</h3>
                          <p className="text-xs text-gray-300 line-clamp-2">{seriesItem.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {mobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
            <div className="flex justify-around py-2">
              <button className="flex flex-col items-center p-2 text-red-600">
                <Home className="w-6 h-6" />
                <span className="text-xs mt-1">Início</span>
              </button>
              <button className="flex flex-col items-center p-2 text-gray-400">
                <Tv className="w-6 h-6" />
                <span className="text-xs mt-1">Séries</span>
              </button>
              <button className="flex flex-col items-center p-2 text-gray-400">
                <Search className="w-6 h-6" />
                <span className="text-xs mt-1">Buscar</span>
              </button>
              <button className="flex flex-col items-center p-2 text-gray-400">
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Perfil</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
