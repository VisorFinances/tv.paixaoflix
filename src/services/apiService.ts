import { Series, Episode, ApiResponse } from '../types';
import { GITHUB_RAW_URL } from '../utils/constants';

class ApiService {
  private readonly baseUrl = GITHUB_RAW_URL;

  async getSeries(): Promise<Series[]> {
    try {
      const response = await fetch(`${this.baseUrl}/series.json`);
      const data = await response.json();
      
      return data.filter((series: any) => 
        series.title && series.title.includes('PaixãoFlix')
      ).map((series: any): Series => ({
        id: series.id,
        title: series.title,
        description: series.description || '',
        thumbnail: series.thumbnail || '',
        previewUrl: series.previewUrl,
        episodes: series.episodes || []
      }));
    } catch (error) {
      console.error('Error fetching series:', error);
      return [];
    }
  }

  async getPlaylist(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/playlist.m3u`);
      return await response.text();
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return '';
    }
  }

  getEpisodeUrl(episodeId: string): string {
    return `${this.baseUrl}/episodes/${episodeId}.m3u8`;
  }

  getPreviewUrl(episodeId: string): string {
    return `${this.baseUrl}/previews/${episodeId}.mp4`;
  }

  async getSeriesById(id: string): Promise<Series | null> {
    const series = await this.getSeries();
    return series.find(s => s.id === id) || null;
  }

  async getEpisodeById(seriesId: string, episodeId: string): Promise<Episode | null> {
    const series = await this.getSeriesById(seriesId);
    if (!series) return null;
    
    return series.episodes.find(e => e.id === episodeId) || null;
  }
}

export const apiService = new ApiService();
