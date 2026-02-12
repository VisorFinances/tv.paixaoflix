// ===== VARIÁVEIS GLOBAIS =====
let currentMovie = null;
let currentPage = 'home';
let currentFilter = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let playerInstance = null;

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
    return index === -1;
}

function isFavorite(movieId) {
    return favorites.includes(movieId);
}

function updateFavoriteButtons() {
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
    
    // Modais
    detailsModal: document.getElementById('detailsModal'),
    trailerModal: document.getElementById('trailerModal'),
    playerOverlay: document.getElementById('playerOverlay'),
    
    // Modal Elements
    closeModal: document.getElementById('closeModal'),
    closeTrailerModal: document.getElementById('closeTrailerModal'),
    closePlayer: document.getElementById('closePlayer'),
    videoPlayer: document.getElementById('videoPlayer'),
    trailerPlayer: document.getElementById('trailerPlayer'),
    
    // Details Modal Elements
    detailsPoster: document.getElementById('detailsPoster'),
    detailsTitle: document.getElementById('detailsTitle'),
    detailsYear: document.getElementById('detailsYear'),
    detailsRating: document.getElementById('detailsRating'),
    detailsGenre: document.getElementById('detailsGenre'),
    detailsDescription: document.getElementById('detailsDescription'),
    detailsPlayBtn: document.getElementById('detailsPlayBtn'),
    detailsTrailerBtn: document.getElementById('detailsTrailerBtn'),
    detailsAddToListBtn: document.getElementById('detailsAddToListBtn')
};

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

// ===== HOME SECTIONS =====
async function renderHomeSections() {
    try {
        console.log('🏠 Renderizando seções da Home...');
        
        const movies = await loadMovies();
        const continueWatchingData = getContinueWatching();
        const favoritesList = getFavorites();
        
        console.log('📊 Filmes carregados:', movies.length);
        console.log('⏱️ Continue Watching:', continueWatchingData.length);
        console.log('❤️ Favoritos:', favoritesList.length);
        
        // Limpar todos os carrosseis
        clearAllCarousels();
        
        // 1. Continuar Assistindo
        if (continueWatchingData.length > 0) {
            renderContinueWatchingSection(continueWatchingData, movies);
            console.log('✅ Continuar Assistindo renderizado');
        } else {
            hideSection('continue-watching-section');
        }
        
        // 2. Minha Lista
        if (favoritesList.length > 0) {
            const favoriteMovies = movies.filter(movie => favoritesList.includes(movie.titulo));
            if (favoriteMovies.length > 0) {
                renderMyListSection(favoriteMovies);
                console.log('✅ Minha Lista renderizada');
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
            console.log('✅ Não deixe de ver renderizado');
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
            console.log('✅ Sábado a noite renderizado:', sabadoNoite.length);
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
            console.log('✅ As crianças amam renderizado:', criancasAmam.length);
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
            console.log('✅ Romances renderizado:', romances.length);
        } else {
            hideSection('romance-section');
        }
        
        // 7. Nostalgias que aquecem o coração (antes de 2010)
        const nostalgias = movies.filter(movie => parseInt(movie.year) < 2010);
        if (nostalgias.length > 0) {
            renderNostalgiaSection(nostalgias);
            console.log('✅ Nostalgias renderizado:', nostalgias.length);
        } else {
            hideSection('nostalgia-section');
        }
        
        // 8. Os melhores de 2025
        const melhores2025 = movies.filter(movie => movie.year === '2025');
        if (melhores2025.length > 0) {
            renderBest2025Section(melhores2025);
            console.log('✅ Melhores de 2025 renderizado:', melhores2025.length);
        } else {
            hideSection('best-2025-section');
        }
        
        // 9. Prepare a pipoca e venha maratonar (Séries)
        const series = movies.filter(movie => movie.type === 'series');
        if (series.length > 0) {
            renderSeriesSection(series);
            console.log('✅ Séries renderizado:', series.length);
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
            console.log('✅ Novelas renderizado:', novelas.length);
        } else {
            hideSection('novela-section');
        }
        
        console.log('🎉 Todas as seções renderizadas com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar seções:', error);
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

// ===== PÁGINA DE DETALHES =====
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
    
    console.log('🎬 Página de detalhes aberta:', movie.titulo);
}

// ===== FUNÇÕES DE CONTROLE DE PÁGINAS =====
function hideAllPages() {
    elements.categoryPage.style.display = 'none';
    elements.liveTvPage.style.display = 'none';
    elements.detailsPage.style.display = 'none';
    
    elements.categoryPage.classList.remove('active');
    elements.liveTvPage.classList.remove('active');
    elements.detailsPage.classList.remove('active');
    
    document.querySelector('.hero-banner').parentElement.style.display = 'none';
    document.querySelector('.menu-cards-section').style.display = 'none';
    document.querySelector('.content-section').style.display = 'none';
}

function showHomePage() {
    hideAllPages();
    currentPage = 'home';
    currentFilter = null;
    
    document.querySelector('.hero-banner').parentElement.style.display = 'block';
    document.querySelector('.menu-cards-section').style.display = 'block';
    document.querySelector('.content-section').style.display = 'block';
    
    renderHomeSections();
}

// ===== TRAILER MODAL =====
function showTrailerModal(movie) {
    if (!movie.trailer) return;
    
    const trailerUrl = convertToEmbedUrl(movie.trailer);
    elements.trailerPlayer.src = trailerUrl;
    elements.trailerModal.classList.add('active');
}

function hideTrailerModal() {
    elements.trailerModal.classList.remove('active');
    elements.trailerPlayer.src = '';
}

function convertToEmbedUrl(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    
    if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    
    return url;
}

// ===== PLAYER =====
function playMovie(movie, startTime = null) {
    currentMovie = movie;
    
    if (playerInstance) {
        playerInstance.destroy();
    }
    
    if (startTime === null) {
        const continueData = JSON.parse(localStorage.getItem('continueWatching')) || {};
        const movieContinueData = continueData[movie.titulo];
        startTime = movieContinueData ? movieContinueData.currentTime : 0;
    }
    
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
    
    playerInstance.on(Clappr.Events.PLAYER_TIMEUPDATE, onTimeUpdate);
    playerInstance.on(Clappr.Events.PLAYER_ENDED, onPlayerEnded);
    
    const progressInterval = setInterval(() => {
        updateContinueWatchingProgress();
    }, 5000);
    
    playerInstance.on(Clappr.Events.PLAYER_DESTROY, () => {
        clearInterval(progressInterval);
    });
    
    elements.playerOverlay.classList.add('active');
    saveContinueWatching(movie.titulo, startTime || 0, 0);
}

function updateContinueWatchingProgress() {
    if (playerInstance && currentMovie) {
        const currentTime = playerInstance.getCurrentTime();
        const duration = playerInstance.getDuration();
        
        if (currentTime && duration) {
            saveContinueWatching(currentMovie.titulo, currentTime, duration);
        }
    }
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
        removeFromContinueWatching(currentMovie.titulo);
        
        const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
        if (!watchedMovies.includes(currentMovie.titulo)) {
            watchedMovies.push(currentMovie.titulo);
            localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
        }
    }
    
    setTimeout(() => {
        hidePlayer();
    }, 3000);
}

function hidePlayer() {
    if (playerInstance) {
        playerInstance.destroy();
        playerInstance = null;
    }
    elements.playerOverlay.classList.remove('active');
}

// ===== HERO BANNER =====
function updateHeroBanner() {
    loadMovies().then(movies => {
        if (movies.length > 0) {
            const featuredMovie = movies[Math.floor(Math.random() * movies.length)];
            
            elements.heroLogo.src = featuredMovie.logo_titulo || featuredMovie.poster;
            elements.heroYear.textContent = featuredMovie.year;
            elements.heroRating.textContent = `⭐ ${featuredMovie.rating}`;
            elements.heroGenre.textContent = Array.isArray(featuredMovie.genero) 
                ? featuredMovie.genero.join(' • ') 
                : featuredMovie.genero;
            elements.heroDescription.textContent = featuredMovie.desc;
            elements.heroBackdrop.style.backgroundImage = `url(${featuredMovie.backdrop})`;
            
            elements.playBtn.onclick = () => playMovie(featuredMovie);
            elements.trailerBtn.onclick = () => showTrailerModal(featuredMovie);
            
            elements.heroBanner.classList.add('hero-loaded');
            
            console.log('🎬 Hero Banner atualizado:', featuredMovie.titulo);
        }
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Botões voltar
    elements.backButton.addEventListener('click', showHomePage);
    elements.liveBackButton.addEventListener('click', showHomePage);
    elements.detailsBackButton.addEventListener('click', showHomePage);
    
    // Modal close buttons
    elements.closeModal.addEventListener('click', hideTrailerModal);
    elements.closeTrailerModal.addEventListener('click', hideTrailerModal);
    elements.closePlayer.addEventListener('click', hidePlayer);
    
    // Click outside modal to close
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
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.playerOverlay.classList.contains('active')) {
                hidePlayer();
            } else if (elements.trailerModal.classList.contains('active')) {
                hideTrailerModal();
            } else if (currentPage !== 'home') {
                showHomePage();
            }
        }
    });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

async function initialize() {
    console.log('🚀 Inicializando PaixãoFlix Disney+ V2...');
    
    renderHomeSections();
    updateHeroBanner();
    setupEventListeners();
    
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    console.log('✅ PaixãoFlix inicializado com sucesso!');
}
