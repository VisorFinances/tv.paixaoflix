import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Plus } from 'lucide-react';
import { Movie, Episode } from '../types';

interface HeroBannerProps {
  movie: Movie;
  onPlay: (movie: Movie, episode?: Episode) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ movie, onPlay }) => {
  const [showInfo, setShowInfo] = useState(false);

  const handlePlay = () => {
    if (movie.type === 'series') {
      const firstEpisode = movie.seasons?.[0]?.episodes?.[0];
      if (firstEpisode) {
        onPlay(movie, firstEpisode);
      }
    } else {
      onPlay(movie);
    }
  };

  return (
    <motion.div
      className="relative h-[70vh] min-h-[400px] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background with VideoPreview functionality */}
      <div className="absolute inset-0">
        <img
          src={movie.thumbnail}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex items-center">
        <div className="max-w-2xl ml-4 md:ml-16 px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {movie.title}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-6 line-clamp-3"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {movie.description}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {movie.year && (
              <span className="text-gray-400">{movie.year}</span>
            )}
            {movie.rating && (
              <span className="text-gray-400">• {movie.rating}</span>
            )}
            {movie.duration && (
              <span className="text-gray-400">• {movie.duration}</span>
            )}
            {movie.genre && (
              <span className="text-gray-400">• {movie.genre}</span>
            )}
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              Assistir
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 bg-gray-700/70 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Info className="w-5 h-5" />
              Mais Informações
            </button>

            <button className="flex items-center gap-2 bg-gray-700/70 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              <Plus className="w-5 h-5" />
              Minha Lista
            </button>
          </motion.div>
        </div>
      </div>

      {/* Additional Info Panel */}
      {showInfo && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm p-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-2">Sinopse Completa</h3>
            <p className="text-gray-300 leading-relaxed">
              {movie.description}
            </p>
            {movie.genre && (
              <div className="mt-4">
                <span className="text-gray-400">Gêneros: </span>
                <span className="text-white">{movie.genre}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HeroBanner;
