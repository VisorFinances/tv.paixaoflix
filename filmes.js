// StreamFlix - Página de Filmes com JSON Externo

document.addEventListener('DOMContentLoaded', function() {
    
    let moviesData = {
        releases2024: [],
        action: [],
        comedy: [],
        horror: [],
        romance: [],
        drama: [],
        scifi: [],
        classic: [],
        national: [],
        awarded: []
    };

    let currentPlayer = null;

    // Carregar dados do JSON externo
    async function loadMoviesFromJSON() {
        try {
            console.log('🔄 Carregando filmes do JSON externo...');
            const response = await fetch('https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/refs/heads/main/data/filmes');
            const movies = await response.json();
            
            // Processar e categorizar filmes
            movies.forEach(movie => {
                const processedMovie = {
                    id: movie.tmdb_id || Math.random().toString(36).substr(2, 9),
                    title: movie.titulo,
                    year: movie.year || '2024',
                    genre: movie.genero || movie.categories?.[0] || 'Geral',
                    rating: movie.rating || '5.0',
                    duration: movie.duration || '2h 00min',
                    description: movie.desc || 'Filme incrível para toda família.',
                    poster: movie.poster || `https://picsum.photos/300/450?random=${Math.random()}`,
                    stream: movie.url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    type: 'movie'
                };

                // Categorizar filmes
                if (movie.categories) {
                    movie.categories.forEach(category => {
                        categorizeMovie(processedMovie, category);
                    });
                } else if (movie.genero) {
                    categorizeMovie(processedMovie, movie.genero);
                } else {
                    // Adicionar a lançamentos se não tiver categoria
                    moviesData.releases2024.push(processedMovie);
                }

                // Adicionar a premiados se tiver rating alto
                if (parseFloat(movie.rating) >= 7.0) {
                    moviesData.awarded.push({
                        ...processedMovie,
                        award: 'Premiado',
                        awardYear: movie.year || '2024'
                    });
                }
            });

            console.log('✅ Filmes carregados e categorizados:', moviesData);
            renderMovieSections();
            
        } catch (error) {
            console.error('❌ Erro ao carregar JSON:', error);
            // Carregar dados de fallback
            loadFallbackData();
        }
    }

    // Função para categorizar filmes
    function categorizeMovie(movie, category) {
        const normalizedCategory = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        switch(normalizedCategory) {
            case 'lancamento 2026':
            case 'lancamento':
                moviesData.releases2024.push(movie);
                break;
            case 'acao':
            case 'ação':
                moviesData.action.push(movie);
                break;
            case 'comedia':
            case 'comédia':
                moviesData.comedy.push(movie);
                break;
            case 'terror':
                moviesData.horror.push(movie);
                break;
            case 'romance':
                moviesData.romance.push(movie);
                break;
            case 'drama':
                moviesData.drama.push(movie);
                break;
            case 'sci-fi':
            case 'ficcao':
            case 'ficção científica':
                moviesData.scifi.push(movie);
                break;
            case 'classico':
            case 'clássicos':
                moviesData.classic.push(movie);
                break;
            case 'nacional':
            case 'brasileiro':
                moviesData.national.push(movie);
                break;
            case 'anime':
                moviesData.scifi.push(movie); // Adicionar a ficção científica por enquanto
                break;
            case 'animacao':
            case 'animação':
                moviesData.comedy.push(movie); // Adicionar a comédia por enquanto
                break;
            default:
                // Adicionar a lançamentos se não se encaixar
                if (!moviesData.releases2024.find(m => m.id === movie.id)) {
                    moviesData.releases2024.push(movie);
                }
        }
    }

    // Dados de fallback (apenas mídias que não estão no JSON externo)
    function loadFallbackData() {
        console.log('🔄 Carregando dados de fallback...');
        moviesData = {
            releases2024: [
                // Apenas mídias não presentes no JSON
                { id: 1, title: "Ação Explosiva 2024", year: 2024, genre: "acao", rating: "4.8", duration: "2h 15min", poster: "https://picsum.photos/300/450?random=movie1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 2, title: "Missão Impossível", year: 2024, genre: "acao", rating: "4.8", duration: "2h 30min", poster: "https://picsum.photos/300/450?random=action1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            action: [
                { id: 3, title: "Velocidade Máxima", year: 2024, genre: "acao", rating: "4.6", duration: "2h 00min", poster: "https://picsum.photos/300/450?random=action2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 4, title: "Herói em Ação", year: 2024, genre: "acao", rating: "4.7", duration: "2h 15min", poster: "https://picsum.photos/300/450?random=action3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            comedy: [
                { id: 5, title: "Comédia Leve", year: 2024, genre: "comedia", rating: "4.3", duration: "1h 30min", poster: "https://picsum.photos/300/450?random=comedy1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 6, title: "Risada Garantida", year: 2024, genre: "comedia", rating: "4.5", duration: "1h 45min", poster: "https://picsum.photos/300/450?random=comedy2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            horror: [
                { id: 7, title: "Terror Noturno", year: 2024, genre: "terror", rating: "4.6", duration: "2h 00min", poster: "https://picsum.photos/300/450?random=horror1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 8, title: "Pesadelo", year: 2024, genre: "terror", rating: "4.4", duration: "1h 50min", poster: "https://picsum.photos/300/450?random=horror2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            romance: [
                { id: 9, title: "Amor Eterno", year: 2024, genre: "romance", rating: "4.8", duration: "2h 00min", poster: "https://picsum.photos/300/450?random=romance1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 10, title: "Encontro Perfeito", year: 2024, genre: "romance", rating: "4.6", duration: "1h 45min", poster: "https://picsum.photos/300/450?random=romance2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            drama: [
                { id: 11, title: "Drama Intenso", year: 2024, genre: "drama", rating: "4.9", duration: "2h 30min", poster: "https://picsum.photos/300/450?random=drama1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 12, title: "Vidas Cruzadas", year: 2024, genre: "drama", rating: "4.7", duration: "2h 15min", poster: "https://picsum.photos/300/450?random=drama2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            scifi: [
                { id: 13, title: "Ficção Científica", year: 2024, genre: "ficcao", rating: "4.7", duration: "2h 40min", poster: "https://picsum.photos/300/450?random=scifi1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 14, title: "Viagem no Tempo", year: 2024, genre: "ficcao", rating: "4.5", duration: "2h 25min", poster: "https://picsum.photos/300/450?random=scifi2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            classic: [
                { id: 15, title: "Clássico 1970", year: 1970, genre: "classico", rating: "4.9", duration: "2h 00min", poster: "https://picsum.photos/300/450?random=classic1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 16, title: "Clássico 1980", year: 1980, genre: "classico", rating: "4.8", duration: "2h 15min", poster: "https://picsum.photos/300/450?random=classic2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            national: [
                { id: 17, title: "Filme Brasileiro 1", year: 2024, genre: "nacional", rating: "4.5", duration: "2h 00min", poster: "https://picsum.photos/300/450?random=national1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                { id: 18, title: "Filme Brasileiro 2", year: 2024, genre: "nacional", rating: "4.3", duration: "1h 45min", poster: "https://picsum.photos/300/450?random=national2", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ],
            awarded: [
                { id: 19, title: "Filme Premiado", year: 2024, genre: "drama", rating: "4.9", award: "Oscar", awardYear: 2024, duration: "2h 30min", poster: "https://picsum.photos/300/450?random=awarded1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
            ]
        };
        renderMovieSections();
    }

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
    function renderMovieSections() {
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
            <img src="${movie.poster || movie.image}" alt="${movie.title}">
            <div class="card-overlay">
                <h3 class="card-title">${movie.title}</h3>
                <p class="card-info">${movie.year} • ${movie.duration || '2h 00min'} • ⭐ ${movie.rating}</p>
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
            <div class="award-badge">${movie.award || 'Premiado'}</div>
            <img src="${movie.poster || movie.image}" alt="${movie.title}">
            <div class="award-info">${movie.award || 'Premiado'} ${movie.awardYear || movie.year}</div>
            <div class="card-overlay">
                <h3 class="card-title">${movie.title}</h3>
                <p class="card-info">${movie.year} • ${movie.duration || '2h 00min'} • ⭐ ${movie.rating}</p>
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
                <img src="${movie.poster || movie.image}" alt="${movie.title}" style="width: 200px; height: 300px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h2>${movie.title}</h2>
                    <p style="color: #ccc;">${movie.year} • ${movie.duration || '2h 00min'} • ${movie.genre}</p>
                    <p style="color: #ff2e2e;">⭐ ${movie.rating}</p>
                    <p style="margin: 20px 0;">${movie.description || 'Esta é uma descrição detalhada do filme selecionado. Uma história envolvente com atuações incríveis e direção de primeira linha.'}</p>
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
        // Tocar o primeiro filme disponível
        const firstMovie = moviesData.releases2024[0] || moviesData.action[0];
        if (firstMovie) {
            playVideo(firstMovie.title, firstMovie.stream);
        }
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
    loadMoviesFromJSON();
    console.log('✅ Página de Filmes com JSON externo iniciada!');
});
