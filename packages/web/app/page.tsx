import { ContentLoaderService } from '@paixaoflix/shared/services/content-loader';
import { PlatformService } from '@paixaoflix/shared/services/platform';

// Initialize content loader
const contentLoader = new ContentLoaderService();

// Mock data for demonstration (fallback if local data fails)
const mockContent = [
  {
    id: 'mock1',
    title: 'Filme Demo - Ação',
    description: 'Um filme de ação para demonstração do sistema',
    type: 'movie' as const,
    genre: ['Ação', 'Aventura'],
    rating: 8.5,
    duration: 7200,
    thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Filme+Demo',
    poster: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Filme+Demo',
    backdrop: 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Filme+Demo',
    releaseDate: new Date('2024-01-01'),
    language: ['pt-BR'],
    subtitles: [],
    quality: [],
    cast: [],
    director: 'Director Demo',
    tags: ['ação', 'aventura', 'demo'],
    isPremium: false,
    isLive: false,
    metadata: {
      tmdbId: 0,
      imdbId: '',
      year: 2024,
      country: 'Brasil',
    },
  },
  {
    id: 'mock2',
    title: 'Série Demo - Drama',
    description: 'Uma série dramática para demonstração',
    type: 'series' as const,
    genre: ['Drama', 'Suspense'],
    rating: 9.0,
    seasons: [
      {
        id: 'mock-s1',
        number: 1,
        title: 'Temporada 1',
        description: 'Primeira temporada',
        episodes: [],
        releaseDate: new Date('2024-01-01'),
      },
    ],
    thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Série+Demo',
    poster: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Série+Demo',
    backdrop: 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Série+Demo',
    releaseDate: new Date('2024-01-01'),
    language: ['pt-BR'],
    subtitles: [],
    quality: [],
    cast: [],
    director: 'Director Demo',
    tags: ['drama', 'suspense', 'demo'],
    isPremium: false,
    isLive: false,
    metadata: {
      tmdbId: 0,
      imdbId: '',
      year: 2024,
      country: 'Brasil',
    },
  },
];

export default function HomePage() {
  const platformService = new PlatformService();
  const platformConfig = platformService.getPlatformConfig();

  // Get real content or fallback to mock data
  const movies = contentLoader.getMovies().length > 0 ? contentLoader.getMovies() : mockContent;
  const series = contentLoader.getSeries().length > 0 ? contentLoader.getSeries() : mockContent;
  const trending = contentLoader.getTrendingContent(6);
  const newReleases = contentLoader.getNewReleases(6);

  const handleContentClick = (content: any) => {
    console.log('Content clicked:', content);
    // TODO: Implement content detail modal or navigation
    // Could open a modal with video player, or navigate to detail page
  };

  return (
    <main className="min-h-screen bg-paixaoflix-primary text-paixaoflix-text">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-paixaoflix-secondary/95 backdrop-blur-sm border-b border-paixaoflix-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-paixaoflix-accent">
                PaixãoFlix Pro Max
              </h1>
              <span className="text-sm text-paixaoflix-text-secondary">
                {platformConfig.name}
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <button className="text-paixaoflix-text hover:text-paixaoflix-accent transition-colors">
                Início
              </button>
              <button className="text-paixaoflix-text hover:text-paixaoflix-accent transition-colors">
                Filmes
              </button>
              <button className="text-paixaoflix-text hover:text-paixaoflix-accent transition-colors">
                Séries
              </button>
              <button className="text-paixaoflix-text hover:text-paixaoflix-accent transition-colors">
                Kids
              </button>
              <button className="text-paixaoflix-text hover:text-paixaoflix-accent transition-colors">
                Canais
              </button>
              <button className="text-paixaoflix-text hover:text-paixaoflix-accent transition-colors">
                Buscar
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-b from-paixaoflix-secondary to-paixaoflix-primary">
        <div className="absolute inset-0 bg-gradient-to-r from-paixaoflix-accent/20 to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Bem-vindo ao PaixãoFlix Pro Max
            </h2>
            <p className="text-lg text-paixaoflix-text-secondary mb-6">
              Sua central de entretenimento definitiva com filmes, séries, conteúdo infantil e canais ao vivo para todas as plataformas.
            </p>
            <div className="flex gap-4">
              <button className="btn btn-primary">
                Começar a Assistir
              </button>
              <button className="btn btn-secondary">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4 py-8">
        {/* Trending Now */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">🔥 Em Alta Agora</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trending.map((content) => (
              <div
                key={content.id}
                className="video-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handleContentClick(content)}
              >
                <div className="relative w-full h-64 bg-paixaoflix-secondary">
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {content.isPremium && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-paixaoflix-accent text-black text-xs font-bold rounded">
                      PREMIUM
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded">
                    ⭐ {content.rating.toFixed(1)}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {content.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>{content.metadata.year}</span>
                    {content.duration && (
                      <>
                        <span>•</span>
                        <span>{Math.floor(content.duration / 60)}min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Releases */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">🎬 Lançamentos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {newReleases.map((content) => (
              <div
                key={content.id}
                className="video-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handleContentClick(content)}
              >
                <div className="relative w-full h-64 bg-paixaoflix-secondary">
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                    NOVO
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded">
                    ⭐ {content.rating.toFixed(1)}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {content.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>{content.metadata.year}</span>
                    {content.duration && (
                      <>
                        <span>•</span>
                        <span>{Math.floor(content.duration / 60)}min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movies */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">🎥 Filmes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {movies.slice(0, 6).map((content) => (
              <div
                key={content.id}
                className="video-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handleContentClick(content)}
              >
                <div className="relative w-full h-64 bg-paixaoflix-secondary">
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded">
                    ⭐ {content.rating.toFixed(1)}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {content.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>{content.metadata.year}</span>
                    {content.duration && (
                      <>
                      <span>•</span>
                      <span>{Math.floor(content.duration / 60)}min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Series */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">📺 Séries</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {series.slice(0, 6).map((content) => (
              <div
                key={content.id}
                className="video-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handleContentClick(content)}
              >
                <div className="relative w-full h-64 bg-paixaoflix-secondary">
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                    SÉRIE
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded">
                    ⭐ {content.rating.toFixed(1)}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {content.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>{content.metadata.year}</span>
                    <span>•</span>
                    <span>{content.seasons?.length || 1} Temporada{(content.seasons?.length || 1) > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paixaoflix-secondary border-t border-paixaoflix-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold text-paixaoflix-accent mb-4">
                PaixãoFlix
              </h4>
              <p className="text-paixaoflix-text-secondary">
                Sua central de entretenimento definitiva.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Plataformas</h4>
              <ul className="space-y-2 text-paixaoflix-text-secondary">
                <li>Web</li>
                <li>Mobile</li>
                <li>Android TV</li>
                <li>Samsung TV</li>
                <li>LG TV</li>
                <li>Roku</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Conteúdo</h4>
              <ul className="space-y-2 text-paixaoflix-text-secondary">
                <li>Filmes</li>
                <li>Séries</li>
                <li>Documentários</li>
                <li>Canais ao Vivo</li>
                <li>Conteúdo Infantil</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-paixaoflix-text-secondary">
                <li>Central de Ajuda</li>
                <li>Contato</li>
                <li>Termos de Uso</li>
                <li>Privacidade</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-paixaoflix-border text-center text-paixaoflix-text-secondary">
            <p>&copy; 2024 PaixãoFlix Pro Max. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
