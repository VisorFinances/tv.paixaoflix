// Hook personalizado para gerenciar dados do PaixãoFlix
import { useState, useEffect, useCallback } from 'react';
import DataManager, { Movie, Series, Channel, Favorite } from '../data/DataManager';

interface UseDataManagerReturn {
  // Dados
  cinema: Movie[];
  canaisAoVivo: Channel[];
  favoritos: Favorite[];
  filmesKids: Movie[];
  series: Series[];
  seriesKids: Series[];
  novelas: Series[];
  
  // Status
  isLoading: boolean;
  lastUpdate: number;
  isDataFresh: boolean;
  
  // Ações
  refreshData: () => Promise<void>;
  searchMovies: (query: string) => Movie[];
  searchSeries: (query: string) => Series[];
  searchChannels: (query: string) => Channel[];
}

export const useDataManager = (): UseDataManagerReturn => {
  const [dataManager] = useState(() => DataManager.getInstance());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);

  // Função para atualizar dados
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await dataManager.updateAllData();
      setLastUpdate(dataManager.getLastUpdateTime());
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dataManager]);

  // Efeito para inicializar e ouvir atualizações
  useEffect(() => {
    // Configurar listener para atualizações automáticas
    const handleDataUpdate = (event: CustomEvent) => {
      setLastUpdate(event.detail.timestamp);
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);
    
    // Atualizar timestamp inicial
    setLastUpdate(dataManager.getLastUpdateTime());

    // Cleanup
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, [dataManager]);

  return {
    // Dados
    cinema: dataManager.getCinema(),
    canaisAoVivo: dataManager.getCanaisAoVivo(),
    favoritos: dataManager.getFavoritos(),
    filmesKids: dataManager.getFilmesKids(),
    series: dataManager.getSeries(),
    seriesKids: dataManager.getSeriesKids(),
    novelas: dataManager.getNovelas(),
    
    // Status
    isLoading,
    lastUpdate,
    isDataFresh: dataManager.isDataFresh(),
    
    // Ações
    refreshData,
    searchMovies: dataManager.searchMovies.bind(dataManager),
    searchSeries: dataManager.searchSeries.bind(dataManager),
    searchChannels: dataManager.searchChannels.bind(dataManager),
  };
};

export default useDataManager;
