// Sistema de UI Premium para PaixãoFlix
class PaixaoFlixUI {
  constructor() {
    this.dataManager = null;
    this.currentSection = 'home';
    this.searchQuery = '';
    this.isSidebarExpanded = false;
    this.init();
  }

  async init() {
    // Aguardar o DataManager estar disponível
    while (!window.PaixaoFlixDataManager) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.dataManager = window.PaixaoFlixDataManager;
    this.setupEventListeners();
    this.renderInitialContent();
    this.setupInfiniteCarousels();
    
    console.log('🎨 UI Premium PaixãoFlix inicializada');
  }

  setupEventListeners() {
    // Menu lateral com expansão
    const sidebar = document.querySelector('.sidebar-nav');
    if (sidebar) {
      sidebar.addEventListener('mouseenter', () => {
        this.expandSidebar();
      });
      
      sidebar.addEventListener('mouseleave', () => {
        this.collapseSidebar();
      });

      // Navegação por menu tiles
      document.querySelectorAll('.menu-tile').forEach(tile => {
        tile.addEventListener('click', (e) => {
          const section = e.currentTarget.dataset.section;
          this.navigateToSection(section);
        });
      });
    }

    // Busca
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.performSearch();
      });
    }

    // Botões de ação
    document.querySelectorAll('button').forEach(button => {
      if (button.textContent.includes('Assistir Agora')) {
        button.addEventListener('click', () => this.showRandomContent());
      }
    });

    // Listener para atualizações de dados
    window.addEventListener('dataUpdated', (event) => {
      this.updateContent(event.detail.data);
    });
  }

  expandSidebar() {
    const sidebar = document.querySelector('.sidebar-nav');
    if (sidebar) {
      sidebar.style.width = '240px';
      this.isSidebarExpanded = true;
    }
  }

  collapseSidebar() {
    const sidebar = document.querySelector('.sidebar-nav');
    if (sidebar) {
      sidebar.style.width = '64px';
      this.isSidebarExpanded = false;
    }
  }

  navigateToSection(section) {
    this.currentSection = section;
    console.log(`📍 Navegando para: ${section}`);
    
    // Atualizar menu ativo
    document.querySelectorAll('.menu-tile').forEach(tile => {
      tile.classList.remove('bg-sidebar-accent');
      if (tile.dataset.section === section) {
        tile.classList.add('bg-sidebar-accent');
      }
    });

    // Renderizar conteúdo da seção
    this.renderSection(section);
  }

  renderSection(section) {
    const contentContainer = document.querySelector('.container .px-4');
    if (!contentContainer) return;

    let content = '';

    switch (section) {
      case 'home':
        content = this.renderHomeSection();
        break;
      case 'cinema':
        content = this.renderCinemaSection();
        break;
      case 'series':
        content = this.renderSeriesSection();
        break;
      case 'canais':
        content = this.renderCanaisSection();
        break;
      case 'kids':
        content = this.renderKidsSection();
        break;
      case 'series-kids':
        content = this.renderSeriesKidsSection();
        break;
      case 'favoritos':
        content = this.renderFavoritosSection();
        break;
      default:
        content = this.renderHomeSection();
    }

    // Manter o hero section e atualizar apenas o conteúdo
    const existingContent = contentContainer.querySelectorAll('section')[1];
    if (existingContent) {
      existingContent.remove();
    }
    
    contentContainer.insertAdjacentHTML('beforeend', content);
    
    // Reconfigurar carrosseis infinitos
    this.setupInfiniteCarousels();
  }

  renderHomeSection() {
    const cinema = this.dataManager.getCinema();
    const series = this.dataManager.getSeries();
    const canais = this.dataManager.getCanaisAoVivo();
    const continueWatching = this.getContinueWatching();

    // Embaralhar conteúdo para não repetir
    const shuffledCinema = this.shuffleArray([...cinema]);
    const shuffledSeries = this.shuffleArray([...series]);
    const shuffledCanais = this.shuffleArray([...canais]);

    return `
      <div class="container px-4 py-8">
        ${continueWatching.length > 0 ? this.renderContinueWatchingSection(continueWatching) : ''}
        
        <section class="movie-section" id="prepare-a-pipoca">
          <h2 class="section-title">🍿 Prepare a Pipoca</h2>
          <div class="carousel-track">
            ${this.renderMovieCards(shuffledCinema.slice(0, 10))}
          </div>
        </section>

        <section class="movie-section" id="os-melhores-de-2025">
          <h2 class="section-title">🔥 Os Melhores de 2025</h2>
          <div class="carousel-track">
            ${this.renderMovieCards(shuffledCinema.slice(10, 20))}
          </div>
        </section>

        <section class="movie-section" id="lancamentos-2026">
          <h2 class="section-title">🚀 Lançamentos 2026</h2>
          <div class="carousel-track">
            ${this.renderMovieCards(shuffledCinema.slice(20, 30))}
          </div>
        </section>

        <section class="movie-section" id="series-em-destaque">
          <h2 class="section-title">📺 Séries em Destaque</h2>
          <div class="carousel-track">
            ${this.renderSeriesCards(shuffledSeries.slice(0, 10))}
          </div>
        </section>

        <section class="movie-section" id="canais-ao-vivo">
          <h2 class="section-title">📡 Canais ao Vivo</h2>
          <div class="carousel-track">
            ${this.renderChannelCards(shuffledCanais.slice(0, 10))}
          </div>
        </section>
      </div>
    `;
  }

  renderCinemaSection() {
    const cinema = this.dataManager.getCinema();
    const organizedContent = this.organizeByCategories(cinema, window.PaixaoFlix.CATEGORIES_ORDER);
    
    let content = '<div class="container px-4 py-8">';
    
    for (const category of window.PaixaoFlix.CATEGORIES_ORDER) {
      if (organizedContent[category] && organizedContent[category].length > 0) {
        content += `
          <section class="movie-section" id="${this.slugify(category)}">
            <h2 class="section-title">${this.getCategoryEmoji(category)} ${category}</h2>
            <div class="carousel-track">
              ${this.renderMovieCards(organizedContent[category])}
            </div>
          </section>
        `;
      }
    }
    
    content += '</div>';
    return content;
  }

  renderSeriesSection() {
    const series = this.dataManager.getSeries();
    const organizedContent = this.organizeByCategories(series, window.PaixaoFlix.CATEGORIES_ORDER);
    
    let content = '<div class="container px-4 py-8">';
    
    for (const category of window.PaixaoFlix.CATEGORIES_ORDER) {
      if (organizedContent[category] && organizedContent[category].length > 0) {
        content += `
          <section class="movie-section" id="${this.slugify(category)}-series">
            <h2 class="section-title">${this.getCategoryEmoji(category)} ${category}</h2>
            <div class="carousel-track">
              ${this.renderSeriesCards(organizedContent[category])}
            </div>
          </section>
        `;
      }
    }
    
    content += '</div>';
    return content;
  }

  renderCanaisSection() {
    const canais = this.dataManager.getCanaisAoVivo();
    
    return `
      <div class="container px-4 py-8">
        <section class="movie-section" id="todos-canais">
          <h2 class="section-title">📡 Todos os Canais</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            ${this.renderChannelGrid(canais)}
          </div>
        </section>
      </div>
    `;
  }

  renderKidsSection() {
    const filmesKids = this.dataManager.getFilmesKids();
    
    return `
      <div class="container px-4 py-8">
        <section class="movie-section" id="filmes-kids">
          <h2 class="section-title">🧸 Filmes Infantil</h2>
          <div class="carousel-track">
            ${this.renderMovieCards(filmesKids)}
          </div>
        </section>
      </div>
    `;
  }

  renderSeriesKidsSection() {
    const seriesKids = this.dataManager.getSeriesKids();
    
    return `
      <div class="container px-4 py-8">
        <section class="movie-section" id="series-kids">
          <h2 class="section-title">🧸 Séries Infantil</h2>
          <div class="carousel-track">
            ${this.renderSeriesCards(seriesKids)}
          </div>
        </section>
      </div>
    `;
  }

  renderFavoritosSection() {
    const favoritos = this.dataManager.getFavoritos();
    
    return `
      <div class="container px-4 py-8">
        <section class="movie-section" id="favoritos">
          <h2 class="section-title">❤️ Meus Favoritos</h2>
          <div class="carousel-track">
            ${favoritos.length > 0 ? this.renderFavoriteCards(favoritos) : '<p class="text-muted-foreground">Nenhum favorito adicionado ainda.</p>'}
          </div>
        </section>
      </div>
    `;
  }

  renderContinueWatchingSection(continueWatching) {
    return `
      <section class="movie-section" id="continuar-assistindo">
        <h2 class="section-title">▶️ Continuar Assistindo</h2>
        <div class="carousel-track">
          ${continueWatching.map(item => this.renderContinueWatchingCard(item)).join('')}
        </div>
      </section>
    `;
  }

  renderContinueWatchingCard(item) {
    const progress = item.p || 0;
    return `
      <div class="continue-watching-card movie-card focusable" onclick="window.paixaoFlixPlayer.initPlayer('${item.url}', '${item.id}')">
        <img src="${item.poster}" alt="${item.title}" class="w-full h-full object-cover">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
        <div class="movie-card-info">
          <h3 class="card-title">${item.title}</h3>
          <p class="text-sm text-gray-300">${Math.round(progress)}% assistido</p>
        </div>
      </div>
    `;
  }

  renderMovieCards(movies) {
    return movies.map(movie => `
      <div class="movie-card focusable" onclick="window.paixaoFlixPlayer.initPlayer('${movie.streamUrl}', '${movie.id}')">
        <img src="${movie.poster}" alt="${movie.title}" class="w-full h-48 object-cover">
        <div class="movie-card-info">
          <h3 class="card-title">${movie.title}</h3>
          <p class="text-sm text-gray-300">${movie.year} • ${movie.genre}</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-yellow-400">⭐</span>
            <span class="text-sm">${movie.rating}</span>
          </div>
          <div class="flex gap-2 mt-2">
            <button class="text-xs bg-red-600 text-white px-2 py-1 rounded" onclick="event.stopPropagation(); window.paixaoFlixPlayer.initPlayer('${movie.streamUrl}', '${movie.id}')">
              ▶️ Play
            </button>
            <button class="text-xs bg-gray-600 text-white px-2 py-1 rounded" onclick="event.stopPropagation(); window.showTrailer('${movie.title}')">
              🎬 Trailer
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderSeriesCards(series) {
    return series.map(serie => `
      <div class="movie-card focusable" onclick="window.openSeriesDetails('${serie.id}')">
        <img src="${serie.poster}" alt="${serie.title}" class="w-full h-48 object-cover">
        <div class="movie-card-info">
          <h3 class="card-title">${serie.title}</h3>
          <p class="text-sm text-gray-300">${serie.year} • ${serie.seasons} temporadas</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-yellow-400">⭐</span>
            <span class="text-sm">${serie.rating}</span>
          </div>
          <div class="flex gap-2 mt-2">
            <button class="text-xs bg-red-600 text-white px-2 py-1 rounded" onclick="event.stopPropagation(); window.openSeriesDetails('${serie.id}')">
              📺 Ver Episódios
            </button>
            <button class="text-xs bg-gray-600 text-white px-2 py-1 rounded" onclick="event.stopPropagation(); window.showTrailer('${serie.title}')">
              🎬 Trailer
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderChannelCards(channels) {
    return channels.map(channel => `
      <div class="movie-card focusable" onclick="window.paixaoFlixPlayer.initPlayer('${channel.streamUrl}', '${channel.id}')">
        <img src="${channel.logo}" alt="${channel.name}" class="w-full h-32 object-contain">
        <div class="movie-card-info">
          <h3 class="card-title">${channel.name}</h3>
          <p class="text-sm text-gray-300">${channel.group}</p>
        </div>
      </div>
    `).join('');
  }

  renderChannelGrid(channels) {
    return channels.map(channel => `
      <div class="channel-card bg-card border border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors focusable" onclick="window.paixaoFlixPlayer.initPlayer('${channel.streamUrl}', '${channel.id}')">
        <img src="${channel.logo}" alt="${channel.name}" class="w-full h-16 object-contain mb-2">
        <h4 class="text-sm font-medium text-foreground truncate">${channel.name}</h4>
        <p class="text-xs text-muted-foreground">${channel.group}</p>
      </div>
    `).join('');
  }

  renderFavoriteCards(favorites) {
    return favorites.map(fav => `
      <div class="movie-card focusable">
        <div class="w-full h-48 bg-card rounded-md flex items-center justify-center">
          <span class="text-muted-foreground">Favorito</span>
        </div>
      </div>
    `).join('');
  }

  // Funções auxiliares
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  organizeByCategories(content, categories) {
    const organized = {};
    
    // Inicializar categorias
    categories.forEach(cat => {
      organized[cat] = [];
    });
    
    // Organizar conteúdo
    content.forEach(item => {
      const itemGenres = window.PaixaoFlix.cleanGenres(item.genre || []);
      
      itemGenres.forEach(genre => {
        const normalizedGenre = genre.trim();
        
        // Verificar se a categoria existe na ordem
        const matchingCategory = categories.find(cat => 
          cat.toLowerCase().includes(normalizedGenre.toLowerCase()) ||
          normalizedGenre.toLowerCase().includes(cat.toLowerCase())
        );
        
        if (matchingCategory) {
          organized[matchingCategory].push(item);
        } else {
          // Adicionar a "Lançamento 2026" se tiver ano 2026
          if (item.year === 2026) {
            organized['Lançamento 2026'].push(item);
          }
          // Adicionar a "2025" se tiver ano 2025
          else if (item.year === 2025) {
            organized['2025'].push(item);
          }
        }
      });
    });
    
    return organized;
  }

  getCategoryEmoji(category) {
    const emojis = {
      'Lançamento 2026': '🚀',
      '2025': '🔥',
      'Ação': '💥',
      'Aventura': '🗺️',
      'Anime': '🌸',
      'Animação': '🎨',
      'Comédia': '😂',
      'Drama': '🎭',
      'Dorama': '🌏',
      'Clássicos': '🎬',
      'Crime': '🔫',
      'Policial': '👮',
      'Família': '👨‍👩‍👧‍👦',
      'Musical': '🎵',
      'Documentário': '📹',
      'Faroeste': '🤠',
      'Ficção': '🛸',
      'Nacional': '🇧🇷',
      'Religioso': '🙏',
      'Romance': '💕',
      'Terror': '😱',
      'Suspense': '🔍',
      'Adulto': '🔞'
    };
    
    return emojis[category] || '📺';
  }

  slugify(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getContinueWatching() {
    const progressData = JSON.parse(localStorage.getItem('paixaoflix_progress') || '[]');
    return progressData.slice(0, 3); // Apenas os 3 mais recentes
  }

  setupInfiniteCarousels() {
    document.querySelectorAll('.movie-section').forEach(section => {
      if (section.id) {
        window.PaixaoFlix.setupInfiniteScroll(section.id);
      }
    });
  }

  performSearch() {
    if (!this.searchQuery.trim()) return;

    const movies = this.dataManager.searchMovies(this.searchQuery);
    const series = this.dataManager.searchSeries(this.searchQuery);
    const channels = this.dataManager.searchChannels(this.searchQuery);

    const contentContainer = document.querySelector('.container .px-4');
    if (!contentContainer) return;

    const searchResults = `
      <div class="container px-4 py-8">
        <section class="movie-section" id="search-results">
          <h2 class="section-title">🔍 Resultados para "${this.searchQuery}"</h2>
          
          ${movies.length > 0 ? `
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Filmes (${movies.length})</h3>
              <div class="carousel-track">
                ${this.renderMovieCards(movies)}
              </div>
            </div>
          ` : ''}
          
          ${series.length > 0 ? `
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Séries (${series.length})</h3>
              <div class="carousel-track">
                ${this.renderSeriesCards(series)}
              </div>
            </div>
          ` : ''}
          
          ${channels.length > 0 ? `
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Canais (${channels.length})</h3>
              <div class="carousel-track">
                ${this.renderChannelCards(channels)}
              </div>
            </div>
          ` : ''}
          
          ${movies.length === 0 && series.length === 0 && channels.length === 0 ? `
            <p class="text-muted-foreground">Nenhum resultado encontrado para "${this.searchQuery}"</p>
          ` : ''}
        </section>
      </div>
    `;

    // Atualizar conteúdo
    const existingContent = contentContainer.querySelectorAll('section')[1];
    if (existingContent) {
      existingContent.remove();
    }
    contentContainer.insertAdjacentHTML('beforeend', searchResults);
    
    // Reconfigurar carrosseis
    this.setupInfiniteCarousels();
  }

  showRandomContent() {
    const cinema = this.dataManager.getCinema();
    if (cinema.length > 0) {
      const randomMovie = cinema[Math.floor(Math.random() * cinema.length)];
      window.paixaoFlixPlayer.initPlayer(randomMovie.streamUrl, randomMovie.id);
    }
  }

  updateContent(data) {
    console.log('🔄 Atualizando UI com novos dados');
    
    // Se estiver em uma seção específica, renderizar novamente
    if (this.currentSection !== 'home') {
      this.renderSection(this.currentSection);
    } else {
      this.renderHomeSection();
    }
  }

  renderInitialContent() {
    // Renderizar conteúdo inicial
    this.renderHomeSection();
  }
}

// Funções globais para séries
window.openSeriesDetails = async function(seriesId) {
  // Buscar dados da série
  const series = window.PaixaoFlixDataManager.getSeries().find(s => s.id === seriesId);
  if (!series) return;

  // Buscar metadados do TMDB
  const tmdbData = await window.PaixaoFlix.getTMDBData(series.title, 'series');
  
  // Abrir página de detalhes
  window.openSeriesDetailsPage(series, tmdbData);
};

window.openSeriesDetailsPage = function(series, tmdbData = null) {
  const backdrop = tmdbData?.backdrop || series.backdrop;
  const description = tmdbData?.overview || series.description;
  
  const modal = document.createElement('div');
  modal.className = 'series-details-container';
  modal.innerHTML = `
    <div class="series-header" style="background-image: url('${backdrop}')">
      <div class="series-header-overlay"></div>
      <div class="series-info">
        <h1 class="series-title">${series.title}</h1>
        <div class="series-meta">
          <span>${series.year}</span> • 
          <span>${series.seasons} Temporadas</span> • 
          <span>⭐ ${series.rating}</span>
        </div>
        <p class="series-description">${description}</p>
        <div class="series-actions">
          <button class="btn-primary" onclick="window.loadSeriesEpisodes('${series.identificador_archive || series.id}', '${series.title}')">
            ▶️ Assistir
          </button>
          <button class="btn-secondary" onclick="window.showTrailer('${series.title}')">
            🎬 Trailer
          </button>
          <button class="btn-secondary">
            ❤️ + Minha Lista
          </button>
        </div>
      </div>
    </div>
    
    <div class="season-selector">
      <label for="season-select">Temporada:</label>
      <select id="season-select" onchange="window.loadSeason(this.value)">
        ${Array.from({length: series.seasons}, (_, i) => 
          `<option value="${i + 1}">Temporada ${i + 1}</option>`
        ).join('')}
      </select>
    </div>
    
    <div class="episodes-container" id="episodes-list">
      <!-- Episódios serão carregados aqui -->
    </div>
    
    <button class="player-close" onclick="this.parentElement.remove()">✕</button>
  `;

  document.body.appendChild(modal);
  
  // Carregar episódios da primeira temporada
  window.loadSeriesEpisodes(series.identificador_archive || series.id, series.title);
};

window.loadSeriesEpisodes = async function(archiveId, seriesTitle) {
  try {
    const episodes = await window.PaixaoFlix.getArchiveEpisodes(archiveId);
    const episodesContainer = document.getElementById('episodes-list');
    
    if (episodesContainer && episodes.length > 0) {
      episodesContainer.innerHTML = episodes.map((episode, index) => `
        <div class="episode-item focusable" onclick="window.paixaoFlixPlayer.initPlayer('${episode.url}', '${archiveId}_ep_${index}')">
          <div class="episode-number">${episode.episode}</div>
          <div class="episode-thumbnail" style="background-image: url('https://via.placeholder.com/200x112/333/fff?text=Ep+${episode.episode}')">
          </div>
          <div class="episode-info">
            <h3 class="episode-title">${episode.title}</h3>
            <p class="episode-description">Episódio ${episode.episode} de ${seriesTitle}</p>
          </div>
          <div class="episode-duration">--:--</div>
        </div>
      `).join('');
    } else {
      episodesContainer.innerHTML = '<p class="text-center">Conteúdo em processamento no servidor</p>';
    }
  } catch (error) {
    console.error('Erro ao carregar episódios:', error);
    const episodesContainer = document.getElementById('episodes-list');
    if (episodesContainer) {
      episodesContainer.innerHTML = '<p class="text-center">Conteúdo em processamento no servidor</p>';
    }
  }
};

window.showTrailer = async function(title) {
  const tmdbData = await window.PaixaoFlix.getTMDBData(title, 'movie');
  if (tmdbData && tmdbData.trailer) {
    // Abrir trailer em modal
    window.paixaoFlixPlayer.initPlayer(tmdbData.trailer, `trailer_${title}`);
  } else {
    alert('Trailer não disponível');
  }
};

// Inicializar UI quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.paixaoFlixUI = new PaixaoFlixUI();
});
