// PaixãoFlix Series Utilities
// Handles Archive.org series identification and processing

export interface ArchiveSeries {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  year?: number;
  rating?: string;
  genre?: string;
  archiveId: string;
  seasons: Season[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  episodeNumber: number;
  seasonNumber: number;
  videoUrl?: string;
}

/**
 * Generates a unique PaixãoFlix identifier for series
 * Format: PaixãoFlix-{archiveId}-{randomString}
 */
export const generatePaixaoFlixId = (archiveId: string): string => {
  const randomString = Math.random().toString(36).substr(2, 9);
  return `PaixãoFlix-${archiveId}-${randomString}`;
};

/**
 * Processes Archive.org series data and adds PaixãoFlix identification
 */
export const processArchiveSeries = (seriesData: any[]): ArchiveSeries[] => {
  return seriesData.map((item: any) => ({
    id: generatePaixaoFlixId(item.identificador_archive || item.archiveId || Math.random().toString(36).substr(2, 9)),
    title: cleanTitle(item.title || item.nome || ''),
    description: item.description || item.sinopse || '',
    thumbnail: item.thumbnail || item.capa || '',
    year: item.year || item.ano,
    rating: item.rating || item.avaliacao,
    genre: item.genre || item.genero,
    archiveId: item.identificador_archive || item.archiveId,
    seasons: item.seasons || []
  }));
};

/**
 * Cleans series titles from Archive.org naming conventions
 */
export const cleanTitle = (title: string): string => {
  if (!title || typeof title !== 'string') return '';
  
  return title
    .replace(/CONV_/g, '')
    .replace(/%20/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*\d+ª\s*Temporada/gi, '') // Remove " - 1ª Temporada"
    .replace(/\s*\(\d+\)/gi, '') // Remove year in parentheses
    .trim();
};

/**
 * Validates if a series has proper episode structure
 */
export const validateSeriesStructure = (series: ArchiveSeries): boolean => {
  return !!(
    series.id &&
    series.title &&
    series.archiveId &&
    series.seasons &&
    series.seasons.length > 0 &&
    series.seasons.every(season => 
      season.episodes && 
      season.episodes.length > 0 &&
      season.episodes.every(episode => 
        episode.episodeNumber && 
        episode.title
      )
    )
  );
};

/**
 * Sorts episodes by episode number within each season
 */
export const sortEpisodesInSeries = (series: ArchiveSeries): ArchiveSeries => {
  return {
    ...series,
    seasons: series.seasons.map(season => ({
      ...season,
      episodes: season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
    })).sort((a, b) => a.seasonNumber - b.seasonNumber)
  };
};

/**
 * Filters series by genre
 */
export const filterSeriesByGenre = (series: ArchiveSeries[], genre: string): ArchiveSeries[] => {
  const normalizedGenre = genre.toLowerCase();
  return series.filter(s => 
    s.genre && s.genre.toLowerCase().includes(normalizedGenre)
  );
};

/**
 * Searches series by title
 */
export const searchSeriesByTitle = (series: ArchiveSeries[], query: string): ArchiveSeries[] => {
  const normalizedQuery = query.toLowerCase();
  return series.filter(s => 
    s.title.toLowerCase().includes(normalizedQuery)
  );
};
