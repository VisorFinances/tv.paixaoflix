import React from 'react';
import { Play, Plus, Check, Info } from 'lucide-react';
import { Movie, MovieCardProps } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: boolean;
  progress: any;
  onShowDetails?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPlay, onToggleFavorite, isFavorite, progress, onShowDetails }) => {
  return (
    <div className="group relative cursor-pointer transition-all duration-300 hover:scale-105">
      {/* Movie Poster */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <img
          src={movie.image || `https://via.placeholder.com/300x450/hsl(var(--muted))/000?text=${encodeURIComponent(movie.title.substring(0, 10))}`}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onClick={() => onShowDetails?.(movie)}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onPlay(movie)}
            className="w-16 h-16 bg-primary/90 hover:bg-primary text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          >
            <Play className="w-8 h-8" />
          </button>
        </div>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg truncate">{movie.title}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(movie.id); }}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-primary text-white' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                {isFavorite ? <Check className="w-4 h-4 fill-current" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              {movie.rating && (
                <span className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{movie.rating}</span>
                </span>
              )}
              {movie.year && <span>{movie.year}</span>}
              {movie.type && (
                <span className="px-2 py-1 bg-white/20 rounded text-xs">
                  {movie.type === 'movie' ? 'Filme' : 
                   movie.type === 'series' ? 'Série' : 
                   movie.type === 'documentary' ? 'Doc' : 
                   movie.type === 'kids' ? 'Kids' : movie.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Button */}
      {onShowDetails && (
        <button
          onClick={(e) => { e.stopPropagation(); onShowDetails(movie); }}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Info className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MovieCard;
