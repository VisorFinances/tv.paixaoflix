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
                    categories: movie.categories || [],
                    rating: movie.rating || '5.0',
                    duration: movie.duration || '2h 00min',
                    description: movie.desc || 'Filme incrível para toda família.',
                    poster: movie.poster || `https://picsum.photos/300/450?random=${Math.random()}`,
                    stream: movie.url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    type: 'movie'
                };

                // Categorizar por categories (prioridade) e depois por genero
                let categorized = false;
                
                // Tentar categorizar por categories primeiro
                if (movie.categories && movie.categories.length > 0) {
                    movie.categories.forEach(category => {
                        if (!categorized) {
                            categorizeMovie(processedMovie, category);
                            categorized = true;
                        }
                    });
                }
                
                // Se não categorizado por categories, tentar por genero
                if (!categorized && movie.genero) {
                    categorizeMovie(processedMovie, movie.genero);
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
            releases2024: [],
            releases2025: [],
            action: [],
            comedy: [],
            horror: [],
            romance: [],
            drama: [],
            scifi: [],
            classic: [],
            national: [],
            awarded: [],
            adult: []
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
        
        // Lançamentos 2026
        const releases2026Grid = document.getElementById('releases2024Grid');
        moviesData.releases2024.forEach(movie => {
            releases2026Grid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(releases2026Grid, 'releases2024');

        // Lançamentos 2025
        const releases2025Grid = document.getElementById('releases2025Grid');
        moviesData.releases2025.forEach(movie => {
            releases2025Grid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(releases2025Grid, 'releases2025');

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

        // Adulto
        const adultGrid = document.getElementById('adultGrid');
        moviesData.adult.forEach(movie => {
            adultGrid.appendChild(createMovieCard(movie));
        });
        setupInfiniteScroll(adultGrid, 'adult');

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
    
    // Hero Banner com capas dos filmes
    function rotateHeroBanner() {
        const heroImage = document.getElementById('heroImage');
        const heroTitle = document.getElementById('heroTitle');
        const heroDescription = document.getElementById('heroDescription');
        
        if (heroImage && heroTitle && heroDescription) {
            // Coletar todas as capas dos filmes
            const allMovies = [
                ...moviesData.releases2024,
                ...moviesData.releases2025,
                ...moviesData.action,
                ...moviesData.comedy,
                ...moviesData.horror,
                ...moviesData.romance,
                ...moviesData.drama,
                ...moviesData.scifi,
                ...moviesData.classic,
                ...moviesData.national,
                ...moviesData.awarded,
                ...moviesData.adult
            ];
            
            // Selecionar capa aleatória
            const randomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
            
            // Fade out
            heroImage.style.opacity = '0';
            heroTitle.style.opacity = '0';
            heroDescription.style.opacity = '0';
            
            setTimeout(() => {
                // Update content
                heroImage.src = randomMovie.poster || randomMovie.image;
                heroTitle.textContent = randomMovie.title;
                heroDescription.textContent = `${randomMovie.year} • ${randomMovie.genre || 'Geral'} • ⭐ ${randomMovie.rating}`;
                
                // Fade in
                setTimeout(() => {
                    heroImage.style.opacity = '1';
                    heroTitle.style.opacity = '1';
                    heroDescription.style.opacity = '1';
                }, 100);
            }, 500);
        }
    }
});
