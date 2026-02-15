// Tipos TypeScript para o sistema PaixãoFlix

export type SourceFile = 'cinema' | 'favoritos' | 'filmeskids' | 'series' | 'serieskids';

export interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  backdrop?: string;
  year: number;
  genre: string[];
  type: 'movie' | 'series' | 'novela';
  rating?: string;
  duration?: string;
  streamUrl?: string;
  kids?: boolean;
  source: SourceFile;
}

// Raw shape from remote cinema/filmeskids JSON
export interface RawMovieItem {
  titulo: string;
  url: string;
  genero: string;
  year: string;
  rating: string;
  desc: string;
  poster: string;
  type: string;
}

// Raw shape from remote séries/sérieskids JSON
export interface RawSeriesItem {
  titulo: string;
  identificador_archive: string;
  genero: string;
  year: string;
  rating: string;
  desc: string;
  poster: string;
  type: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  group: string;
}

export interface ContinueWatchingItem {
  movieId: string;
  progress: number; // 0-100
  timestamp: number;
}

// Tipos adicionais para o sistema PaixãoFlix
export interface Category {
  name: string;
  count: number;
  items: Movie[];
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}

export interface SearchFilters {
  genre?: string;
  year?: number;
  type?: 'movie' | 'series' | 'novela';
  source?: SourceFile;
}

export interface NotificationConfig {
  enabled: boolean;
  position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  duration: number;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

// Tipos de eventos
export interface PlayEvent {
  movie: Movie;
  timestamp: number;
  source: 'home' | 'search' | 'category' | 'favorites';
}

export interface FavoriteEvent {
  movieId: string;
  isFavorite: boolean;
  timestamp: number;
}

export interface ProgressEvent {
  movieId: string;
  progress: number;
  currentTime: number;
  duration: number;
  timestamp: number;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Tipos de configuração
export interface AppConfig {
  apiBaseUrl: string;
  rawBaseUrl: string;
  version: string;
  debug: boolean;
  features: {
    autoNovelaCheck: boolean;
    notifications: boolean;
    analytics: boolean;
  };
}

// Tipos de erro
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Tipos de navegação
export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
  active?: boolean;
};

// Tipos de modal
export interface ModalState {
  isOpen: boolean;
  type: 'movie' | 'series' | 'settings' | 'help';
  data?: any;
}

// Tipos de categoria de conteúdo
export type ContentType = 'movie' | 'series' | 'novela' | 'documentary' | 'animation' | 'kids';

// Tipos de qualidade de vídeo
export type VideoQuality = 'auto' | '360p' | '480p' | '720p' | '1080p' | '4K';

// Tipos de legenda
export interface Subtitle {
  language: string;
  label: string;
  url: string;
  isDefault?: boolean;
}

// Tipos de áudio
export interface AudioTrack {
  language: string;
  label: string;
  url: string;
  isDefault?: boolean;
}

// Tipos de playlist
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  movies: string[];
  createdAt: number;
  updatedAt: number;
}

// Tipos de usuário
export interface UserPreferences {
  language: string;
  subtitles: boolean;
  autoplay: boolean;
  quality: VideoQuality;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationConfig;
}

// Tipos de estatísticas
export interface ViewingStats {
  totalWatchTime: number;
  moviesWatched: number;
  seriesWatched: number;
  favoriteGenres: string[];
  lastActive: number;
}

// Tipos de cache
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
}

// Tipos de download (para futuro)
export interface DownloadItem {
  id: string;
  movie: Movie;
  quality: VideoQuality;
  size: number;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  createdAt: number;
}

// Tipos de recomendação
export interface Recommendation {
  movie: Movie;
  score: number;
  reason: string;
  basedOn: 'genre' | 'history' | 'favorites' | 'similar';
}

// Tipos de filtro avançado
export interface AdvancedFilters {
  genres: string[];
  years: number[];
  rating: {
    min: number;
    max: number;
  };
  duration: {
    min: number;
    max: number;
  };
  type: ContentType[];
  source: SourceFile[];
}

// Tipos de configuração de player
export interface PlayerConfig {
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  volume: number;
  playbackRate: number;
  quality: VideoQuality;
  subtitles: Subtitle[];
  audioTracks: AudioTrack[];
}

// Tipos de sistema
export interface SystemInfo {
  browser: string;
  version: string;
  platform: string;
  language: string;
  timezone: string;
  online: boolean;
}

// Tipos de estado da aplicação
export interface AppState {
  user: {
    preferences: UserPreferences;
    stats: ViewingStats;
  };
  player: PlayerState;
  ui: {
    sidebarOpen: boolean;
    searchOpen: boolean;
    currentView: string;
    loading: boolean;
  };
  data: {
    movies: Movie[];
    channels: Channel[];
    categories: Category[];
    favorites: string[];
    continueWatching: ContinueWatchingItem[];
  };
  config: AppConfig;
}

// Interfaces legadas para compatibilidade
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
