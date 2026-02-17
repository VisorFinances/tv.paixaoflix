export interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  previewUrl?: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  previewUrl?: string;
}

export interface ApiResponse {
  series: Series[];
  playlist: string;
}
