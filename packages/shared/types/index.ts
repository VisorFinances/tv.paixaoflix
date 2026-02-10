// Core types for PaixãoFlix Streaming Platform

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: Subscription;
  preferences: UserPreferences;
  watchHistory: WatchHistoryItem[];
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  type: 'free' | 'premium' | 'family';
  status: 'active' | 'cancelled' | 'expired';
  expiresAt?: Date;
  features: string[];
}

export interface UserPreferences {
  language: string;
  subtitles: boolean;
  autoplay: boolean;
  quality: 'auto' | 'low' | 'medium' | 'high' | '4k';
  theme: 'light' | 'dark' | 'auto';
}

export interface WatchHistoryItem {
  id: string;
  contentId: string;
  watchedAt: Date;
  progress: number; // 0-100
  duration: number; // seconds
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'series' | 'documentary' | 'live' | 'channel';
  genre: string[];
  rating: number;
  duration?: number; // seconds for movies
  seasons?: Season[]; // for series
  thumbnail: string;
  poster: string;
  backdrop: string;
  releaseDate: Date;
  language: string[];
  subtitles: Subtitle[];
  quality: Quality[];
  cast?: Cast[];
  director?: string;
  tags: string[];
  isPremium: boolean;
  isLive: boolean;
  metadata: ContentMetadata;
}

export interface Season {
  id: string;
  number: number;
  title: string;
  description: string;
  episodes: Episode[];
  releaseDate: Date;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  subtitles: Subtitle[];
  airDate: Date;
}

export interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
  format: 'vtt' | 'srt' | 'ass';
}

export interface Quality {
  label: string;
  url: string;
  width: number;
  height: number;
  bitrate: number;
  format: 'hls' | 'dash' | 'mp4';
}

export interface Cast {
  id: string;
  name: string;
  character: string;
  avatar: string;
}

export interface ContentMetadata {
  tmdbId?: number;
  imdbId?: string;
  year: number;
  country: string;
  budget?: number;
  revenue?: number;
  awards?: string[];
  trivia?: string[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  content: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  type?: ContentType[];
  genre?: string[];
  year?: number[];
  rating?: number;
  language?: string[];
  quality?: Quality[];
  isPremium?: boolean;
}

export type ContentType = 'movie' | 'series' | 'documentary' | 'live' | 'channel';

export interface PlatformConfig {
  name: string;
  version: string;
  platform: Platform;
  features: PlatformFeature[];
  limitations: PlatformLimitation[];
}

export type Platform = 'web' | 'mobile' | 'tv' | 'desktop' | 'tizen' | 'webos' | 'roku' | 'apple-tv' | 'fire-tv';

export interface PlatformFeature {
  name: string;
  supported: boolean;
  version?: string;
}

export interface PlatformLimitation {
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface PlayerConfig {
  autoplay: boolean;
  quality: string;
  subtitles: boolean;
  volume: number;
  playbackRate: number;
  theaterMode: boolean;
  pictureInPicture: boolean;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  platform: Platform;
}
