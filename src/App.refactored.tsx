import React, { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
import { useDebounce } from './hooks/useDebounce';
import { useLocalStorage } from './hooks/useLocalStorage';
import HomePage from './pages/HomePage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import PlayerPage from './pages/PlayerPage';
import ErrorBoundary from './components/ErrorBoundary';
import { Series, Episode } from './types';

type PageType = 'home' | 'series' | 'player';

interface AppState {
  page: PageType;
  selectedSeries: Series | null;
  selectedEpisode: Episode | null;
  series: Series[];
  searchQuery: string;
  isLoading: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    page: 'home',
    selectedSeries: null,
    selectedEpisode: null,
    series: [],
    searchQuery: '',
    isLoading: true
  });

  const debouncedSearchQuery = useDebounce(state.searchQuery, 300);
  const [watchHistory, setWatchHistory] = useLocalStorage<Episode[]>('watchHistory', []);

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const data = await apiService.getSeries();
        setState(prev => ({ ...prev, series: data, isLoading: false }));
      } catch (error) {
        console.error('Error loading series:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadSeries();
  }, []);

  const handleSeriesSelect = (series: Series) => {
    setState(prev => ({
      ...prev,
      page: 'series',
      selectedSeries: series
    }));
  };

  const handleEpisodeSelect = (episode: Episode) => {
    setState(prev => ({
      ...prev,
      page: 'player',
      selectedEpisode: episode
    }));
    
    setWatchHistory(prev => [
      episode,
      ...prev.filter(e => e.id !== episode.id).slice(0, 9)
    ]);
  };

  const handleBackToHome = () => {
    setState(prev => ({
      ...prev,
      page: 'home',
      selectedSeries: null,
      selectedEpisode: null
    }));
  };

  const handleBackToSeries = () => {
    setState(prev => ({
      ...prev,
      page: 'series',
      selectedEpisode: null
    }));
  };

  const handleSearchChange = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const renderPage = () => {
    switch (state.page) {
      case 'player':
        return state.selectedEpisode ? (
          <PlayerPage
            episode={state.selectedEpisode}
            onClose={handleBackToSeries}
          />
        ) : null;
        
      case 'series':
        return state.selectedSeries ? (
          <SeriesDetailPage
            series={state.selectedSeries}
            onBack={handleBackToHome}
            onEpisodeSelect={handleEpisodeSelect}
          />
        ) : null;
        
      default:
        return (
          <HomePage
            series={state.series}
            searchQuery={debouncedSearchQuery}
            onSearchChange={handleSearchChange}
            onSeriesSelect={handleSeriesSelect}
            isLoading={state.isLoading}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      {renderPage()}
    </ErrorBoundary>
  );
};

export default App;
