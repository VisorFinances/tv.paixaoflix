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
      // Dados de exemplo para teste enquanto o repositório não tem dados
      const mockData: Series[] = [
        {
          id: '1',
          title: 'PaixãoFlix - Aventuras',
          description: 'Série de aventuras emocionantes com episódios cheios de ação e mistério.',
          thumbnail: 'https://picsum.photos/300/450?random=1',
          episodes: [
            {
              id: 'ep1',
              number: 1,
              title: 'O Início da Jornada',
              description: 'Primeiro episódio da série de aventuras do PaixãoFlix.',
              thumbnail: 'https://picsum.photos/640/360?random=2',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            },
            {
              id: 'ep2',
              number: 2,
              title: 'O Desafio',
              description: 'Segundo episódio com novos desafios para os heróis.',
              thumbnail: 'https://picsum.photos/640/360?random=3',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
            },
            {
              id: 'ep3',
              number: 3,
              title: 'A Revelação',
              description: 'Terceiro episódio com reviravoltas surpreendentes.',
              thumbnail: 'https://picsum.photos/640/360?random=4',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            }
          ]
        },
        {
          id: '2',
          title: 'PaixãoFlix - Comédia',
          description: 'Série de comédia leve e divertida para toda família.',
          thumbnail: 'https://picsum.photos/300/450?random=5',
          episodes: [
            {
              id: 'ep4',
              number: 1,
              title: 'O Primeiro Dia',
              description: 'Primeiro episódio da série de comédia do PaixãoFlix.',
              thumbnail: 'https://picsum.photos/640/360?random=6',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            },
            {
              id: 'ep5',
              number: 2,
              title: 'Uma Confusão Engraçada',
              description: 'Segundo episódio com situações cômicas inesperadas.',
              thumbnail: 'https://picsum.photos/640/360?random=7',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
            }
          ]
        }
      ];

      // Tenta buscar dados do GitHub, mas usa mock se falhar
      try {
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
        console.warn('GitHub API failed, using mock data:', githubError);
        return mockData;
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      return [];
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
