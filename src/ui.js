// Sistema de UI para PaixãoFlix
// Renderização dinâmica de conteúdo

class PaixaoFlixUI {
  constructor() {
    this.dataManager = null;
    this.currentSection = 'home';
    this.searchQuery = '';
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
    
    console.log('🎨 UI PaixãoFlix inicializada');
  }

  setupEventListeners() {
    // Menu lateral
    document.querySelectorAll('.menu-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.navigateToSection(section);
      });
    });

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
    const heroSection = contentContainer.querySelector('section');
    const existingContent = contentContainer.querySelectorAll('section')[1];
    
    if (existingContent) {
      existingContent.remove();
    }
    
    contentContainer.insertAdjacentHTML('beforeend', content);
  }

  renderHomeSection() {
    const cinema = this.dataManager.getCinema();
    const series = this.dataManager.getSeries();
    const canais = this.dataManager.getCanaisAoVivo();

    return `
      <div class="container px-4 py-8">
        <!-- Destaques -->
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            🍿 Prepare a Pipoca
          </h2>
          <div class="category-row">
            ${this.renderMovieCards(cinema.slice(0, 10))}
          </div>
        </section>

        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            📺 Séries em Destaque
          </h2>
          <div class="category-row">
            ${this.renderSeriesCards(series.slice(0, 10))}
          </div>
        </section>

        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            📡 Canais ao Vivo
          </h2>
          <div class="category-row">
            ${this.renderChannelCards(canais.slice(0, 10))}
          </div>
        </section>
      </div>
    `;
  }

  renderCinemaSection() {
    const cinema = this.dataManager.getCinema();
    
    return `
      <div class="container px-4 py-8">
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            🎬 Todos os Filmes
          </h2>
          <div class="category-row">
            ${this.renderMovieCards(cinema)}
          </div>
        </section>
      </div>
    `;
  }

  renderSeriesSection() {
    const series = this.dataManager.getSeries();
    
    return `
      <div class="container px-4 py-8">
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            📺 Todas as Séries
          </h2>
          <div class="category-row">
            ${this.renderSeriesCards(series)}
          </div>
        </section>
      </div>
    `;
  }

  renderCanaisSection() {
    const canais = this.dataManager.getCanaisAoVivo();
    
    return `
      <div class="container px-4 py-8">
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            📡 Todos os Canais
          </h2>
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
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            🧸 Filmes Infantil
          </h2>
          <div class="category-row">
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
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            🧸 Séries Infantil
          </h2>
          <div class="category-row">
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
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            ❤️ Meus Favoritos
          </h2>
          <div class="category-row">
            ${favoritos.length > 0 ? this.renderFavoriteCards(favoritos) : '<p class="text-muted-foreground">Nenhum favorito adicionado ainda.</p>'}
          </div>
        </section>
      </div>
    `;
  }

  renderMovieCards(movies) {
    return movies.map(movie => `
      <div class="movie-card" onclick="window.paixaoFlixUI.playMovie('${movie.streamUrl}')">
        <img src="${movie.poster}" alt="${movie.title}" class="w-full h-48 object-cover rounded-md">
        <div class="movie-card-info">
          <h3 class="font-semibold text-white">${movie.title}</h3>
          <p class="text-sm text-gray-300">${movie.year} • ${movie.genre}</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-yellow-400">⭐</span>
            <span class="text-sm">${movie.rating}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderSeriesCards(series) {
    return series.map(serie => `
      <div class="movie-card" onclick="window.paixaoFlixUI.playSeries('${serie.id}')">
        <img src="${serie.poster}" alt="${serie.title}" class="w-full h-48 object-cover rounded-md">
        <div class="movie-card-info">
          <h3 class="font-semibold text-white">${serie.title}</h3>
          <p class="text-sm text-gray-300">${serie.year} • ${serie.seasons} temporadas</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-yellow-400">⭐</span>
            <span class="text-sm">${serie.rating}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderChannelCards(channels) {
    return channels.map(channel => `
      <div class="movie-card" onclick="window.paixaoFlixUI.playChannel('${channel.streamUrl}')">
        <img src="${channel.logo}" alt="${channel.name}" class="w-full h-32 object-contain rounded-md bg-card">
        <div class="movie-card-info">
          <h3 class="font-semibold text-white">${channel.name}</h3>
          <p class="text-sm text-gray-300">${channel.group}</p>
        </div>
      </div>
    `).join('');
  }

  renderChannelGrid(channels) {
    return channels.map(channel => `
      <div class="channel-card bg-card border border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors" onclick="window.paixaoFlixUI.playChannel('${channel.streamUrl}')">
        <img src="${channel.logo}" alt="${channel.name}" class="w-full h-16 object-contain mb-2">
        <h4 class="text-sm font-medium text-foreground truncate">${channel.name}</h4>
        <p class="text-xs text-muted-foreground">${channel.group}</p>
      </div>
    `).join('');
  }

  renderFavoriteCards(favorites) {
    // Implementar renderização de favoritos
    return favorites.map(fav => `
      <div class="movie-card">
        <div class="w-full h-48 bg-card rounded-md flex items-center justify-center">
          <span class="text-muted-foreground">Favorito</span>
        </div>
      </div>
    `).join('');
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
        <section class="mb-12">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            🔍 Resultados para "${this.searchQuery}"
          </h2>
          
          ${movies.length > 0 ? `
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Filmes (${movies.length})</h3>
              <div class="category-row">
                ${this.renderMovieCards(movies)}
              </div>
            </div>
          ` : ''}
          
          ${series.length > 0 ? `
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Séries (${series.length})</h3>
              <div class="category-row">
                ${this.renderSeriesCards(series)}
              </div>
            </div>
          ` : ''}
          
          ${channels.length > 0 ? `
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Canais (${channels.length})</h3>
              <div class="category-row">
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
  }

  showRandomContent() {
    const cinema = this.dataManager.getCinema();
    if (cinema.length > 0) {
      const randomMovie = cinema[Math.floor(Math.random() * cinema.length)];
      this.playMovie(randomMovie.streamUrl);
    }
  }

  playMovie(streamUrl) {
    this.openPlayer(streamUrl);
  }

  playSeries(seriesId) {
    // Implementar reprodução de séries
    console.log('Reproduzindo série:', seriesId);
  }

  playChannel(streamUrl) {
    this.openPlayer(streamUrl);
  }

  openPlayer(streamUrl) {
    const modal = document.getElementById('player-modal');
    const container = document.getElementById('player-container');
    
    if (modal && container) {
      // Criar player de vídeo
      container.innerHTML = `
        <video controls class="w-full h-full" autoplay>
          <source src="${streamUrl}" type="application/x-mpegURL">
          <source src="${streamUrl}" type="video/mp4">
          Seu navegador não suporta o vídeo.
        </video>
      `;
      
      modal.classList.remove('hidden');
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

// Inicializar UI quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.paixaoFlixUI = new PaixaoFlixUI();
});

// Função global para fechar o player
window.closePlayer = function() {
  const modal = document.getElementById('player-modal');
  const container = document.getElementById('player-container');
  
  if (modal && container) {
    container.innerHTML = '';
    modal.classList.add('hidden');
  }
};
