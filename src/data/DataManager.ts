// Sistema de Conexão de Dados PaixãoFlix
// Atualização automática a cada 21 minutos

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

class DataManager {
  private static instance: DataManager;
  private updateInterval: number | null = null;
  private readonly UPDATE_INTERVAL = 21 * 60 * 1000; // 21 minutos em milissegundos
  
  // URLs dos dados
  private readonly DATA_URLS = {
    cinema: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/cinema.json',
    canaisAoVivo: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/canaisaovivo.m3u8',
    favoritos: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/favoritos.json',
    filmesKids: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/filmeskids.json',
    series: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/s%C3%A9ries.json',
    seriesKids: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/s%C3%A9rieskids.json',
    novelas: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/novelas.json'
  };

  // Cache local
  private cache = {
    cinema: [] as Movie[],
    canaisAoVivo: [] as Channel[],
    favoritos: [] as Favorite[],
    filmesKids: [] as Movie[],
    series: [] as Series[],
    seriesKids: [] as Series[],
    novelas: [] as Series[],
    lastUpdate: 0
  };

  private constructor() {
    this.initializeAutoUpdate();
  }

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchJson<T>(url: string): Promise<T> {
    try {
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar dados de ${url}:`, error);
      throw error;
    }
  }

  private async fetchM3U8(url: string): Promise<Channel[]> {
    try {
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      return this.parseM3U8(text);
    } catch (error) {
      console.error(`Erro ao buscar M3U8 de ${url}:`, error);
      throw error;
    }
  }

  private parseM3U8(content: string): Channel[] {
    const channels: Channel[] = [];
    const lines = content.split('\n');
    let currentChannel: Partial<Channel> = {};
    let channelId = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('#EXTINF:')) {
        const parts = trimmedLine.split(',');
        const name = parts[1] || '';
        const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
        const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
        const categoryMatch = trimmedLine.match(/tvg-category="([^"]+)"/);
        
        currentChannel = {
          id: `channel_${channelId++}`,
          name: name,
          logo: logoMatch?.[1] || '',
          group: groupMatch?.[1] || 'Sem Categoria',
          category: categoryMatch?.[1] || 'Geral'
        };
      } else if (trimmedLine && !trimmedLine.startsWith('#') && currentChannel.name) {
        currentChannel.streamUrl = trimmedLine;
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }

    return channels;
  }

  public async updateAllData(): Promise<void> {
    console.log('🔄 Iniciando atualização de dados...');
    
    try {
      // Atualizar todos os dados em paralelo
      const [
        cinemaData,
        canaisData,
        favoritosData,
        filmesKidsData,
        seriesData,
        seriesKidsData,
        novelasData
      ] = await Promise.allSettled([
        this.fetchJson<Movie[]>(this.DATA_URLS.cinema),
        this.fetchM3U8(this.DATA_URLS.canaisAoVivo),
        this.fetchJson<Favorite[]>(this.DATA_URLS.favoritos),
        this.fetchJson<Movie[]>(this.DATA_URLS.filmesKids),
        this.fetchJson<Series[]>(this.DATA_URLS.series),
        this.fetchJson<Series[]>(this.DATA_URLS.seriesKids),
        this.fetchJson<Series[]>(this.DATA_URLS.novelas)
      ]);

      // Atualizar cache com dados que foram buscados com sucesso
      if (cinemaData.status === 'fulfilled') {
        this.cache.cinema = cinemaData.value;
        console.log(`✅ Cinema atualizado: ${cinemaData.value.length} filmes`);
      }

      if (canaisData.status === 'fulfilled') {
        this.cache.canaisAoVivo = canaisData.value;
        console.log(`✅ Canais ao vivo atualizados: ${canaisData.value.length} canais`);
      }

      if (favoritosData.status === 'fulfilled') {
        this.cache.favoritos = favoritosData.value;
        console.log(`✅ Favoritos atualizados: ${favoritosData.value.length} itens`);
      }

      if (filmesKidsData.status === 'fulfilled') {
        this.cache.filmesKids = filmesKidsData.value;
        console.log(`✅ Filmes Kids atualizados: ${filmesKidsData.value.length} filmes`);
      }

      if (seriesData.status === 'fulfilled') {
        this.cache.series = seriesData.value;
        console.log(`✅ Séries atualizadas: ${seriesData.value.length} séries`);
      }

      if (seriesKidsData.status === 'fulfilled') {
        this.cache.seriesKids = seriesKidsData.value;
        console.log(`✅ Séries Kids atualizadas: ${seriesKidsData.value.length} séries`);
      }

      if (novelasData.status === 'fulfilled') {
        this.cache.novelas = novelasData.value;
        console.log(`✅ Novelas atualizadas: ${novelasData.value.length} novelas`);
      }

      this.cache.lastUpdate = Date.now();
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('dataUpdated', {
        detail: {
          timestamp: this.cache.lastUpdate,
          data: this.cache
        }
      }));

      console.log('🎉 Atualização de dados concluída com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante atualização de dados:', error);
    }
  }

  private initializeAutoUpdate(): void {
    // Primeira atualização imediata
    this.updateAllData();
    
    // Configurar atualização automática a cada 21 minutos
    this.updateInterval = setInterval(() => {
      this.updateAllData();
    }, this.UPDATE_INTERVAL);

    console.log(`⏰ Sistema de atualização automática configurado: ${this.UPDATE_INTERVAL / 60000} minutos`);
  }

  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️ Sistema de atualização automática parado');
    }
  }

  public restartAutoUpdate(): void {
    this.stopAutoUpdate();
    this.initializeAutoUpdate();
  }

  // Getters para acessar os dados
  public getCinema(): Movie[] {
    return this.cache.cinema;
  }

  public getCanaisAoVivo(): Channel[] {
    return this.cache.canaisAoVivo;
  }

  public getFavoritos(): Favorite[] {
    return this.cache.favoritos;
  }

  public getFilmesKids(): Movie[] {
    return this.cache.filmesKids;
  }

  public getSeries(): Series[] {
    return this.cache.series;
  }

  public getSeriesKids(): Series[] {
    return this.cache.seriesKids;
  }

  public getNovelas(): Series[] {
    return this.cache.novelas;
  }

  public getLastUpdateTime(): number {
    return this.cache.lastUpdate;
  }

  public isDataFresh(): boolean {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.cache.lastUpdate;
    return timeSinceLastUpdate < this.UPDATE_INTERVAL;
  }

  // Métodos de busca
  public searchMovies(query: string): Movie[] {
    const allMovies = [...this.cache.cinema, ...this.cache.filmesKids];
    return allMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.description.toLowerCase().includes(query.toLowerCase()) ||
      movie.genre.toLowerCase().includes(query.toLowerCase())
    );
  }

  public searchSeries(query: string): Series[] {
    const allSeries = [...this.cache.series, ...this.cache.seriesKids, ...this.cache.novelas];
    return allSeries.filter(series => 
      series.title.toLowerCase().includes(query.toLowerCase()) ||
      series.description.toLowerCase().includes(query.toLowerCase()) ||
      series.genre.toLowerCase().includes(query.toLowerCase())
    );
  }

  public searchChannels(query: string): Channel[] {
    return this.cache.canaisAoVivo.filter(channel => 
      channel.name.toLowerCase().includes(query.toLowerCase()) ||
      channel.group.toLowerCase().includes(query.toLowerCase()) ||
      channel.category.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export default DataManager;
