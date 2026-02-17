import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { Episode, SeriesDetailModalProps } from '../types';

const SeriesDetailModal: React.FC<SeriesDetailModalProps> = ({ 
  series, 
  isOpen, 
  onClose, 
  onPlay 
}) => {
  if (!isOpen) return null;

  const handlePlayEpisode = (episode: Episode) => {
    onClose();
    onPlay(series, episode);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-background rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-64 md:h-96">
            <img
              src={series.thumbnail}
              alt={series.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Series Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {series.title}
              </h2>
              <p className="text-gray-300 line-clamp-2">
                {series.description}
              </p>
            </div>
          </div>

          {/* Episodes List */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold text-white mb-6">Episódios</h3>
            
            <div className="space-y-4">
              {series.seasons?.map((season) => (
                <div key={season.id} className="mb-8">
                  <h4 className="text-xl font-medium text-white mb-4">
                    Temporada {season.seasonNumber}
                  </h4>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {season.episodes.map((episode) => (
                      <motion.div
                        key={episode.id}
                        whileHover={{ scale: 1.05 }}
                        className="group cursor-pointer"
                        onClick={() => handlePlayEpisode(episode)}
                      >
                        <div className="relative bg-gray-800 rounded-lg overflow-hidden w-full">
                          {/* Episode Number */}
                          <div className="absolute top-2 left-2 z-10 bg-primary text-white text-lg font-bold px-3 py-1 rounded">
                            {episode.episodeNumber}
                          </div>
                          
                          {/* Thumbnail with 16:9 aspect ratio - Desktop 230px-260px width */}
                          <div className="relative w-full aspect-video md:w-[240px] lg:w-[260px]">
                            <img
                              src={episode.thumbnail || series.thumbnail}
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Play Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Play className="w-6 h-6 text-white ml-1" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Episode Info */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-white font-medium line-clamp-1 flex-1 text-sm">
                                {episode.title}
                              </h5>
                              {episode.duration && (
                                <span className="text-gray-400 text-sm ml-2 whitespace-nowrap">
                                  {episode.duration}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                              {episode.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SeriesDetailModal;
