import { useState, useEffect } from 'react';
import { Movie, LiveChannel } from '../types';

const BASE_URL = 'https://tv.paixaoflix.vip';

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch movies
        const moviesResponse = await fetch(`${BASE_URL}/cinema.json`);
        const moviesData = await moviesResponse.json();
        
        // Fetch series
        const seriesResponse = await fetch(`${BASE_URL}/séries.json`);
        const seriesData = await seriesResponse.json();
        
        // Fetch live channels
        const channelsResponse = await fetch(`${BASE_URL}/canaisaovivo.m3u8`);
        const channelsText = await channelsResponse.text();
        const parsedChannels = parseM3U(channelsText);
        
        // Process movies data
        const processedMovies = moviesData.map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          title: cleanTitle(item.title || item.nome),
          description: item.description || item.sinopse || '',
          thumbnail: item.thumbnail || item.capa || '',
          year: item.year || item.ano,
          rating: item.rating || item.avaliacao,
          duration: item.duration || item.duracao,
          genre: item.genre || item.genero,
          type: 'movie' as const,
          streamUrl: item.streamUrl || item.url,
          archiveId: item.archiveId
        }));
        
        // Process series data with PaixãoFlix identifier
        const processedSeries = seriesData.map((item: any) => ({
          id: `PaixãoFlix-${item.id || Math.random().toString(36).substr(2, 9)}`,
          title: cleanTitle(item.title || item.nome),
          description: item.description || item.sinopse || '',
          thumbnail: item.thumbnail || item.capa || '',
          year: item.year || item.ano,
          rating: item.rating || item.avaliacao,
          genre: item.genre || item.genero,
          type: 'series' as const,
          archiveId: item.archiveId,
          seasons: item.seasons || []
        }));
        
        setMovies(processedMovies);
        setSeries(processedSeries);
        setLiveChannels(parsedChannels);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseM3U = (content: string): LiveChannel[] => {
    const lines = content.split('\n');
    const channels: LiveChannel[] = [];
    let currentChannel: Partial<LiveChannel> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        const match = line.match(/tvg-logo="([^"]*)".*?,(.*)/);
        if (match) {
          currentChannel = {
            logo: match[1],
            name: match[2],
            id: Math.random().toString(36).substr(2, 9)
          };
        }
      } else if (line && !line.startsWith('#') && currentChannel.name) {
        currentChannel.streamUrl = line;
        currentChannel.group = 'Live TV';
        channels.push(currentChannel as LiveChannel);
        currentChannel = {};
      }
    }
    
    return channels;
  };

  const cleanTitle = (title: string): string => {
    return title
      .replace(/CONV_/g, '')
      .replace(/%20/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const deduplicateByTitle = (items: Movie[]): Movie[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      const cleanTitle = item.title.toLowerCase().replace(/\s+(temporalada\s+\d+|season\s+\d+)$/i, '');
      if (seen.has(cleanTitle)) return false;
      seen.add(cleanTitle);
      return true;
    });
  };

  return {
    movies: deduplicateByTitle(movies),
    series: deduplicateByTitle(series),
    liveChannels,
    loading,
    error
  };
};
