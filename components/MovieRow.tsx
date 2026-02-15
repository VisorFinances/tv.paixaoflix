import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, MovieRowProps } from '../types';
import MovieCard from './MovieCard';

const MovieRow: React.FC<MovieRowProps> = ({ title, subtitle, movies, onPlay, onToggleFavorite, favorites, continueWatching, onShowDetails }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="px-4 md:px-12 mb-3">
        <h2 className="text-2xl md:text-3xl font-display tracking-wider text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      
      <div className="relative group/row">
        {/* Botão de navegação esquerda */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 bg-gradient-to-r from-background/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Container de cards com scroll */}
        <div 
          ref={scrollRef} 
          className="flex gap-3 overflow-x-auto px-4 md:px-12 pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(movie.id)}
              progress={continueWatching?.[movie.id]}
              onShowDetails={onShowDetails}
            />
          ))}
        </div>
        
        {/* Botão de navegação direita */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 bg-gradient-to-l from-background/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};

export default MovieRow;
