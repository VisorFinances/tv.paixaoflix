import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMovies } from './hooks/useMovies';
import AppSidebar from './components/AppSidebar';
import HeroBanner from './components/HeroBanner';
import MovieRow from './components/MovieRow';
import SeriesDetailModal from './components/SeriesDetailModal';
import { Movie, Episode } from './types';

const Index: React.FC = () => {
  const { movies, series, liveChannels, loading, error } = useMovies();
  const [selectedSeries, setSelectedSeries] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePlay = (movie: Movie, episode?: Episode) => {
    console.log('Playing:', movie.title, episode ? `Episode ${episode.episodeNumber}` : '');
  };

  const handleSeriesClick = (series: Movie) => {
    setSelectedSeries(series);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeries(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Erro ao carregar conteúdo</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const featuredMovie = movies[0] || series[0];

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
        {/* Hero Banner */}
        {featuredMovie && (
          <HeroBanner movie={featuredMovie} onPlay={handlePlay} />
        )}

        {/* Movie Rows */}
        <div className="px-4 py-8">
          {/* Continue Watching */}
          <MovieRow
            title="Continue Assistindo"
            movies={movies.slice(0, 5)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          {/* My List */}
          <MovieRow
            title="Minha Lista"
            movies={movies.slice(5, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          {/* Cinema */}
          <MovieRow
            title="Cinema"
            movies={movies.filter((m: Movie) => m.type === 'movie').slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          {/* Series */}
          <MovieRow
            title="Séries"
            movies={series.slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          {/* Live Channels */}
          <MovieRow
            title="Ao Vivo"
            movies={liveChannels.map((channel: any) => ({
              id: channel.id,
              title: channel.name,
              description: `Canal ao vivo - ${channel.group}`,
              thumbnail: channel.logo,
              type: 'movie' as const,
              streamUrl: channel.streamUrl
            })).slice(0, 10)}
            onPlay={handlePlay}
          />

          {/* Kids */}
          <MovieRow
            title="Kids"
            movies={movies.filter((m: Movie) => {
              return m.genre?.toLowerCase().includes('animation') || 
                     m.genre?.toLowerCase().includes('kids');
            }).slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          {/* Genre Categories */}
          <MovieRow
            title="Não deixe de ver essa seleção"
            movies={movies.slice(10, 20)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          <MovieRow
            title="Sábado a noite merece"
            movies={movies.filter((m: Movie) => {
              return m.genre?.toLowerCase().includes('action') || 
                     m.genre?.toLowerCase().includes('adventure');
            }).slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          <MovieRow
            title="As crianças amam"
            movies={movies.filter((m: Movie) => {
              return m.genre?.toLowerCase().includes('animation');
            }).slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          <MovieRow
            title="Romances para inspirações"
            movies={movies.filter((m: Movie) => {
              return m.genre?.toLowerCase().includes('romance');
            }).slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          <MovieRow
            title="Nostalgias que aquecem o coração"
            movies={movies.filter((m: Movie) => m.year && m.year < 2010).slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          <MovieRow
            title="Os melhores de 2025"
            movies={movies.filter((m: Movie) => m.year === 2025).slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          <MovieRow
            title="Prepare a pipoca e venha maratonar"
            movies={series.slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />

          <MovieRow
            title="Novela é sempre bom"
            movies={movies.filter((m: Movie) => {
              return m.genre?.toLowerCase().includes('novela');
            }).slice(0, 10)}
            onPlay={handlePlay}
            onSeriesClick={handleSeriesClick}
          />
        </div>
      </main>

      {/* Series Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSeries && (
          <SeriesDetailModal
            series={selectedSeries}
            isOpen={isModalOpen}
            onClose={closeModal}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
