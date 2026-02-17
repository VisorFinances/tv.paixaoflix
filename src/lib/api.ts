interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  episodes: Episode[];
}

interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  previewUrl?: string;
}

class ApiService {
  private readonly GITHUB_RAW_URL = 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main';
  
  async getSeries(): Promise<Series[]> {
    try {
      // Tenta buscar dados do GitHub primeiro
      const response = await fetch(`${this.GITHUB_RAW_URL}/series.json`);
      const data = await response.json();
      
      return data.filter((series: any) => 
        series.title && series.title.includes('PaixãoFlix')
      ).map((series: any): Series => ({
        id: series.id,
        title: series.title,
        description: series.description || '',
        thumbnail: series.thumbnail || '',
        episodes: series.episodes || []
      }));
    } catch (githubError) {
      console.warn('GitHub API failed, using local data:', githubError);
      
      // Fallback para dados locais
      try {
        const localResponse = await fetch('/series.json');
        const localData = await localResponse.json();
        
        return localData.filter((series: any) => 
          series.title && series.title.includes('PaixãoFlix')
        ).map((series: any): Series => ({
          id: series.id,
          title: series.title,
          description: series.description || '',
          thumbnail: series.thumbnail || '',
          episodes: series.episodes || []
        }));
      } catch (localError) {
        console.error('Both GitHub and local data failed:', localError);
        return [];
      }
    }
  }
  
  async getPlaylist(): Promise<string> {
    try {
      const response = await fetch(`${this.GITHUB_RAW_URL}/playlist.m3u`);
      return await response.text();
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return '';
    }
  }
  
  getEpisodeUrl(episodeId: string): string {
    return `${this.GITHUB_RAW_URL}/episodes/${episodeId}.m3u8`;
  }
  
  getPreviewUrl(episodeId: string): string {
    return `${this.GITHUB_RAW_URL}/previews/${episodeId}.mp4`;
  }
}

export const apiService = new ApiService();
export type { Series, Episode };
