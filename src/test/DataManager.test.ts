// Teste de exemplo para o DataManager
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataManager from '../data/DataManager.js';

// Mock do fetch global
global.fetch = vi.fn();

describe('DataManager', () => {
  let dataManager: DataManager;

  beforeEach(() => {
    vi.clearAllMocks();
    dataManager = DataManager.getInstance();
  });

  describe('Inicialização', () => {
    it('deve criar uma instância singleton', () => {
      const instance1 = DataManager.getInstance();
      const instance2 = DataManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('deve inicializar com cache vazio', () => {
      expect(dataManager.getCinema()).toEqual([]);
      expect(dataManager.getSeries()).toEqual([]);
      expect(dataManager.getCanaisAoVivo()).toEqual([]);
    });
  });

  describe('Busca de dados', () => {
    it('deve buscar dados de cinema', async () => {
      const mockMovies = [
        {
          id: '1',
          title: 'Test Movie',
          description: 'Test Description',
          poster: 'test.jpg',
          backdrop: 'test-backdrop.jpg',
          genre: 'Action',
          year: 2023,
          rating: 8.5,
          duration: '120 min',
          streamUrl: 'http://test.com/stream'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovies
      });

      await dataManager.updateAllData();
      
      expect(dataManager.getCinema()).toEqual(mockMovies);
    });

    it('deve lidar com erros de busca', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await dataManager.updateAllData();
      
      expect(dataManager.getCinema()).toEqual([]);
    });
  });

  describe('Funcionalidades de busca', () => {
    it('deve buscar filmes por título', () => {
      const mockMovies = [
        { id: '1', title: 'Action Movie', genre: 'Action', year: 2023, rating: 8.5, duration: '120 min', poster: '', backdrop: '', description: '', streamUrl: '' },
        { id: '2', title: 'Comedy Movie', genre: 'Comedy', year: 2023, rating: 7.5, duration: '90 min', poster: '', backdrop: '', description: '', streamUrl: '' }
      ];

      // Mock do cache
      vi.spyOn(dataManager, 'getCinema').mockReturnValue(mockMovies);

      const results = dataManager.searchMovies('Action');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Action Movie');
    });

    it('deve buscar séries por gênero', () => {
      const mockSeries = [
        { id: '1', title: 'Drama Series', genre: 'Drama', year: 2023, rating: 9.0, seasons: 2, episodes: [], poster: '', backdrop: '', description: '' },
        { id: '2', title: 'Comedy Series', genre: 'Comedy', year: 2023, rating: 8.0, seasons: 3, episodes: [], poster: '', backdrop: '', description: '' }
      ];

      vi.spyOn(dataManager, 'getSeries').mockReturnValue(mockSeries);

      const results = dataManager.searchSeries('Drama');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Drama Series');
    });
  });

  describe('Status dos dados', () => {
    it('deve verificar se os dados estão frescos', () => {
      const now = Date.now();
      
      // Mock do lastUpdate
      vi.spyOn(dataManager, 'getLastUpdateTime').mockReturnValue(now - 10 * 60 * 1000); // 10 minutos atrás
      
      expect(dataManager.isDataFresh()).toBe(true);
    });

    it('deve identificar dados desatualizados', () => {
      const now = Date.now();
      
      vi.spyOn(dataManager, 'getLastUpdateTime').mockReturnValue(now - 30 * 60 * 1000); // 30 minutos atrás
      
      expect(dataManager.isDataFresh()).toBe(false);
    });
  });
});
