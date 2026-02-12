// ===== VARIÁVEIS GLOBAIS =====
let currentMovie = null;
let currentBrand = 'all';
let playerInstance = null;
let watchlist = [];
let continueWatching = [];

// ===== ELEMENTOS DOM =====
const elements = {
    // Hero
    heroBanner: document.getElementById('heroBanner'),
    heroTitle: document.getElementById('heroTitle'),
    heroDescription: document.getElementById('heroDescription'),
    heroBackdrop: document.getElementById('heroBackdrop'),
    playBtn: document.getElementById('playBtn'),
    infoBtn: document.getElementById('infoBtn'),
    
    // Content
    contentRows: document.getElementById('contentRows'),
    
    // Modais
    detailsModal: document.getElementById('detailsModal'),
    trailerModal: document.getElementById('trailerModal'),
    playerOverlay: document.getElementById('playerOverlay'),
    
    // Modal Elements
    closeModal: document.getElementById('closeModal'),
    closeTrailerModal: document.getElementById('closeTrailerModal'),
    closePlayer: document.getElementById('closePlayer'),
    
    // Details Modal
    detailsPoster: document.getElementById('detailsPoster'),
    detailsTitle: document.getElementById('detailsTitle'),
    detailsYear: document.getElementById('detailsYear'),
    detailsRating: document.getElementById('detailsRating'),
    detailsGenre: document.getElementById('detailsGenre'),
    detailsDescription: document.getElementById('detailsDescription'),
    detailsPlayBtn: document.getElementById('detailsPlayBtn'),
    detailsTrailerBtn: document.getElementById('detailsTrailerBtn'),
    detailsAddToListBtn: document.getElementById('detailsAddToListBtn'),
    
    // Trailer
    trailerPlayer: document.getElementById('trailerPlayer'),
    
    // Player
    videoPlayer: document.getElementById('videoPlayer'),
    
    // Brands
    brandBtns: document.querySelectorAll('.brand-btn'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link')
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadWatchlist();
        await loadContinueWatching();
        await loadMovies();
        setupEventListeners();
        setupKeyboardNavigation();
        updateHeroBanner();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
    }
}

// ===== CARREGAMENTO DE DADOS =====
async function loadMovies() {
    try {
        const response = await fetch('data/cinema.json');
        const movies = await response.json();
        renderContentRows(movies);
        return movies;
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        return [];
    }
}

function loadWatchlist() {
    const saved = localStorage.getItem('paixaoflix_watchlist');
    watchlist = saved ? JSON.parse(saved) : [];
}

function loadContinueWatching() {
    const saved = localStorage.getItem('paixaoflix_continue_watching');
    continueWatching = saved ? JSON.parse(saved) : [];
}

function saveWatchlist() {
    localStorage.setItem('paixaoflix_watchlist', JSON.stringify(watchlist));
}

function saveContinueWatching() {
    localStorage.setItem('paixaoflix_continue_watching', JSON.stringify(continueWatching));
}

// ===== RENDERIZAÇÃO =====
function renderContentRows(movies) {
    const filteredMovies = filterMoviesByBrand(movies, currentBrand);
    const groupedMovies = groupMoviesByCategory(filteredMovies);
    
    elements.contentRows.innerHTML = '';
    
    // Renderizar "Continue Assistindo" se houver itens
    if (continueWatching.length > 0) {
        const continueWatchingMovies = continueWatching.map(item => 
            movies.find(movie => movie.url === item.url)
        ).filter(Boolean);
        
        if (continueWatchingMovies.length > 0) {
            renderRow('Continue Assistindo', continueWatchingMovies, 'continue-watching');
        }
    }
    
    // Renderizar "Minha Lista" se houver itens
    if (watchlist.length > 0) {
        const watchlistMovies = watchlist.map(url => 
            movies.find(movie => movie.url === url)
        ).filter(Boolean);
        
        if (watchlistMovies.length > 0) {
            renderRow('Minha Lista', watchlistMovies, 'watchlist');
        }
    }
    
    // Renderizar categorias
    Object.entries(groupedMovies).forEach(([category, categoryMovies]) => {
        renderRow(category, categoryMovies, category.toLowerCase().replace(/\s+/g, '-'));
    });
}

function renderRow(title, movies, rowId) {
    const row = document.createElement('div');
    row.className = 'content-row';
    row.id = rowId;
    
    row.innerHTML = `
        <div class="row-header">
            <h2 class="row-title">${title}</h2>
            <a href="#" class="row-see-all">Ver todos</a>
        </div>
        <div class="row-content">
            ${movies.map(movie => createMovieCard(movie)).join('')}
        </div>
    `;
    
    elements.contentRows.appendChild(row);
    
    // Adicionar eventos aos cards
    row.querySelectorAll('.card-movie').forEach(card => {
        card.addEventListener('click', () => {
            const movieData = JSON.parse(card.dataset.movie);
            showMovieDetails(movieData);
        });
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const movieData = JSON.parse(card.dataset.movie);
                showMovieDetails(movieData);
            }
        });
    });
}

function createMovieCard(movie) {
    const isInWatchlist = watchlist.includes(movie.url);
    const watchProgress = continueWatching.find(item => item.url === movie.url);
    
    return `
        <div class="card-movie" 
             data-movie='${JSON.stringify(movie).replace(/'/g, "&apos;")}'
             tabindex="0"
             role="button"
             aria-label="${movie.titulo}">
            <img src="${movie.poster}" alt="${movie.titulo}" class="card-poster">
            <div class="card-info">
                <h3 class="card-title">${movie.titulo}</h3>
                <div class="card-meta">
                    <span class="year">${movie.year}</span>
                    <span class="rating">★ ${movie.rating}</span>
                    ${watchProgress ? `<span class="progress">${Math.round(watchProgress.progress)}%</span>` : ''}
                </div>
            </div>
            ${isInWatchlist ? '<div class="watchlist-indicator">✓</div>' : ''}
        </div>
    `;
}

function filterMoviesByBrand(movies, brand) {
    if (brand === 'all') return movies;
    
    // Lógica de filtragem por marca (baseada no gênero ou título)
    const brandFilters = {
        'disney': (movie) => movie.genero.includes('Animação') || movie.titulo.toLowerCase().includes('disney'),
        'pixar': (movie) => movie.genero.includes('Animação') || movie.titulo.toLowerCase().includes('pixar'),
        'marvel': (movie) => movie.genero.includes('Ação') || movie.titulo.toLowerCase().includes('marvel'),
        'starwars': (movie) => movie.titulo.toLowerCase().includes('star wars') || movie.titulo.toLowerCase().includes('guerra nas estrelas'),
        'national': (movie) => movie.genero.includes('Documentário') || movie.titulo.toLowerCase().includes('national')
    };
    
    const filter = brandFilters[brand];
    return filter ? movies.filter(filter) : movies;
}

function groupMoviesByCategory(movies) {
    const categories = {};
    
    movies.forEach(movie => {
        const category = movie.genero[0] || 'Outros';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(movie);
    });
    
    return categories;
}

// ===== HERO BANNER =====
function updateHeroBanner() {
    loadMovies().then(movies => {
        if (movies.length > 0) {
            // Selecionar filme aleatório para o hero banner
            const featuredMovie = movies[Math.floor(Math.random() * movies.length)];
            
            // Configurar proporção baseada na largura da tela
            setupHeroAspectRatio();
            
            // Atualizar conteúdo do hero
            elements.heroTitle.textContent = featuredMovie.titulo;
            elements.heroDescription.textContent = featuredMovie.desc;
            
            // Configurar backdrop com fallback para poster
            const backdropUrl = featuredMovie.backdrop || featuredMovie.poster;
            elements.heroBackdrop.style.backgroundImage = `url(${backdropUrl})`;
            
            // Adicionar efeito de zoom suave no backdrop
            elements.heroBackdrop.style.transform = 'scale(1.05)';
            setTimeout(() => {
                elements.heroBackdrop.style.transform = 'scale(1)';
            }, 1000);
            
            // Configurar botões
            elements.playBtn.onclick = () => playMovie(featuredMovie);
            elements.infoBtn.onclick = () => showMovieDetails(featuredMovie);
            
            // Adicionar classe para animação de entrada
            elements.heroBanner.classList.add('hero-loaded');
        }
    });
}

// Configurar proporção do Hero Banner baseada na tela
function setupHeroAspectRatio() {
    const screenWidth = window.innerWidth;
    const heroBanner = elements.heroBanner;
    
    // Remover classes existentes
    heroBanner.classList.remove('ultrawide');
    
    // Configurar proporção baseada na largura
    if (screenWidth >= 2560) {
        // UltraWide 21:9 para telas muito largas
        heroBanner.classList.add('ultrawide');
        console.log('🎬 Hero Banner: Configurado para 21:9 (UltraWide)');
    } else if (screenWidth >= 1920) {
        // 16:9 padrão para Full HD+
        console.log('🎬 Hero Banner: Configurado para 16:9 (Full HD)');
    } else {
        // 16:9 para telas menores
        console.log('🎬 Hero Banner: Configurado para 16:9 (Padrão)');
    }
}

// Atualizar proporção ao redimensionar
window.addEventListener('resize', () => {
    setupHeroAspectRatio();
});

// ===== MODAIS =====
function showMovieDetails(movie) {
    currentMovie = movie;
    
    // Preencher informações do modal
    elements.detailsPoster.src = movie.poster;
    elements.detailsPoster.alt = movie.titulo;
    elements.detailsTitle.textContent = movie.titulo;
    elements.detailsYear.textContent = movie.year;
    elements.detailsRating.textContent = movie.rating;
    elements.detailsDescription.textContent = movie.desc;
    
    // Gênero
    const genre = movie.genero[0] || 'Outros';
    elements.detailsGenre.textContent = genre;
    
    // Verificar se está na watchlist
    const isInWatchlist = watchlist.includes(movie.url);
    elements.detailsAddToListBtn.innerHTML = isInWatchlist ? 
        '<span>-</span> Remover da Lista' : 
        '<span>+</span> Minha Lista';
    
    // Mostrar modal
    elements.detailsModal.classList.add('active');
}

function hideDetailsModal() {
    elements.detailsModal.classList.remove('active');
    currentMovie = null;
}

function showTrailerModal(trailerUrl) {
    if (!trailerUrl) {
        alert('Trailer não disponível');
        return;
    }
    
    // Converter URL do YouTube para embed
    const embedUrl = convertToEmbedUrl(trailerUrl);
    elements.trailerPlayer.src = embedUrl;
    elements.trailerModal.classList.add('active');
}

function hideTrailerModal() {
    elements.trailerModal.classList.remove('active');
    elements.trailerPlayer.src = '';
}

function convertToEmbedUrl(url) {
    // Converter URL do YouTube para formato de embed
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    
    if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    
    return url;
}

// ===== PLAYER =====
function playMovie(movie) {
    currentMovie = movie;
    
    // Destruir player anterior se existir
    if (playerInstance) {
        playerInstance.destroy();
    }
    
    // Criar novo player
    playerInstance = new Clappr.Player({
        parentId: '#videoPlayer',
        source: movie.url,
        width: '100%',
        height: '100%',
        autoPlay: true,
        preload: 'metadata',
        hlsjsConfig: {
            enableWorker: true,
            lowLatencyMode: true,
        }
    });
    
    // Eventos do player
    playerInstance.on(Clappr.Events.PLAYER_TIMEUPDATE, onTimeUpdate);
    playerInstance.on(Clappr.Events.PLAYER_ENDED, onPlayerEnded);
    
    // Mostrar player
    elements.playerOverlay.classList.add('active');
    
    // Salvar em "Continue Assistindo"
    addToContinueWatching(movie);
}

function hidePlayer() {
    if (playerInstance) {
        playerInstance.destroy();
        playerInstance = null;
    }
    elements.playerOverlay.classList.remove('active');
}

function onTimeUpdate(progress) {
    if (!currentMovie) return;
    
    const currentTime = progress.current;
    const duration = progress.total;
    const percentage = (currentTime / duration) * 100;
    
    updateContinueWatchingProgress(currentMovie.url, percentage);
}

function onPlayerEnded() {
    // Auto-play do próximo episódio/filme (se houver)
    // Por enquanto, apenas fecha o player
    setTimeout(() => {
        hidePlayer();
    }, 3000);
}

// ===== WATCHLIST E CONTINUE WATCHING =====
function toggleWatchlist(url) {
    const index = watchlist.indexOf(url);
    
    if (index > -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(url);
    }
    
    saveWatchlist();
    
    // Atualizar botão se o modal estiver aberto
    if (currentMovie && currentMovie.url === url) {
        const isInWatchlist = watchlist.includes(url);
        elements.detailsAddToListBtn.innerHTML = isInWatchlist ? 
            '<span>-</span> Remover da Lista' : 
            '<span>+</span> Minha Lista';
    }
    
    // Recarregar conteúdo
    loadMovies();
}

function addToContinueWatching(movie) {
    const existingIndex = continueWatching.findIndex(item => item.url === movie.url);
    
    const watchItem = {
        url: movie.url,
        title: movie.titulo,
        poster: movie.poster,
        progress: 0,
        timestamp: Date.now()
    };
    
    if (existingIndex > -1) {
        continueWatching[existingIndex] = watchItem;
    } else {
        continueWatching.unshift(watchItem);
    }
    
    // Manter apenas os 10 itens mais recentes
    continueWatching = continueWatching.slice(0, 10);
    
    saveContinueWatching();
}

function updateContinueWatchingProgress(url, progress) {
    const item = continueWatching.find(item => item.url === url);
    
    if (item) {
        item.progress = progress;
        item.timestamp = Date.now();
        saveContinueWatching();
    }
}

// ===== NAVEGAÇÃO POR TECLADO =====
function setupKeyboardNavigation() {
    let currentFocusIndex = -1;
    let focusableElements = [];
    
    function updateFocusableElements() {
        focusableElements = Array.from(document.querySelectorAll(
            '.card-movie, .btn, .brand-btn, .nav-link, .modal-close, .user-avatar'
        )).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
    }
    
    function focusElement(index) {
        if (index >= 0 && index < focusableElements.length) {
            focusableElements[index].focus();
            currentFocusIndex = index;
            
            // Scroll para o elemento se necessário
            const element = focusableElements[index];
            const rect = element.getBoundingClientRect();
            
            if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    function handleKeyDown(e) {
        updateFocusableElements();
        
        switch(e.key) {
            case 'ArrowRight':
                e.preventDefault();
                if (currentFocusIndex < focusableElements.length - 1) {
                    focusElement(currentFocusIndex + 1);
                }
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                if (currentFocusIndex > 0) {
                    focusElement(currentFocusIndex - 1);
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                // Navegação para baixo (lógica mais complexa para grid)
                const currentElement = focusableElements[currentFocusIndex];
                if (currentElement && currentElement.classList.contains('card-movie')) {
                    const row = currentElement.closest('.row-content');
                    if (row) {
                        const cards = Array.from(row.querySelectorAll('.card-movie'));
                        const currentIndex = cards.indexOf(currentElement);
                        const nextIndex = currentIndex + Math.floor(row.offsetWidth / 220); // largura aproximada do card
                        
                        if (nextIndex < cards.length) {
                            cards[nextIndex].focus();
                            currentFocusIndex = focusableElements.indexOf(cards[nextIndex]);
                        }
                    }
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                // Navegação para cima
                const currentEl = focusableElements[currentFocusIndex];
                if (currentEl && currentEl.classList.contains('card-movie')) {
                    const row = currentEl.closest('.row-content');
                    if (row) {
                        const cards = Array.from(row.querySelectorAll('.card-movie'));
                        const currentIndex = cards.indexOf(currentEl);
                        const prevIndex = currentIndex - Math.floor(row.offsetWidth / 220);
                        
                        if (prevIndex >= 0) {
                            cards[prevIndex].focus();
                            currentFocusIndex = focusableElements.indexOf(cards[prevIndex]);
                        }
                    }
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                // Fechar modais
                if (elements.playerOverlay.classList.contains('active')) {
                    hidePlayer();
                } else if (elements.trailerModal.classList.contains('active')) {
                    hideTrailerModal();
                } else if (elements.detailsModal.classList.contains('active')) {
                    hideDetailsModal();
                }
                break;
        }
    }
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Atualizar elementos focáveis quando o conteúdo mudar
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(document.body, { childList: true, subtree: true });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Modal close buttons
    elements.closeModal.addEventListener('click', hideDetailsModal);
    elements.closeTrailerModal.addEventListener('click', hideTrailerModal);
    elements.closePlayer.addEventListener('click', hidePlayer);
    
    // Click outside modal to close
    elements.detailsModal.addEventListener('click', (e) => {
        if (e.target === elements.detailsModal) {
            hideDetailsModal();
        }
    });
    
    elements.trailerModal.addEventListener('click', (e) => {
        if (e.target === elements.trailerModal) {
            hideTrailerModal();
        }
    });
    
    elements.playerOverlay.addEventListener('click', (e) => {
        if (e.target === elements.playerOverlay) {
            hidePlayer();
        }
    });
    
    // Details modal buttons
    elements.detailsPlayBtn.addEventListener('click', () => {
        if (currentMovie) {
            hideDetailsModal();
            playMovie(currentMovie);
        }
    });
    
    elements.detailsTrailerBtn.addEventListener('click', () => {
        if (currentMovie) {
            showTrailerModal(currentMovie.trailer);
        }
    });
    
    elements.detailsAddToListBtn.addEventListener('click', () => {
        if (currentMovie) {
            toggleWatchlist(currentMovie.url);
        }
    });
    
    // Hero buttons
    elements.playBtn.addEventListener('click', () => {
        if (currentMovie) {
            playMovie(currentMovie);
        }
    });
    
    elements.infoBtn.addEventListener('click', () => {
        if (currentMovie) {
            showMovieDetails(currentMovie);
        }
    });
    
    // Brand buttons
    elements.brandBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover classe active de todos
            elements.brandBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Atualizar marca atual e recarregar
            currentBrand = btn.dataset.brand;
            loadMovies();
        });
    });
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover classe active de todos
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Aqui você pode implementar navegação entre seções
            const section = link.dataset.section;
            console.log('Navegando para:', section);
        });
    });
}

// ===== UTILITÁRIOS =====
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== EXPORT PARA DEBUG =====
window.PaixaoFlix = {
    loadMovies,
    showMovieDetails,
    playMovie,
    toggleWatchlist,
    watchlist,
    continueWatching
};
