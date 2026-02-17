import React from 'react';
import HeroBanner from '../components/HeroBanner';
import SearchBar from '../components/SearchBar';
import SeriesCard from '../components/SeriesCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useVideoPreview } from '../hooks/useVideoPreview';
import { Series } from '../types';

interface HomePageProps {
  series: Series[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSeriesSelect: (series: Series) => void;
  isLoading: boolean;
}

const HomePage: React.FC<HomePageProps> = ({
  series,
  searchQuery,
  onSearchChange,
  onSeriesSelect,
  isLoading
}) => {
  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: series.length,
    onEnter: (index) => onSeriesSelect(series[index])
  });

  const filteredSeries = series.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (filteredSeries.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <HeroBanner />
        <div className="container mx-auto px-4 py-8">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
          <EmptyState
            title="Nenhuma série encontrada"
            description="Tente buscar com outros termos."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroBanner />
      <div className="container mx-auto px-4 py-8">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        
        <div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          onKeyDown={handleKeyDown}
        >
          {filteredSeries.map((series, index) => (
            <SeriesCard
              key={series.id}
              series={series}
              index={index}
              isFocused={focusedIndex === index}
              onFocus={() => {}}
              onClick={() => onSeriesSelect(series)}
              isMobile={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
