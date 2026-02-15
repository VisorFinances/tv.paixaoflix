// Tipos compartilhados do PaixãoFlix
export interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  genre: string;
  year: number;
  rating: number;
  duration: string;
  streamUrl: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  genre: string;
  year: number;
  rating: number;
  seasons: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
  streamUrl: string;
  duration: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  streamUrl: string;
  category: string;
}

export interface Favorite {
  id: string;
  type: 'movie' | 'series' | 'channel';
  itemId: string;
  addedAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'channel';
  poster?: string;
  logo?: string;
  backdrop?: string;
  genre?: string;
  category?: string;
  group?: string;
  year?: number;
  rating?: number;
  duration?: string;
  seasons?: number;
  streamUrl: string;
  description?: string;
}

export interface SearchFilters {
  type?: 'all' | 'movie' | 'series' | 'channel';
  genre?: string;
  year?: number;
  rating?: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
}

export interface UserPreferences {
  autoplay: boolean;
  quality: 'auto' | 'low' | 'medium' | 'high';
  subtitles: boolean;
  language: 'pt-BR' | 'en' | 'es';
}

export interface UIState {
  sidebarOpen: boolean;
  currentSection: string;
  searchQuery: string;
  selectedContent: ContentItem | null;
  playerOpen: boolean;
}
