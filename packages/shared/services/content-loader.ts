import { Content, ContentType } from '../types';

// API TMDB Configuration
export const TMDB_CONFIG = {
  API_KEY: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  LANGUAGE: 'pt-BR',
};

// Data Sources Configuration
export const DATA_SOURCES = {
  // Local data files
  MOVIES: '/data/filmes.json',
  SERIES: '/data/series.json',
  FAVORITES: '/data/favoritos.json',
  KIDS_MOVIES: '/data/kids_filmes.json',
  KIDS_SERIES: '/data/kids_series.json',
  
  // Live channels
  LIVE_CHANNELS: '/data/ativa_canais.m3u',
  KIDS_CHANNELS: '/data/ativa_kids_canais.m3u',
};

// Content Loader Service
export class ContentLoaderService {
  private cache: Map<string, any> = new Map();
  
  constructor() {
    this.preloadData();
  }
  
  private async preloadData() {
    try {
      // Preload local JSON data
      const [movies, series, favorites, kidsMovies, kidsSeries] = await Promise.all([
        this.fetchJson(DATA_SOURCES.MOVIES),
        this.fetchJson(DATA_SOURCES.SERIES),
        this.fetchJson(DATA_SOURCES.FAVORITES),
        this.fetchJson(DATA_SOURCES.KIDS_MOVIES),
        this.fetchJson(DATA_SOURCES.KIDS_SERIES),
      ]);
      
      this.cache.set('movies', movies);
      this.cache.set('series', series);
      this.cache.set('favorites', favorites);
      this.cache.set('kidsMovies', kidsMovies);
      this.cache.set('kidsSeries', kidsSeries);
      
      // Preload M3U channels
      const [liveChannels, kidsChannels] = await Promise.all([
        this.fetchM3U(DATA_SOURCES.LIVE_CHANNELS),
        this.fetchM3U(DATA_SOURCES.KIDS_CHANNELS),
      ]);
      
      this.cache.set('liveChannels', liveChannels);
      this.cache.set('kidsChannels', kidsChannels);
      
      console.log('✅ Content data preloaded successfully');
    } catch (error) {
      console.error('❌ Error preloading content data:', error);
    }
  }
  
  private async fetchJson(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
  }
  
  private async fetchM3U(url: string): Promise<any[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const text = await response.text();
    return this.parseM3U(text);
  }
  
  private parseM3U(m3uText: string): any[] {
    const lines = m3uText.split('\n');
    const channels = [];
    let currentChannel: any = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        const parts = line.split(',');
        const namePart = parts[parts.length - 1];
        currentChannel.name = namePart.trim();
        
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        if (logoMatch && logoMatch[1]) {
          currentChannel.logo = logoMatch[1].trim();
        }
        
        const groupMatch = line.match(/group-title="([^"]*)"/);
        if (groupMatch && groupMatch[1]) {
          currentChannel.group = groupMatch[1].trim();
        }
      } else if (line && !line.startsWith('#')) {
        currentChannel.url = line.trim();
        channels.push({...currentChannel});
        currentChannel = {};
      }
    }
    
    return channels;
  }
  
  // Get methods
  public getMovies(): Content[] {
    return this.cache.get('movies') || [];
  }
  
  public getSeries(): Content[] {
    return this.cache.get('series') || [];
  }
  
  public getKidsMovies(): Content[] {
    return this.cache.get('kidsMovies') || [];
  }
  
  public getKidsSeries(): Content[] {
    return this.cache.get('kidsSeries') || [];
  }
  
  public getLiveChannels(): any[] {
    return this.cache.get('liveChannels') || [];
  }
  
  public getKidsChannels(): any[] {
    return this.cache.get('kidsChannels') || [];
  }
  
  public getFavorites(): string[] {
    return this.cache.get('favorites') || [];
  }
  
  public getAllContent(): Content[] {
    return [
      ...this.getMovies(),
      ...this.getSeries(),
      ...this.getKidsMovies(),
      ...this.getKidsSeries(),
    ];
  }
  
  public getContentByType(type: ContentType): Content[] {
    switch (type) {
      case 'movie':
        return this.getMovies();
      case 'series':
        return this.getSeries();
      case 'channel':
        return this.getLiveChannels().map(channel => ({
          id: channel.name,
          title: channel.name,
          description: `Canal ao vivo - ${channel.group}`,
          type: 'channel' as ContentType,
          genre: [channel.group],
          rating: 0,
          thumbnail: channel.logo,
          poster: channel.logo,
          backdrop: channel.logo,
          releaseDate: new Date(),
          language: ['pt-BR'],
          subtitles: [],
          quality: [],
          cast: [],
          director: '',
          tags: [channel.group],
          isPremium: false,
          isLive: true,
          metadata: {
            tmdbId: 0,
            imdbId: '',
            year: new Date().getFullYear(),
            country: 'Brasil',
          },
        }));
      default:
        return [];
    }
  }
  
  public searchContent(query: string): Content[] {
    const allContent = this.getAllContent();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return [];
    
    return allContent.filter(content => 
      content.title.toLowerCase().includes(searchTerm) ||
      content.description.toLowerCase().includes(searchTerm) ||
      content.genre.some(g => g.toLowerCase().includes(searchTerm)) ||
      content.tags.some(t => t.toLowerCase().includes(searchTerm))
    );
  }
  
  public getTrendingContent(limit: number = 10): Content[] {
    const allContent = this.getAllContent();
    return allContent
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
  
  public getContentByGenre(genre: string, limit: number = 20): Content[] {
    const allContent = this.getAllContent();
    return allContent
      .filter(content => content.genre.includes(genre))
      .slice(0, limit);
  }
  
  public getNewReleases(limit: number = 10): Content[] {
    const allContent = this.getAllContent();
    const currentYear = new Date().getFullYear();
    
    return allContent
      .filter(content => content.metadata.year === currentYear)
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, limit);
  }
  
  public getPremiumContent(limit: number = 10): Content[] {
    const allContent = this.getAllContent();
    return allContent
      .filter(content => content.isPremium)
      .slice(0, limit);
  }
  
  public getFreeContent(limit: number = 10): Content[] {
    const allContent = this.getAllContent();
    return allContent
      .filter(content => !content.isPremium)
      .slice(0, limit);
  }
  
  // TMDB Integration
  public async getTMDBContent(type: 'movie' | 'tv', id: number): Promise<any> {
    const url = `${TMDB_CONFIG.BASE_URL}/${type}/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching TMDB content:', error);
      return null;
    }
  }
  
  public async searchTMDB(query: string, type: 'movie' | 'tv' = 'movie'): Promise<any[]> {
    const url = `${TMDB_CONFIG.BASE_URL}/search/${type}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&query=${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching TMDB:', error);
      return [];
    }
  }
  
  public getTMDBImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '';
    return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
  }
  
  // Cache management
  public clearCache(): void {
    this.cache.clear();
  }
  
  public refreshCache(): void {
    this.clearCache();
    this.preloadData();
  }
}
