// StreamFlix - Página de Filmes

document.addEventListener('DOMContentLoaded', function() {
    
    // Base de dados de filmes
    const moviesData = {
        releases2024: [
            { id: 1, title: "Ação Explosiva 2024", year: 2024, genre: "acao", rating: "4.8", duration: "2h 15min", image: "https://picsum.photos/300/450?random=movie1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 2, title: "Romance Moderno", year: 2024, genre: "romance", rating: "4.6", duration: "1h 45min", image: "https://picsum.photos/300/450?random=movie2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 3, title: "Comédia do Ano", year: 2024, genre: "comedia", rating: "4.7", duration: "1h 30min", image: "https://picsum.photos/300/450?random=movie3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 4, title: "Terror Psicológico", year: 2024, genre: "terror", rating: "4.5", duration: "2h 00min", image: "https://picsum.photos/300/450?random=movie4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 5, title: "Drama Intenso", year: 2024, genre: "drama", rating: "4.9", duration: "2h 20min", image: "https://picsum.photos/300/450?random=movie5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        action: [
            { id: 6, title: "Missão Impossível", year: 2024, genre: "acao", rating: "4.8", duration: "2h 30min", image: "https://picsum.photos/300/450?random=action1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 7, title: "Velocidade Máxima", year: 2023, genre: "acao", rating: "4.6", duration: "2h 00min", image: "https://picsum.photos/300/450?random=action2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 8, title: "Herói em Ação", year: 2024, genre: "acao", rating: "4.7", duration: "2h 15min", image: "https://picsum.photos/300/450?random=action3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 9, title: "Batalha Final", year: 2023, genre: "acao", rating: "4.5", duration: "2h 45min", image: "https://picsum.photos/300/450?random=action4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 10, title: "Resgate Urgente", year: 2024, genre: "acao", rating: "4.8", duration: "2h 10min", image: "https://picsum.photos/300/450?random=action5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 11, title: "Guerra Civil", year: 2024, genre: "acao", rating: "4.9", duration: "2h 40min", image: "https://picsum.photos/300/450?random=action6", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" }
        ],
        comedy: [
            { id: 12, title: "Comédia Leve", year: 2024, genre: "comedia", rating: "4.3", duration: "1h 30min", image: "https://picsum.photos/300/450?random=comedy1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 13, title: "Risada Garantida", year: 2023, genre: "comedia", rating: "4.5", duration: "1h 45min", image: "https://picsum.photos/300/450?random=comedy2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 14, title: "Piadas Mortais", year: 2024, genre: "comedia", rating: "4.2", duration: "1h 25min", image: "https://picsum.photos/300/450?random=comedy3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 15, title: "Comédia Romântica", year: 2024, genre: "comedia", rating: "4.4", duration: "1h 40min", image: "https://picsum.photos/300/450?random=comedy4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 16, title: "Humor Negro", year: 2023, genre: "comedia", rating: "4.1", duration: "1h 35min", image: "https://picsum.photos/300/450?random=comedy5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        horror: [
            { id: 17, title: "Terror Noturno", year: 2024, genre: "terror", rating: "4.6", duration: "2h 00min", image: "https://picsum.photos/300/450?random=horror1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 18, title: "Pesadelo", year: 2023, genre: "terror", rating: "4.4", duration: "1h 50min", image: "https://picsum.photos/300/450?random=horror2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 19, title: "Casa Assombrada", year: 2024, genre: "terror", rating: "4.7", duration: "2h 10min", image: "https://picsum.photos/300/450?random=horror3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 20, title: "Horror Psicológico", year: 2024, genre: "terror", rating: "4.5", duration: "2h 20min", image: "https://picsum.photos/300/450?random=horror4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 21, title: "Zumbi Apocalypse", year: 2023, genre: "terror", rating: "4.3", duration: "2h 15min", image: "https://picsum.photos/300/450?random=horror5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        romance: [
            { id: 22, title: "Amor Eterno", year: 2024, genre: "romance", rating: "4.8", duration: "2h 00min", image: "https://picsum.photos/300/450?random=romance1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 23, title: "Encontro Perfeito", year: 2023, genre: "romance", rating: "4.6", duration: "1h 45min", image: "https://picsum.photos/300/450?random=romance2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 24, title: "Paixão Proibida", year: 2024, genre: "romance", rating: "4.7", duration: "2h 10min", image: "https://picsum.photos/300/450?random=romance3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 25, title: "Coração Partido", year: 2024, genre: "romance", rating: "4.5", duration: "1h 55min", image: "https://picsum.photos/300/450?random=romance4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 26, title: "Amor à Primeira Vista", year: 2023, genre: "romance", rating: "4.4", duration: "2h 05min", image: "https://picsum.photos/300/450?random=romance5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        drama: [
            { id: 27, title: "Drama Intenso", year: 2024, genre: "drama", rating: "4.9", duration: "2h 30min", image: "https://picsum.photos/300/450?random=drama1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 28, title: "Vidas Cruzadas", year: 2023, genre: "drama", rating: "4.7", duration: "2h 15min", image: "https://picsum.photos/300/450?random=drama2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 29, title: "Justiça", year: 2024, genre: "drama", rating: "4.8", duration: "2h 45min", image: "https://picsum.photos/300/450?random=drama3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 30, title: "Redenção", year: 2024, genre: "drama", rating: "4.6", duration: "2h 20min", image: "https://picsum.photos/300/450?random=drama4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 31, title: "Esperança", year: 2023, genre: "drama", rating: "4.5", duration: "2h 00min", image: "https://picsum.photos/300/450?random=drama5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        scifi: [
            { id: 32, title: "Ficção Científica", year: 2024, genre: "ficcao", rating: "4.7", duration: "2h 40min", image: "https://picsum.photos/300/450?random=scifi1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 33, title: "Viagem no Tempo", year: 2023, genre: "ficcao", rating: "4.5", duration: "2h 25min", image: "https://picsum.photos/300/450?random=scifi2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 34, title: "Marte", year: 2024, genre: "ficcao", rating: "4.8", duration: "2h 50min", image: "https://picsum.photos/300/450?random=scifi3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 35, title: "Robôs", year: 2024, genre: "ficcao", rating: "4.6", duration: "2h 15min", image: "https://picsum.photos/300/450?random=scifi4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 36, title: "Espaço Sideral", year: 2023, genre: "ficcao", rating: "4.4", duration: "2h 30min", image: "https://picsum.photos/300/450?random=scifi5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        classic: [
            { id: 37, title: "Clássico 1970", year: 1970, genre: "classico", rating: "4.9", duration: "2h 00min", image: "https://picsum.photos/300/450?random=classic1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 38, title: "Clássico 1980", year: 1980, genre: "classico", rating: "4.8", duration: "2h 15min", image: "https://picsum.photos/300/450?random=classic2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 39, title: "Clássico 1990", year: 1990, genre: "classico", rating: "4.7", duration: "2h 30min", image: "https://picsum.photos/300/450?random=classic3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 40, title: "Clássico 2000", year: 2000, genre: "classico", rating: "4.6", duration: "2h 10min", image: "https://picsum.photos/300/450?random=classic4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 41, title: "Clássico 2010", year: 2010, genre: "classico", rating: "4.5", duration: "2h 20min", image: "https://picsum.photos/300/450?random=classic5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        national: [
            { id: 42, title: "Filme Brasileiro 1", year: 2024, genre: "nacional", rating: "4.5", duration: "2h 00min", image: "https://picsum.photos/300/450?random=national1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 43, title: "Filme Brasileiro 2", year: 2023, genre: "nacional", rating: "4.3", duration: "1h 45min", image: "https://picsum.photos/300/450?random=national2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 44, title: "Filme Brasileiro 3", year: 2024, genre: "nacional", rating: "4.6", duration: "2h 15min", image: "https://picsum.photos/300/450?random=national3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 45, title: "Filme Brasileiro 4", year: 2023, genre: "nacional", rating: "4.4", duration: "1h 50min", image: "https://picsum.photos/300/450?random=national4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 46, title: "Filme Brasileiro 5", year: 2024, genre: "nacional", rating: "4.7", duration: "2h 05min", image: "https://picsum.photos/300/450?random=national5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ],
        awarded: [
            { id: 47, title: "Filme Premiado 1", year: 2024, genre: "drama", rating: "4.9", award: "Oscar", awardYear: 2024, duration: "2h 30min", image: "https://picsum.photos/300/450?random=awarded1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 48, title: "Filme Premiado 2", year: 2023, genre: "acao", rating: "4.8", award: "Globo de Ouro", awardYear: 2023, duration: "2h 15min", image: "https://picsum.photos/300/450?random=awarded2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 49, title: "Filme Premiado 3", year: 2024, genre: "drama", rating: "4.7", award: "Cannes", awardYear: 2024, duration: "2h 45min", image: "https://picsum.photos/300/450?random=awarded3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 50, title: "Filme Premiado 4", year: 2023, genre: "comedia", rating: "4.6", award: "BAFTA", awardYear: 2023, duration: "2h 00min", image: "https://picsum.photos/300/450?random=awarded4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 51, title: "Filme Premiado 5", year: 2024, genre: "ficcao", rating: "4.8", award: "SAG Award", awardYear: 2024, duration: "2h 20min", image: "https://picsum.photos/300/450?random=awarded5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
        ]
    };

    let currentPlayer = null;

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(0,0,0,0.95)';
        } else {
            header.style.background = 'rgba(0,0,0,0.9)';
        }
    });

    // Navigation
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Load all movie sections
    function loadMovieSections() {
        console.log('🔄 Carregando seções de filmes...');
        
        // Lançamentos 2024
        const releases2024Grid = document.getElementById('releases2024Grid');
        moviesData.releases2024.forEach(movie => {
            releases2024Grid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(releases2024Grid, 'releases2024');

        // Ação
        const actionGrid = document.getElementById('actionGrid');
        moviesData.action.forEach(movie => {
            actionGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(actionGrid, 'action');

        // Comédia
        const comedyGrid = document.getElementById('comedyGrid');
        moviesData.comedy.forEach(movie => {
            comedyGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(comedyGrid, 'comedy');

        // Terror
        const horrorGrid = document.getElementById('horrorGrid');
        moviesData.horror.forEach(movie => {
            horrorGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(horrorGrid, 'horror');

        // Romance
        const romanceGrid = document.getElementById('romanceGrid');
        moviesData.romance.forEach(movie => {
            romanceGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(romanceGrid, 'romance');

        // Drama
        const dramaGrid = document.getElementById('dramaGrid');
        moviesData.drama.forEach(movie => {
            dramaGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(dramaGrid, 'drama');

        // Ficção Científica
        const scifiGrid = document.getElementById('scifiGrid');
        moviesData.scifi.forEach(movie => {
            scifiGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(scifiGrid, 'scifi');

        // Clássicos
        const classicGrid = document.getElementById('classicGrid');
        moviesData.classic.forEach(movie => {
            classicGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(classicGrid, 'classic');

        // Nacionais
        const nationalGrid = document.getElementById('nationalGrid');
        moviesData.national.forEach(movie => {
            nationalGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(nationalGrid, 'national');

        // Premiados
        const awardedGrid = document.getElementById('awardedGrid');
        moviesData.awarded.forEach(movie => {
            awardedGrid.appendChild(createAwardedMovieCard(movie));
        });
        setupInfiniteScroll(awardedGrid, 'awarded');

        console.log('✅ Seções de filmes carregadas com sucesso!');
    }

    // Create movie card
    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}">
            <div class="card-overlay">
                <h3 class="card-title">${movie.title}</h3>
                <p class="card-info">${movie.year} • ${movie.duration} • ⭐ ${movie.rating}</p>
            </div>
        `;
        
        card.addEventListener('click', () => showMovieModal(movie));
        return card;
    }

    // Create awarded movie card
    function createAwardedMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="award-badge">${movie.award}</div>
            <img src="${movie.image}" alt="${movie.title}">
            <div class="award-info">${movie.award} ${movie.awardYear}</div>
            <div class="card-overlay">
                <h3 class="card-title">${movie.title}</h3>
                <p class="card-info">${movie.year} • ${movie.duration} • ⭐ ${movie.rating}</p>
            </div>
        `;
        
        card.addEventListener('click', () => showMovieModal(movie));
        return card;
    }

    // Infinite Scroll System
    function setupInfiniteScroll(grid, sectionName) {
        let isLoading = false;
        let page = 1;
        const itemsPerPage = 10;
        
        grid.addEventListener('scroll', function() {
            const scrollLeft = grid.scrollLeft;
            const scrollWidth = grid.scrollWidth;
            const clientWidth = grid.clientWidth;
            
            if (scrollLeft + clientWidth >= scrollWidth - 100 && !isLoading) {
                loadMoreMovies(grid, sectionName, page, itemsPerPage);
            }
        });
    }
    
    function loadMoreMovies(grid, sectionName, currentPage, itemsPerPage) {
        const sectionData = moviesData[sectionName];
        if (!sectionData || sectionData.length === 0) return;
        
        const loadingCard = document.createElement('div');
        loadingCard.className = 'card loading-card';
        loadingCard.innerHTML = '<div class="loading-spinner">Carregando...</div>';
        grid.appendChild(loadingCard);
        
        setTimeout(() => {
            loadingCard.remove();
            
            const startIndex = (currentPage * itemsPerPage) % sectionData.length;
            const endIndex = Math.min(startIndex + itemsPerPage, sectionData.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const movie = sectionData[i];
                let card;
                
                if (sectionName === 'awarded') {
                    card = createAwardedMovieCard(movie);
                } else {
                    card = createMovieCard(movie);
                }
                
                grid.appendChild(card);
            }
            
            const newCards = grid.querySelectorAll('.card:nth-last-child(-n+' + itemsPerPage + ')');
            newCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0)';
                }, index * 50);
            });
            
        }, 1000);
    }

    // Modal functions
    function showMovieModal(movie) {
        const modal = document.getElementById('contentModal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${movie.image}" alt="${movie.title}" style="width: 200px; height: 300px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h2>${movie.title}</h2>
                    <p style="color: #ccc;">${movie.year} • ${movie.duration} • ${movie.genre}</p>
                    <p style="color: #ff2e2e;">⭐ ${movie.rating}</p>
                    <p style="margin: 20px 0;">Esta é uma descrição detalhada do filme selecionado. Uma história envolvente com atuações incríveis e direção de primeira linha.</p>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <button class="btn-primary" onclick="playVideo('${movie.title}', '${movie.stream}')">▶ Assistir Agora</button>
                        <button class="btn-secondary" onclick="closeContentModal()">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    window.closeContentModal = function() {
        document.getElementById('contentModal').style.display = 'none';
    };

    // Player functions
    window.playVideo = function(title, stream) {
        closeContentModal();
        const modal = document.getElementById('playerModal');
        const container = document.getElementById('playerContainer');
        
        modal.style.display = 'flex';
        
        if (currentPlayer) {
            currentPlayer.destroy();
        }
        
        currentPlayer = new Clappr.Player({
            source: stream,
            parentId: '#playerContainer',
            width: '100%',
            height: '100%',
            autoPlay: true
        });
        
        console.log(`🎬 Reproduzindo filme: ${title}`);
    };

    window.closePlayer = function() {
        if (currentPlayer) {
            currentPlayer.destroy();
            currentPlayer = null;
        }
        document.getElementById('playerModal').style.display = 'none';
    };

    // Hero functions
    window.playFeatured = function() {
        playVideo('Ação Explosiva 2024', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    };

    window.showPlans = function() {
        alert('Planos de assinatura em breve!');
    };

    // Search
    document.getElementById('searchBtn').addEventListener('click', function() {
        const query = prompt('Buscar filmes:');
        if (query) {
            const allMovies = [
                ...moviesData.releases2024,
                ...moviesData.action,
                ...moviesData.comedy,
                ...moviesData.horror,
                ...moviesData.romance,
                ...moviesData.drama,
                ...moviesData.scifi,
                ...moviesData.classic,
                ...moviesData.national,
                ...moviesData.awarded
            ];
            
            const results = allMovies.filter(movie => 
                movie.title.toLowerCase().includes(query.toLowerCase())
            );
            
            if (results.length > 0) {
                showMovieModal(results[0]);
            } else {
                alert('Nenhum filme encontrado');
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePlayer();
            closeContentModal();
        }
    });

    // Initialize
    loadMovieSections();
    console.log('✅ Página de Filmes iniciada com sucesso!');
});
