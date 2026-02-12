// ===== VARIÁVEIS GLOBAIS =====
let currentMovie = null;
let currentBrand = 'all';
let playerInstance = null;
let watchlist = [];
let continueWatching = [];
let currentPage = 'home'; // home, category, live, details
let currentFilter = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// ===== CONTINUE WATCHING SYSTEM =====
function saveContinueWatching(movieId, currentTime, duration) {
    const continueWatchingData = JSON.parse(localStorage.getItem('continueWatching')) || {};
    
    continueWatchingData[movieId] = {
        movieId: movieId,
        currentTime: currentTime,
        duration: duration,
        lastWatched: new Date().toISOString(),
        progress: (currentTime / duration) * 100
    };
    
    localStorage.setItem('continueWatching', JSON.stringify(continueWatchingData));
}

function getContinueWatching() {
    const data = JSON.parse(localStorage.getItem('continueWatching')) || {};
    return Object.values(data)
        .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
        .slice(0, 3);
}

function removeFromContinueWatching(movieId) {
    const data = JSON.parse(localStorage.getItem('continueWatching')) || {};
    delete data[movieId];
    localStorage.setItem('continueWatching', JSON.stringify(data));
}

// ===== FAVORITES SYSTEM =====
function toggleFavorite(movieId) {
    const index = favorites.indexOf(movieId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(movieId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
    return index === -1; // true se adicionou, false se removeu
}

function isFavorite(movieId) {
    return favorites.includes(movieId);
}

function updateFavoriteButtons() {
    // Atualizar botão na página de detalhes
    const favBtn = document.getElementById('detailsPageFavoriteBtn');
    if (favBtn && currentMovie) {
        const isFav = isFavorite(currentMovie.titulo);
        favBtn.innerHTML = isFav 
            ? '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> NA MINHA LISTA'
            : '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> ADICIONAR';
        favBtn.classList.toggle('active', isFav);
    }
}

function getFavorites() {
    return favorites;
}

// ===== ELEMENTOS DOM =====
const elements = {
    // Hero
    heroBanner: document.getElementById('heroBanner'),
    heroLogo: document.getElementById('heroLogo'),
    heroYear: document.getElementById('heroYear'),
    heroRating: document.getElementById('heroRating'),
    heroGenre: document.getElementById('heroGenre'),
    heroDescription: document.getElementById('heroDescription'),
    heroBackdrop: document.getElementById('heroBackdrop'),
    playBtn: document.getElementById('playBtn'),
    trailerBtn: document.getElementById('trailerBtn'),
    
    // Menu Cards
    menuCards: document.querySelectorAll('.menu-card'),
    
    // Páginas
    categoryPage: document.getElementById('categoryPage'),
    liveTvPage: document.getElementById('liveTvPage'),
    detailsPage: document.getElementById('detailsPage'),
    
    // Botões Voltar
    backButton: document.getElementById('backButton'),
    liveBackButton: document.getElementById('liveBackButton'),
    detailsBackButton: document.getElementById('detailsBackButton'),
    
    // Conteúdo das Páginas
    categoryTitle: document.getElementById('categoryTitle'),
    categoryGrid: document.getElementById('categoryGrid'),
    channelsList: document.getElementById('channelsList'),
    livePlayer: document.getElementById('livePlayer'),
    
    // Página Detalhes
    detailsPagePoster: document.getElementById('detailsPagePoster'),
    detailsPageTitle: document.getElementById('detailsPageTitle'),
    detailsPageYear: document.getElementById('detailsPageYear'),
    detailsPageRating: document.getElementById('detailsPageRating'),
    detailsPageGenre: document.getElementById('detailsPageGenre'),
    detailsPageDescription: document.getElementById('detailsPageDescription'),
    detailsPagePlayBtn: document.getElementById('detailsPagePlayBtn'),
    detailsPageTrailerBtn: document.getElementById('detailsPageTrailerBtn'),
    
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
    initialize();
});

async function initialize() {
    console.log(' Inicializando PaixãoFlix Disney+ V2...');
    
    // Carregar seções da home
    renderHomeSections();
    
    // Atualizar hero banner
    updateHeroBanner();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar favoritos
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    console.log(' PaixãoFlix inicializado com sucesso!');
}

// ===== CARREGAMENTO DE DADOS =====
async function loadMovies() {
    try {
        const response = await fetch('data/cinema.json');
        const movies = await response.json();
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

// ===== HOME SECTIONS =====
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

// ===== HOME SECTIONS =====
async function renderHomeSections() {
    try {
        const movies = await loadMovies();
        const continueWatchingData = getContinueWatching();
        const favoritesList = getFavorites();
        
        // Limpar todos os carrosseis
        clearAllCarousels();
        
        // 1. Continuar Assistindo
        if (continueWatchingData.length > 0) {
            renderContinueWatchingSection(continueWatchingData, movies);
        } else {
            hideSection('continue-watching-section');
        }
        
        // 2. Minha Lista
        if (favoritesList.length > 0) {
            const favoriteMovies = movies.filter(movie => favoritesList.includes(movie.titulo));
            if (favoriteMovies.length > 0) {
                renderMyListSection(favoriteMovies);
            } else {
                hideSection('my-list-section');
            }
        } else {
            hideSection('my-list-section');
        }
        
        // 3. Não deixe de ver essa seleção (aleatórios)
        const featuredMovies = getRandomMovies(movies, 8);
        if (featuredMovies.length > 0) {
            renderFeaturedSection(featuredMovies);
        } else {
            hideSection('featured-section');
        }
        
        // 4. Sábado a noite merece (Ação/Aventura)
        const sabadoNoite = movies.filter(movie => {
            const genres = Array.isArray(movie.genero) ? movie.genero : [movie.genero];
            return genres.includes('Ação') || genres.includes('Aventura');
        });
        if (sabadoNoite.length > 0) {
            renderSaturdayNightSection(sabadoNoite);
        } else {
            hideSection('saturday-night-section');
        }
        
        // 5. As crianças amam (Animação/Kids)
        const criancasAmam = movies.filter(movie => {
            const genres = Array.isArray(movie.genero) ? movie.genero : [movie.genero];
            return genres.includes('Animação') || genres.includes('Kids');
        });
        if (criancasAmam.length > 0) {
            renderKidsSection(criancasAmam);
        } else {
            hideSection('kids-section');
        }
        
        // 6. Romances para se inspirar
        const romances = movies.filter(movie => {
            const genres = Array.isArray(movie.genero) ? movie.genero : [movie.genero];
            return genres.includes('Romance');
        });
        if (romances.length > 0) {
            renderRomanceSection(romances);
        } else {
            hideSection('romance-section');
        }
        
        // 7. Nostalgias que aquecem o coração (antes de 2010)
        const nostalgias = movies.filter(movie => parseInt(movie.year) < 2010);
        if (nostalgias.length > 0) {
            renderNostalgiaSection(nostalgias);
        } else {
            hideSection('nostalgia-section');
        }
        
        // 8. Os melhores de 2025
        const melhores2025 = movies.filter(movie => movie.year === '2025');
        if (melhores2025.length > 0) {
            renderBest2025Section(melhores2025);
        } else {
            hideSection('best-2025-section');
        }
        
        // 9. Prepare a pipoca e venha maratonar (Séries)
        const series = movies.filter(movie => movie.type === 'series');
        if (series.length > 0) {
            renderSeriesSection(series);
        } else {
            hideSection('series-section');
        }
        
        // 10. Novela é sempre bom
        const novelas = movies.filter(movie => {
            const genres = Array.isArray(movie.genero) ? movie.genero : [movie.genero];
            return genres.includes('Novela') || movie.categoria === 'Novela';
        });
        if (novelas.length > 0) {
            renderNovelaSection(novelas);
        } else {
            hideSection('novela-section');
        }
        
    } catch (error) {
        console.error('Erro ao renderizar seções:', error);
    }
}

function clearAllCarousels() {
    const carousels = [
        'continue-watching-carousel',
        'my-list-carousel',
        'featured-carousel',
        'saturday-night-carousel',
        'kids-carousel',
        'romance-carousel',
        'nostalgia-carousel',
        'best-2025-carousel',
        'series-carousel',
        'novela-carousel'
    ];
    
    carousels.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '';
        }
    });
}

function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
    }
}

function renderContinueWatchingSection(continueData, movies) {
    const carousel = document.getElementById('continue-watching-carousel');
    if (!carousel) return;
    
    continueData.slice(0, 3).forEach(item => {
        const movie = movies.find(m => m.titulo === item.movieId);
        if (movie) {
            const card = createMovieCard(movie, true, item.progress);
            carousel.appendChild(card);
        }
    });
}

function renderMyListSection(movies) {
    const carousel = document.getElementById('my-list-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function renderFeaturedSection(movies) {
    const carousel = document.getElementById('featured-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function renderSaturdayNightSection(movies) {
    const carousel = document.getElementById('saturday-night-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function renderKidsSection(movies) {
    const carousel = document.getElementById('kids-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function renderRomanceSection(movies) {
    const carousel = document.getElementById('romance-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function renderNostalgiaSection(movies) {
    const carousel = document.getElementById('nostalgia-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie, false, 0, true); // nostalgia = true
        carousel.appendChild(card);
    });
}

function renderBest2025Section(movies) {
    const carousel = document.getElementById('best-2025-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function renderSeriesSection(movies) {
    const carousel = document.getElementById('series-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function renderNovelaSection(movies) {
    const carousel = document.getElementById('novela-carousel');
    if (!carousel) return;
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        carousel.appendChild(card);
    });
}

function createMovieCard(movie, hasProgress = false, progress = 0, isNostalgia = false) {
    const card = document.createElement('div');
    const cardClass = isNostalgia ? 'card-movie nostalgia-card' : 'card-movie';
    card.className = cardClass;
    card.tabIndex = 0;
    
    const progressBar = hasProgress ? 
        `<div class="continue-watching-progress" style="width: ${progress}%"></div>` : '';
    
    card.innerHTML = `
        <img class="card-poster" src="${movie.poster}" alt="${movie.titulo}">
        ${progressBar}
        <div class="card-info">
            <h3 class="card-title">${movie.titulo}</h3>
            <div class="card-meta">
                <span class="card-year">${movie.year}</span>
                <span class="card-rating">⭐ ${movie.rating}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showDetailsPage(movie));
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') showDetailsPage(movie);
    });
    
    return card;
}

function getRandomMovies(movies, count) {
    const shuffled = [...movies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ===== HERO BANNER =====
function updateHeroBanner() {
    loadMovies().then(movies => {
        if (movies.length > 0) {
            // Selecionar filme aleatório para o hero banner
            const featuredMovie = movies[Math.floor(Math.random() * movies.length)];
            
            // Atualizar conteúdo do hero com nova estrutura
            // Logo do título
            elements.heroLogo.src = featuredMovie.logo_titulo || featuredMovie.poster;
            elements.heroLogo.alt = featuredMovie.titulo;
            
            // Informações
            elements.heroYear.textContent = featuredMovie.year;
            elements.heroRating.textContent = featuredMovie.rating;
            elements.heroGenre.textContent = Array.isArray(featuredMovie.genero) 
                ? featuredMovie.genero[0] 
                : featuredMovie.genero;
            elements.heroDescription.textContent = featuredMovie.desc;
            
            // Backdrop
            const backdropUrl = featuredMovie.backdrop || featuredMovie.poster;
            elements.heroBackdrop.style.backgroundImage = `url(${backdropUrl})`;
            
            // Adicionar efeito de zoom suave no backdrop
            elements.heroBackdrop.style.transform = 'scale(1.05)';
            setTimeout(() => {
                elements.heroBackdrop.style.transform = 'scale(1)';
            }, 1000);
            
            // Configurar botões
            elements.playBtn.onclick = () => {
                console.log('🎬 Assistir:', featuredMovie.titulo);
                playMovie(featuredMovie);
            };
            
            elements.trailerBtn.onclick = () => {
                console.log('🎬 Trailer:', featuredMovie.titulo);
                showTrailerModal(featuredMovie);
            };
            
            // Adicionar classe para animação de entrada
            elements.heroBanner.classList.add('hero-loaded');
            
            console.log('🎬 Hero Banner atualizado:', featuredMovie.titulo);
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

function showTrailerModal(movie) {
    if (!movie || !movie.trailer) {
        alert('Trailer não disponível');
        return;
    }
    
    // Converter URL do YouTube para embed
    const embedUrl = convertToEmbedUrl(movie.trailer);
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
function playMovie(movie, startTime = null) {
    currentMovie = movie;
    
    // Destruir player anterior se existir
    if (playerInstance) {
        playerInstance.destroy();
    }
    
    // Obter tempo de continuação se não especificado
    if (startTime === null) {
        const continueData = JSON.parse(localStorage.getItem('continueWatching')) || {};
        const movieContinueData = continueData[movie.titulo];
        startTime = movieContinueData ? movieContinueData.currentTime : 0;
    }
    
    // Criar novo player
    playerInstance = new Clappr.Player({
        parentId: '#videoPlayer',
        source: movie.url,
        width: '100%',
        height: '100%',
        autoPlay: true,
        preload: 'metadata',
        startTime: startTime,
        hlsjsConfig: {
            enableWorker: true,
            lowLatencyMode: true,
        }
    });
    
    // Eventos do player
    playerInstance.on(Clappr.Events.PLAYER_TIMEUPDATE, onTimeUpdate);
    playerInstance.on(Clappr.Events.PLAYER_ENDED, onPlayerEnded);
    
    // Salvar progresso a cada 5 segundos
    const progressInterval = setInterval(() => {
        updateContinueWatchingProgress();
    }, 5000);
    
    playerInstance.on(Clappr.Events.PLAYER_DESTROY, () => {
        clearInterval(progressInterval);
    });
    
    // Mostrar player
    elements.playerOverlay.classList.add('active');
    
    // Salvar em "Continue Assistindo"
    saveContinueWatching(movie.titulo, startTime || 0, 0);
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
    if (currentMovie) {
        // Remover da lista de continue watching quando terminar
        removeFromContinueWatching(currentMovie.titulo);
        
        // Adicionar aos filmes assistidos
        const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
        if (!watchedMovies.includes(currentMovie.titulo)) {
            watchedMovies.push(currentMovie.titulo);
            localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
        }
    }
    // Por enquanto, apenas fecha o player
    setTimeout(() => {
        hidePlayer();
    }, 3000);
}

// ... (rest of the code remains the same)
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

// ===== NAVEGAÇÃO DE PÁGINAS =====

// Função para ocultar todas as páginas
function hideAllPages() {
    // Ocultar páginas
    elements.categoryPage.style.display = 'none';
    elements.liveTvPage.style.display = 'none';
    elements.detailsPage.style.display = 'none';
    
    // Remover classes ativas
    elements.categoryPage.classList.remove('active');
    elements.liveTvPage.classList.remove('active');
    elements.detailsPage.classList.remove('active');
    
    // Ocultar conteúdo principal
    document.querySelector('.hero-banner').parentElement.style.display = 'none';
    document.querySelector('.menu-cards-section').style.display = 'none';
    document.querySelector('.content-section').style.display = 'none';
}

// Mostrar página inicial
function showHomePage() {
    hideAllPages();
    currentPage = 'home';
    currentFilter = null;
    
    // Mostrar conteúdo principal
    document.querySelector('.hero-banner').parentElement.style.display = 'block';
    document.querySelector('.menu-cards-section').style.display = 'block';
    document.querySelector('.content-section').style.display = 'block';
    
    // Renderizar seções organizadas
    renderHomeSections();
    
    // Atualizar histórico do navegador
    history.pushState({ page: 'home' }, '', '/');
}

// Mostrar página de categoria
function showCategoryPage(menuType) {
    hideAllPages();
    currentPage = 'category';
    currentFilter = menuType;
    
    // Configurar título
    const titles = {
        'cinema': 'Cinema',
        'series': 'Séries',
        'movies_kids': 'Filmes Kids',
        'series_kids': 'Séries Kids'
    };
    
    elements.categoryTitle.textContent = titles[menuType] || 'Categoria';
    
    // Mostrar página
    elements.categoryPage.style.display = 'block';
    setTimeout(() => elements.categoryPage.classList.add('active'), 100);
    
    // Carregar conteúdo filtrado
    loadCategoryContent(menuType);
    
    // Atualizar histórico
    history.pushState({ page: 'category', filter: menuType }, '', `/${menuType}`);
}

// Carregar conteúdo da categoria
async function loadCategoryContent(menuType) {
    try {
        const movies = await loadMovies();
        let filteredMovies = [];
        
        // Aplicar filtros
        switch(menuType) {
            case 'cinema':
                filteredMovies = movies.filter(movie => movie.type === 'movie');
                break;
            case 'series':
                filteredMovies = movies.filter(movie => movie.type === 'series');
                break;
            case 'movies_kids':
                filteredMovies = movies.filter(movie => 
                    movie.type === 'movie' && 
                    (movie.genero.includes('Animação') || movie.genero.includes('Kids'))
                );
                break;
            case 'series_kids':
                filteredMovies = movies.filter(movie => 
                    movie.type === 'series' && 
                    (movie.genero.includes('Animação') || movie.genero.includes('Kids'))
                );
                break;
        }
        
        // Renderizar grid
        renderCategoryGrid(filteredMovies);
        
    } catch (error) {
        console.error('Erro ao carregar categoria:', error);
    }
}

// Renderizar grid da categoria
function renderCategoryGrid(movies) {
    elements.categoryGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'card-movie';
        card.tabIndex = 0;
        
        card.innerHTML = `
            <img class="card-poster" src="${movie.poster}" alt="${movie.titulo}">
            <div class="card-info">
                <h3 class="card-title">${movie.titulo}</h3>
                <div class="card-meta">
                    <span class="card-year">${movie.year}</span>
                    <span class="card-rating">⭐ ${movie.rating}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => showDetailsPage(movie));
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') showDetailsPage(movie);
        });
        
        elements.categoryGrid.appendChild(card);
    });
}

// Mostrar página de canais ao vivo
function showLiveTvPage() {
    hideAllPages();
    currentPage = 'live';
    
    // Mostrar página
    elements.liveTvPage.style.display = 'block';
    setTimeout(() => elements.liveTvPage.classList.add('active'), 100);
    
    // Carregar canais
    loadLiveChannels();
    
    // Atualizar histórico
    history.pushState({ page: 'live' }, '', '/live');
}

// Carregar canais ao vivo
async function loadLiveChannels() {
    try {
        // Simular canais (poderia carregar de um arquivo M3U)
        const channels = [
            { name: 'Disney Channel', logo: 'https://static-assets.bamgrid.com/product/disneyplus/images/disney.png', url: 'https://example.com/disney-live.m3u8' },
            { name: 'Marvel HQ', logo: 'https://static-assets.bamgrid.com/product/disneyplus/images/marvel.png', url: 'https://example.com/marvel-live.m3u8' },
            { name: 'Pixar TV', logo: 'https://static-assets.bamgrid.com/product/disneyplus/images/pixar.png', url: 'https://example.com/pixar-live.m3u8' },
            { name: 'Star Wars TV', logo: 'https://static-assets.bamgrid.com/product/disneyplus/images/starwars.png', url: 'https://example.com/starwars-live.m3u8' },
            { name: 'Nat Geo Kids', logo: 'https://static-assets.bamgrid.com/product/disneyplus/images/national.png', url: 'https://example.com/natgeo-live.m3u8' }
        ];
        
        renderChannelsList(channels);
        
    } catch (error) {
        console.error('Erro ao carregar canais:', error);
    }
}

// Renderizar lista de canais
function renderChannelsList(channels) {
    elements.channelsList.innerHTML = '';
    
    channels.forEach((channel, index) => {
        const item = document.createElement('div');
        item.className = 'channel-item';
        item.tabIndex = 0;
        
        if (index === 0) item.classList.add('active');
        
        item.innerHTML = `
            <img class="channel-logo" src="${channel.logo}" alt="${channel.name}">
            <span class="channel-name">${channel.name}</span>
        `;
        
        item.addEventListener('click', () => playLiveChannel(channel));
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') playLiveChannel(channel);
        });
        
        elements.channelsList.appendChild(item);
    });
    
    // Tocar primeiro canal
    if (channels.length > 0) {
        playLiveChannel(channels[0]);
    }
}

// Tocar canal ao vivo
function playLiveChannel(channel) {
    // Destacar canal ativo
    document.querySelectorAll('.channel-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Destruir player anterior
    if (playerInstance) {
        playerInstance.destroy();
    }
    
    // Criar novo player para canal ao vivo
    playerInstance = new Clappr.Player({
        parentId: '#livePlayer',
        source: channel.url,
        width: '100%',
        height: '100%',
        autoPlay: true,
        preload: 'metadata',
        hlsjsConfig: {
            enableWorker: true,
            lowLatencyMode: true,
        }
    });
    
    console.log('📺 Tocando canal:', channel.name);
}

// Mostrar página de detalhes
function showDetailsPage(movie) {
    hideAllPages();
    currentPage = 'details';
    currentMovie = movie;
    
    // Preencher informações
    elements.detailsPagePoster.src = movie.poster;
    elements.detailsPagePoster.alt = movie.titulo;
    elements.detailsPageTitle.textContent = movie.titulo;
    elements.detailsPageYear.textContent = movie.year;
    elements.detailsPageRating.textContent = `⭐ ${movie.rating}`;
    elements.detailsPageGenre.textContent = Array.isArray(movie.genero) 
        ? movie.genero.join(', ') 
        : movie.genero;
    elements.detailsPageDescription.textContent = movie.desc;
    
    // Configurar botões
    elements.detailsPagePlayBtn.onclick = () => {
        const continueData = JSON.parse(localStorage.getItem('continueWatching')) || {};
        const movieContinueData = continueData[movie.titulo];
        const startTime = movieContinueData ? movieContinueData.currentTime : 0;
        playMovie(movie, startTime);
    };
    
    elements.detailsPageTrailerBtn.onclick = () => showTrailerModal(movie);
    
    // Configurar botão de favoritos
    const favBtn = document.getElementById('detailsPageFavoriteBtn');
    if (favBtn) {
        favBtn.onclick = () => {
            toggleFavorite(movie.titulo);
            updateFavoriteButtons();
        };
    }
    
    // Atualizar estado do botão de favoritos
    updateFavoriteButtons();
    
    // Mostrar página
    elements.detailsPage.style.display = 'block';
    setTimeout(() => elements.detailsPage.classList.add('active'), 100);
    
    // Atualizar histórico
    history.pushState({ page: 'details', movieId: movie.titulo }, '', `/details/${movie.titulo}`);
}

// ===== CONTROLE DE MENU =====

// Configurar eventos dos cards de menu
function setupMenuCards() {
    elements.menuCards.forEach(card => {
        const menuType = card.dataset.menu;
        
        card.addEventListener('click', () => {
            switch(menuType) {
                case 'live':
                    showLiveTvPage();
                    break;
                case 'cinema':
                case 'series':
                case 'movies_kids':
                case 'series_kids':
                    showCategoryPage(menuType);
                    break;
            }
        });
        
        // Controle de vídeo
        const video = card.querySelector('.menu-video');
        
        card.addEventListener('mouseenter', () => {
            video.play();
            video.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
            video.style.opacity = '0';
        });
        
        // Otimizar carregamento
        card.addEventListener('mouseenter', () => {
            if (video.readyState < 2) {
                video.load();
            }
        }, { once: true });
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Botões voltar
    elements.backButton.addEventListener('click', showHomePage);
    elements.liveBackButton.addEventListener('click', showHomePage);
    elements.detailsBackButton.addEventListener('click', showHomePage);
    
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
    
    // Brand cards video controls
    setupBrandVideos();
    
    // Menu cards
    setupMenuCards();
    
    // Details modal buttons
    elements.detailsPlayBtn.addEventListener('click', () => {
        if (currentMovie) {
            hideDetailsModal();
            playMovie(currentMovie);
        }
    });
    
    elements.detailsTrailerBtn.addEventListener('click', () => {
        if (currentMovie) {
            showTrailerModal(currentMovie);
        }
    });
    
    elements.detailsAddToListBtn.addEventListener('click', () => {
        if (currentMovie) {
            toggleWatchlist(currentMovie);
        }
    });
    
    // Keyboard navigation
    setupKeyboardNavigation();
    
    // Histórico do navegador
    window.addEventListener('popstate', handlePopState);
}

// Manipular histórico do navegador
function handlePopState(event) {
    if (event.state) {
        switch(event.state.page) {
            case 'home':
                showHomePage();
                break;
            case 'category':
                showCategoryPage(event.state.filter);
                break;
            case 'live':
                showLiveTvPage();
                break;
            case 'details':
                // Encontrar filme pelo ID
                loadMovies().then(movies => {
                    const movie = movies.find(m => m.titulo === event.state.movieId);
                    if (movie) showDetailsPage(movie);
                });
                break;
        }
    } else {
        showHomePage();
    }
}

// ===== KEYBOARD NAVIGATION =====
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Voltar com ESC
        if (e.key === 'Escape') {
            if (elements.playerOverlay.classList.contains('active')) {
                hidePlayer();
            } else if (elements.trailerModal.classList.contains('active')) {
                hideTrailerModal();
            } else if (elements.detailsModal.classList.contains('active')) {
                hideDetailsModal();
            } else if (currentPage !== 'home') {
                showHomePage();
            }
        }
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
