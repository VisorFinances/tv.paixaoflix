export interface Movie {
  id: string;
  title: string;
  year?: number;
  rating?: number;
  type: 'movie' | 'series' | 'documentary' | 'kids';
  poster?: string;
  backdrop?: string;
  description?: string;
  genre?: string;
  duration?: number;
  seasons?: number;
  episodes?: Episode[];
  url?: string;
  identificador_archive?: string;
}

export interface Episode {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  url?: string;
  season?: number;
  episode?: number;
}

export interface CategoryGridProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onToggleFavorite: (movieId: string) => void;
  favorites: string[];
  onBack: () => void;
  onShowDetails?: (movie: Movie) => void;
}
