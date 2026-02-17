export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  year?: number;
  rating?: number;
  duration?: string;
  genre?: string;
  type: 'movie' | 'series';
  streamUrl?: string;
  seasons?: Season[];
  archiveId?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration?: string;
  streamUrl: string;
  thumbnail?: string;
}

export interface LiveChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  streamUrl: string;
}

export interface VideoPreviewProps {
  movie: Movie;
  onPlay: (movie: Movie, episode?: Episode) => void;
}

export interface SeriesDetailModalProps {
  series: Movie;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (movie: Movie, episode: Episode) => void;
}
