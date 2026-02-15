import { useState, useMemo } from 'react';
import { Movie, Channel } from '@/types';
import { useMovies } from '@/hooks/useMovies';
import { useChannels } from '@/hooks/useChannels';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import AppSidebar from '@/components/AppSidebar';
import HeroBanner from '@/components/HeroBanner';
import MovieRow from '@/components/MovieRow';
import MenuCards from '@/components/MenuCards';
import CategoryGrid from '@/components/CategoryGrid';
import LiveTV from '@/components/LiveTV';
import SearchView from '@/components/SearchView';
import PlayerOverlay from '@/components/PlayerOverlay';
import MovieDetailModal from '@/components/MovieDetailModal';
import SeriesDetailModal from '@/components/SeriesDetailModal';

const Index = () => {
  const { movies } = useMovies();
  const { channels } = useChannels();
  const [activeView, setActiveView] = useState('home');
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('paixaoflix-favorites', []);
  const [continueWatching, setContinueWatching] = useLocalStorage<Record<string, number>>('paixaoflix-progress', {});

  // Sistema de verificação automática de novelas a cada 1h
  useState(() => {
    const checkNovelas = () => {
      const novelas = movies.filter(m => 
        m.type === 'novela' || m.genre.some(g => /novela/i.test(g))
      );
      
      if (novelas.length > 0) {
        console.log(`🎭 Encontradas ${novelas.length} novelas na verificação automática`);
        // Aqui você pode adicionar lógica para notificar ou atualizar UI
      }
    };

    // Verificar imediatamente
    checkNovelas();
    
    // Configurar verificação a cada 1h
    const interval = setInterval(checkNovelas, 3600000);
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(interval);
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleTimeUpdate = (movieId: string, progress: number) => {
    setContinueWatching(prev => ({ ...prev, [movieId]: progress }));
  };

  const handlePlay = (movie: Movie, episodeUrl?: string) => {
    if (episodeUrl) {
      setPlayingMovie({ ...movie, streamUrl: episodeUrl });
    } else {
      setPlayingMovie(movie);
    }
  };

  const handleShowDetails = (movie: Movie) => {
    setDetailMovie(movie);
  };

  const handlePlayChannel = (channel: Channel) => {
    setPlayingMovie({
      id: channel.id,
      title: channel.name,
      description: '',
      image: channel.logo,
      year: 2025,
      genre: ['TV ao Vivo'],
      type: 'movie',
      streamUrl: channel.url,
      source: 'cinema',
    });
  };

  // Derived data
  const heroMovie = movies[0] || null;

  const continueWatchingMovies = useMemo(() => {
    const ids = Object.entries(continueWatching)
      .filter(([, p]) => p > 0 && p < 95)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
    return movies.filter(m => ids.includes(m.id));
  }, [movies, continueWatching]);

  const favoriteMovies = useMemo(() => movies.filter(m => favorites.includes(m.id)), [movies, favorites]);

  const categories = useMemo(() => {
    const used = new Set<string>();
    const pick = (list: Movie[], count: number) => {
      const result: Movie[] = [];
      for (const m of list) {
        if (!used.has(m.id) && result.length < count) {
          result.push(m);
          used.add(m.id);
        }
      }
      return result;
    };

    // Não deixe de ver: 5 capas de Lançamento 2026
    const launch2026 = movies.filter(m => 
      m.year === 2026 || m.genre.some(g => 
        g.toLowerCase().includes('lançamento') && m.year >= 2026
      )
    );
    const naoPerder = pick(launch2026, 5);

    // Sábado a noite merece: 2 comédia, 1 ação, 1 suspense, 1 religioso, 1 musical
    const sabado = [
      ...pick(movies.filter(m => m.genre.some(g => /com[eé]dia/i.test(g))), 2),
      ...pick(movies.filter(m => m.genre.some(g => /a[cç][ãa]o/i.test(g))), 1),
      ...pick(movies.filter(m => m.genre.some(g => /suspense/i.test(g))), 1),
      ...pick(movies.filter(m => m.genre.some(g => /religi[oõ]/i.test(g))), 1),
      ...pick(movies.filter(m => m.genre.some(g => /musical/i.test(g))), 1),
    ];

    // As crianças amam: 3 filmes kids + 2 séries kids
    const criancas = [
      ...pick(movies.filter(m => m.source === 'filmeskids'), 3),
      ...pick(movies.filter(m => m.source === 'serieskids'), 2),
    ];

    // Romances para inspirações: 5 capas da categoria Romance
    const romance = pick(movies.filter(m => 
      m.genre.some(g => /romance/i.test(g))
    ), 5);

    // Nostalgias: 5 capas da categoria Clássicos
    const nostalgia = pick(movies.filter(m => 
      m.genre.some(g => /cl[aá]ssic/i.test(g)) || m.year < 2010
    ), 5);

    // Melhores Lançamentos 2025: 5 capas da categoria Lançamento 2025
    const launch2025 = movies.filter(m => 
      m.year === 2025 || m.genre.some(g => 
        g.toLowerCase().includes('lançamento 2025')
      )
    );
    const best2025 = pick(launch2025, 5);

    // Prepare a pipoca: 5 capas da categoria Séries sem repetir
    const allSeries = movies.filter(m => m.type === 'series');
    const uniqueSeries = Array.from(
      new Map(allSeries.map(m => [m.title.toLowerCase(), m])).values()
    );
    const pipoca = pick(uniqueSeries, 5);

    // Novelas: só aparece se houver gênero novela
    const novelas = movies.filter(m => 
      m.type === 'novela' || m.genre.some(g => /novela/i.test(g))
    );

    return { 
      naoPerder, 
      sabado, 
      criancas, 
      romance, 
      nostalgia, 
      best2025, 
      pipoca, 
      novelas 
    };
  }, [movies]);

  // Category view data
  const categoryViewData = useMemo((): { title: string; movies: Movie[] } | null => {
    switch (activeView) {
      case 'cinema': return { title: 'Cinema', movies: movies.filter(m => m.source === 'cinema') };
      case 'series': return { title: 'Séries', movies: movies.filter(m => m.source === 'series') };
      case 'kids': return { title: 'Kids', movies: movies.filter(m => m.kids) };
      case 'kids-movies': return { title: 'Filmes Kids', movies: movies.filter(m => m.source === 'filmeskids') };
      case 'kids-series': return { title: 'Séries Kids', movies: movies.filter(m => m.source === 'serieskids') };
      case 'mylist': return { title: 'Minha Lista', movies: movies.filter(m => m.source === 'favoritos') };
      default: return null;
    }
  }, [activeView, movies]);

  const sidebarOffset = 'ml-16';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar activeView={activeView} onNavigate={setActiveView} />

      <main className={`${sidebarOffset} transition-all duration-300`}>
        {/* Player Overlay */}
        {playingMovie && (
          <PlayerOverlay
            movie={playingMovie}
            onClose={() => setPlayingMovie(null)}
            onTimeUpdate={handleTimeUpdate}
          />
        )}

        {/* Detail Modal - Series vs Movie */}
        {detailMovie && detailMovie.type === 'series' && (
          <SeriesDetailModal
            movie={detailMovie}
            allMovies={movies}
            onClose={() => setDetailMovie(null)}
            onPlay={(m, episodeUrl) => { 
              setDetailMovie(null); 
              handlePlay(m, episodeUrl); 
            }}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(detailMovie.id)}
          />
        )}
        {detailMovie && detailMovie.type !== 'series' && (
          <MovieDetailModal
            movie={detailMovie}
            onClose={() => setDetailMovie(null)}
            onPlay={(m) => { 
              setDetailMovie(null); 
              handlePlay(m); 
            }}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(detailMovie.id)}
          />
        )}

        {/* Home View */}
        {activeView === 'home' && (
          <>
            <HeroBanner movie={heroMovie} onPlay={handlePlay} onShowDetails={setDetailMovie} />
            
            <div className="-mt-20 relative z-10">
              {continueWatchingMovies.length > 0 && (
                <MovieRow
                  title="Continue Assistindo"
                  movies={continueWatchingMovies}
                  onPlay={handlePlay}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                  continueWatching={continueWatching}
                  onShowDetails={setDetailMovie}
                />
              )}

              {favoriteMovies.length > 0 && (
                <MovieRow
                  title="Minha Lista"
                  movies={favoriteMovies}
                  onPlay={handlePlay}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                  onShowDetails={setDetailMovie}
                />
              )}

              <MenuCards onNavigate={setActiveView} />

              <MovieRow 
                title="Não deixe de ver" 
                movies={categories.naoPerder} 
                onPlay={handlePlay} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                onShowDetails={setDetailMovie} 
              />
              <MovieRow 
                title="Sábado a noite merece" 
                subtitle="Ação e adrenalina" 
                movies={categories.sabado} 
                onPlay={handlePlay} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                onShowDetails={setDetailMovie} 
              />
              <MovieRow 
                title="As crianças amam" 
                movies={categories.criancas} 
                onPlay={handlePlay} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                onShowDetails={setDetailMovie} 
              />
              <MovieRow 
                title="Histórias que aceleram o coração..." 
                subtitle="Romances para inspirações" 
                movies={categories.romance} 
                onPlay={handlePlay} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                onShowDetails={setDetailMovie} 
              />
              <MovieRow 
                title="Nostalgias que aquecem o coração" 
                movies={categories.nostalgia} 
                onPlay={handlePlay} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                onShowDetails={setDetailMovie} 
              />
              <MovieRow 
                title="Os melhores de 2025" 
                movies={categories.best2025} 
                onPlay={handlePlay} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                onShowDetails={setDetailMovie} 
              />
              <MovieRow 
                title="Prepare a pipoca e venha maratonar" 
                subtitle="Séries imperdíveis" 
                movies={categories.pipoca} 
                onPlay={handlePlay} 
                onToggleFavorite={toggleFavorite} 
                favorites={favorites} 
                onShowDetails={setDetailMovie} 
              />
              {categories.novelas.length > 0 && (
                <MovieRow 
                  title="Novelas Encontradas" 
                  subtitle="Atualizado automaticamente" 
                  movies={categories.novelas} 
                  onPlay={handlePlay} 
                  onToggleFavorite={toggleFavorite} 
                  favorites={favorites} 
                  onShowDetails={setDetailMovie} 
                />
              )}
            </div>
          </>
        )}

        {/* Live TV */}
        {activeView === 'live' && (
          <LiveTV channels={channels} onBack={() => setActiveView('home')} />
        )}

        {/* Search */}
        {activeView === 'search' && (
          <SearchView
            movies={movies}
            channels={channels}
            onPlay={handlePlay}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onBack={() => setActiveView('home')}
            onPlayChannel={handlePlayChannel}
            onShowDetails={setDetailMovie}
          />
        )}

        {/* Category Grid */}
        {categoryViewData && (
          <CategoryGrid
            title={categoryViewData.title}
            movies={categoryViewData.movies}
            onPlay={handlePlay}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onBack={() => setActiveView('home')}
            onShowDetails={setDetailMovie}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
