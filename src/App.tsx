import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService, Series, Episode } from './lib/api';
import { Play, Home, Tv, Search, User, X, ChevronLeft } from 'lucide-react';
import Player from './components/Player';

function App() {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [previewTimeout, setPreviewTimeout] = useState<number | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSeries = async () => {
      const data = await apiService.getSeries();
      setSeries(data);
    };
    loadSeries();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredSeries = series.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsPlaying(true);
  };

  const handleBackToSeries = () => {
    setSelectedSeries(null);
    setSelectedEpisode(null);
    setIsPlaying(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemCount: number, isEpisodeGrid = false) => {
    const gridCols = isMobile ? 2 : isEpisodeGrid ? 3 : 6;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = focusedIndex + gridCols;
        if (nextIndex < itemCount) {
          setFocusedIndex(nextIndex);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = focusedIndex - gridCols;
        if (prevIndex >= 0) {
          setFocusedIndex(prevIndex);
        }
        break;
      case 'Enter':
        e.preventDefault();
        const focusedElement = document.activeElement as HTMLElement;
        focusedElement?.click();
        break;
    }
  };

  const handleCardHover = (cardId: string, episode?: Episode) => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }

    setHoveredCard(cardId);
    
    if (episode && episode.previewUrl) {
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

  if (isPlaying && selectedEpisode) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="relative">
          <button
            onClick={() => setIsPlaying(false)}
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
            onClick={handleBackToSeries}
            className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar para Séries
          </button>
          
          <h1 className="text-4xl font-bold mb-8">{selectedSeries.title}</h1>
          <p className="text-gray-300 mb-8">{selectedSeries.description}</p>
          
          <div 
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            onKeyDown={(e) => handleKeyDown(e, selectedSeries.episodes.length, true)}
          >
            {selectedSeries.episodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                className={`bg-gray-900 rounded-lg overflow-hidden cursor-pointer group ${
                  focusedIndex === index ? 'ring-2 ring-red-600' : ''
                }`}
                onClick={() => handlePlayEpisode(episode)}
                tabIndex={0}
                onMouseEnter={() => handleCardHover(episode.id, episode)}
                onMouseLeave={handleCardLeave}
                onFocus={() => setFocusedIndex(index)}
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
        
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroBanner />
      
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

        <div 
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          onKeyDown={(e) => handleKeyDown(e, filteredSeries.length)}
        >
          {filteredSeries.map((seriesItem, index) => (
            <motion.div
              key={seriesItem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredCard(seriesItem.id)}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => setSelectedSeries(seriesItem)}
              className={`relative cursor-pointer group ${
                focusedIndex === index ? 'ring-2 ring-red-600 rounded-lg' : ''
              }`}
              tabIndex={0}
              onFocus={() => setFocusedIndex(index)}
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden">
                <img
                  src={seriesItem.thumbnail}
                  alt={seriesItem.title}
                  className="w-full h-full object-cover"
                />
                <AnimatePresence>
                  {hoveredCard === seriesItem.id && (
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
      </div>
      
      {isMobile && <BottomNavigation />}
    </div>
  );
}

function HeroBanner() {
  return (
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
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 md:hidden">
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
  );
}

export default App;
