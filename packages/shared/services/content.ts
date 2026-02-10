import { Content, User, SearchFilters, APIResponse, ContentType } from '../types';

export class ContentService {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async getPopular(limit: number = 20): Promise<APIResponse<Content[]>> {
    const response = await fetch(`${this.baseURL}/content/popular?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async getTrending(limit: number = 20): Promise<APIResponse<Content[]>> {
    const response = await fetch(`${this.baseURL}/content/trending?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async getByGenre(genre: string, limit: number = 20): Promise<APIResponse<Content[]>> {
    const response = await fetch(`${this.baseURL}/content/genre/${genre}?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async search(query: string, filters?: SearchFilters): Promise<APIResponse<Content[]>> {
    const params = new URLSearchParams({
      q: query,
      ...(filters && {
        type: filters.type?.join(','),
        genre: filters.genre?.join(','),
        year: filters.year?.join(','),
        rating: filters.rating?.toString(),
        language: filters.language?.join(','),
        isPremium: filters.isPremium?.toString(),
      }),
    });

    const response = await fetch(`${this.baseURL}/content/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async getById(id: string): Promise<APIResponse<Content>> {
    const response = await fetch(`${this.baseURL}/content/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<APIResponse<Content[]>> {
    const response = await fetch(`${this.baseURL}/content/recommendations/${userId}?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async getContinueWatching(userId: string): Promise<APIResponse<Content[]>> {
    const response = await fetch(`${this.baseURL}/content/continue-watching/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async addToWatchHistory(userId: string, contentId: string, progress: number): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/watch-history`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId,
        progress,
        timestamp: new Date().toISOString(),
      }),
    });
    
    return response.json();
  }

  async addToFavorites(userId: string, contentId: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId,
      }),
    });
    
    return response.json();
  }

  async removeFromFavorites(userId: string, contentId: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/favorites/${contentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async getFavorites(userId: string): Promise<APIResponse<Content[]>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/favorites`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }
}
