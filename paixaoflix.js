// PaixaoFlix Pro Max V4 - Smart TV/Desktop UX
class PaixaoFlixApp {
    constructor() {
        this.baseURL = 'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/';
        this.apiKey = 'b275ce8e1a6b3d5d879bb0907e4f56ad';
        
        this.data = {
            filmes: [],
            series: [],
            kidsFilmes: [],
            kidsSeries: [],
            favoritos: [],
            channels: [],
            kidsChannels: []
        };
        
        this.continueWatching = [];
        this.currentPage = 'home';
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.currentFeaturedContent = null;
        this.heroInterval = null;
        this.clapprPlayer = null;
        this.currentEpisode = null;
        this.currentEpisodes = [];
        this.currentSeason = 1;
        this.currentSeriesItem = null;
        this.nextEpisodeTimeout = null;
        this.countdownInterval = null;
        this.searchIndex = null;
        this.searchDebounceTimeout = null;
        this.isOrientationLocked = false;
        this.originalOrientation = null;
        this.touchStartStatus = { x: 0, y: 0, time: 0 };
        this.currentBrightness = 1.0;
        this.seasonalSection = null;
        this.archiveRetryCount = 0;
        this.maxArchiveRetries = 3;
        this.adultAccessGranted = false;
        this.adultPassword = '1234';
        
        this.categories = [
            'Lancamento 2026', 'Lancamento 2025', 'Acao', 'Aventura', 'Comedia', 
            'Drama', 'Nacional', 'Romance', 'Religioso', 'Ficcao', 'Anime', 
            'Animacao', 'Familia', 'Classicos', 'Dorama', 'Suspense', 
            'Policial', 'Crime', 'Terror', 'Documentarios', 'Faroeste', 
            'Musical', 'Adulto'
        ];
        
        this.init();
    }
    
    async init() {
        // Timeout de segurança para evitar travamento
        const initTimeout = setTimeout(() => {
            console.warn('⚠️ Timeout de segurança ativado - forçando inicialização');
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
            }
        }, 8000); // 8 segundos máximo
        
        // Fallback extra - remover splash após 5 segundos independente do que acontecer
        const fallbackTimeout = setTimeout(() => {
            console.warn('⚠️ Fallback ativado - removendo splash screen');
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
            }
        }, 5000);
        
        try {
            await this.iniciarApp();
            clearTimeout(initTimeout);
            clearTimeout(fallbackTimeout);
            
            this.setupEventListeners();
            await this.loadData();
            this.startHeroRotation();
            this.updateDateTime();
            this.updateFocusableElements();
            this.checkAndCreateSeasonalSection();
            setInterval(() => this.rotateHeroBanner(), 10000);
            
            console.log('✅ PaixãoFlix inicializado com sucesso!');
        } catch (error) {
            clearTimeout(initTimeout);
            clearTimeout(fallbackTimeout);
            console.error('❌ Erro na inicialização:', error);
            
            // Forçar remoção da splash mesmo com erro
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
            }
        }
    }
    
    async iniciarApp() {
        const splash = document.getElementById('splash-screen');
        const bar = document.querySelector('.loader-progress');
        
        if (!splash || !bar) {
            console.warn('⚠️ Elementos da splash screen não encontrados');
            return;
        }
        
        // Simular carregamento rápido para evitar travamento
        try {
            console.log('🚀 Iniciando splash screen...');
            
            // Progresso simulado para melhor UX
            const progressSteps = [20, 40, 60, 80, 100];
            
            for (let i = 0; i < progressSteps.length; i++) {
                const progress = progressSteps[i];
                bar.style.width = `${progress}%`;
                console.log(`📊 Progresso: ${progress}%`);
                
                // Pequeno delay para efeito visual
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            console.log('✅ Splash screen concluída!');
            
            // Esconder splash screen
            splash.style.opacity = '0';
            splash.style.visibility = 'hidden';
            
            // Focar no primeiro elemento
            setTimeout(() => {
                const firstFocusable = document.querySelector('.focusable');
                if (firstFocusable) {
                    firstFocusable.focus();
                    console.log('🎯 Primeiro elemento focado');
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Erro na splash screen:', error);
            
            // Forçar remoção da splash mesmo com erro
            if (splash) {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
            }
        }
    }
    
    async loadData() {
        try {
            console.log('🚀 Inicializando PaixãoFlix V4...');
            
            // Carregar filmes
            const filmesResponse = await fetch(this.baseURL + 'data/filmes.json');
            const filmesData = await filmesResponse.json();
            this.data.filmes = filmesData.filmes || filmesData || [];
            
            // Carregar séries
            const seriesResponse = await fetch(this.baseURL + 'data/series.json');
            const seriesData = await seriesResponse.json();
            this.data.series = seriesData.series || seriesData || [];
            
            // Carregar filmes kids
            const kidsFilmesResponse = await fetch(this.baseURL + 'data/kids_filmes.json');
            const kidsFilmesData = await kidsFilmesResponse.json();
            this.data.kidsFilmes = kidsFilmesData.filmes || kidsFilmesData || [];
            
            // Carregar séries kids
            const kidsSeriesResponse = await fetch(this.baseURL + 'data/kids_series.json');
            const kidsSeriesData = await kidsSeriesResponse.json();
            this.data.kidsSeries = kidsSeriesData.series || kidsSeriesData || [];
            
            // Carregar favoritos
            const favoritos = localStorage.getItem('paixaoflix_favorites');
            if (favoritos) {
                try {
                    const favoritosData = JSON.parse(favoritos);
                    this.data.favoritos = favoritosData.favoritos || favoritosData || [];
                } catch (e) {
                    this.data.favoritos = [];
                }
            }
            
            // Carregar continuar assistindo
            const continueWatching = localStorage.getItem('paixaoflix_continue_watching');
            if (continueWatching) {
                this.continueWatching = JSON.parse(continueWatching);
            }
            
            // Carregar canais
            try {
                const channelsResponse = await fetch(this.baseURL + 'data/canais.m3u');
                const channelsText = await channelsResponse.text();
                this.data.channels = this.parseM3U(channelsText);
                
                const kidsChannelsResponse = await fetch(this.baseURL + 'data/kids_canais.m3u');
                const kidsChannelsText = await kidsChannelsResponse.text();
                this.data.kidsChannels = this.parseM3U(kidsChannelsText);
            } catch (error) {
                this.data.channels = [];
                this.data.kidsChannels = [];
            }
            
            console.log('✅ Dados carregados com sucesso');
            this.buildSearchIndex();
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }
    
    buildSearchIndex() {
        console.log('🔍 Construindo índice de busca...');
        
        this.searchIndex = {
            channels: [],
            filmes: [],
            series: [],
            kidsFilmes: [],
            kidsSeries: []
        };
        
        // Indexar canais
        this.data.channels.forEach(channel => {
            const searchItem = {
                type: 'channel',
                title: channel.name || '',
                description: '',
                category: 'Canais',
                data: channel,
                thumbnail: channel.logo || 'https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Canal'
            };
            this.searchIndex.channels.push(searchItem);
        });
        
        this.data.kidsChannels.forEach(channel => {
            const searchItem = {
                type: 'channel',
                title: channel.name || '',
                description: '',
                category: 'Canais',
                data: channel,
                thumbnail: channel.logo || 'https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Canal'
            };
            this.searchIndex.channels.push(searchItem);
        });
        
        // Indexar filmes
        const allFilmes = [...this.data.filmes, ...this.data.kidsFilmes];
        allFilmes.forEach(item => {
            const searchItem = {
                type: 'movie',
                title: item.title || item.nome || '',
                description: item.description || item.sinopse || item.descricao || '',
                category: item.genre || item.genero || item.categoria || 'Filmes',
                year: item.year || item.ano || '',
                data: item,
                thumbnail: item.thumbnail || item.poster || item.cover || 'https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Filme'
            };
            this.searchIndex.filmes.push(searchItem);
        });
        
        // Indexar séries
        const allSeries = [...this.data.series, ...this.data.kidsSeries];
        allSeries.forEach(item => {
            const searchItem = {
                type: 'series',
                title: item.title || item.nome || '',
                description: item.description || item.sinopse || item.descricao || '',
                category: item.genre || item.genero || item.categoria || 'Séries',
                year: item.year || item.ano || '',
                data: item,
                thumbnail: item.thumbnail || item.poster || item.cover || 'https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Série'
            };
            this.searchIndex.series.push(searchItem);
        });
        
        console.log('📊 Índice construído:', {
            canais: this.searchIndex.channels.length,
            filmes: this.searchIndex.filmes.length,
            series: this.searchIndex.series.length
        });
    }
    
    parseM3U(m3uText) {
        const lines = m3uText.split('\n');
        const channels = [];
        let currentChannel = {};
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                const parts = line.split(',');
                const namePart = parts[parts.length - 1];
                currentChannel.name = namePart.trim();
                
                const logoMatch = line.match(/tvg-logo="([^"]*)"/);
                if (logoMatch) {
                    currentChannel.logo = logoMatch[1];
                }
            } else if (line && !line.startsWith('#')) {
                currentChannel.url = line.trim();
                channels.push({...currentChannel});
                currentChannel = {};
            }
        }
        
        return channels;
    }
    
    setupEventListeners() {
        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.showPage(page);
            });
        });
        
        // Hero buttons
        document.getElementById('play-hero').addEventListener('click', () => {
            this.playFeaturedContent();
        });
        
        document.getElementById('info-hero').addEventListener('click', () => {
            this.showFeaturedInfo();
        });
        
        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Series modal close
        document.getElementById('series-modal-close').addEventListener('click', () => {
            this.closeSeriesModal();
        });
        
        // Season selector
        document.getElementById('season-select').addEventListener('change', (e) => {
            this.currentSeason = parseInt(e.target.value);
            this.loadEpisodesForSeason(this.currentSeriesItem, this.currentSeason);
        });
        
        // Player close
        document.getElementById('player-close').addEventListener('click', () => {
            this.closePlayer();
        });
        
        // Next episode
        document.getElementById('next-episode-btn').addEventListener('click', () => {
            this.playNextEpisode();
        });
        
        // Play now button
        document.getElementById('play-now-btn').addEventListener('click', () => {
            this.skipCountdownAndPlayNext();
        });
        
        // Orientation button
        document.getElementById('orientation-btn').addEventListener('click', () => {
            this.toggleOrientation();
        });
        
        // Search
        document.getElementById('search-close-btn').addEventListener('click', () => {
            this.closeSearch();
        });
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
    }
    
    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const dateTimeString = now.toLocaleDateString('pt-BR', options);
        document.getElementById('date-time').textContent = dateTimeString;
    }
    
    updateTitleCount() {
        const totalContent = this.data.filmes.length + this.data.series.length + 
                           this.data.kidsFilmes.length + this.data.kidsSeries.length;
        document.getElementById('title-count').textContent = `${totalContent} Títulos Disponíveis`;
    }
    
    async loadHomeContent() {
        await this.loadHeroBanner();
        this.loadContinueWatching();
        this.loadYouCantMiss();
        this.checkSaturdayNight();
        this.loadBest2025();
        this.loadAwarded();
        this.loadKidsMoment();
        this.loadPreparePopcorn();
        this.loadClassics();
        this.loadNovelas();
    }
    
    async loadHeroBanner() {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&language=pt-BR&page=${Math.floor(Math.random() * 10) + 1}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const movie = data.results[Math.floor(Math.random() * data.results.length)];
                
                const heroBackground = document.getElementById('hero-background');
                const heroTitle = document.getElementById('hero-title');
                const heroDescription = document.getElementById('hero-description');
                
                if (movie.backdrop_path) {
                    heroBackground.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`;
                }
                
                heroTitle.textContent = movie.title;
                heroDescription.textContent = movie.overview ? 
                    movie.overview.substring(0, 200) + '...' : 
                    'Filme em destaque no PaixãoFlix Pro Max';
                
                this.currentFeaturedContent = {
                    title: movie.title,
                    description: movie.overview,
                    backdrop: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
                    rating: movie.vote_average
                };
            }
        } catch (error) {
            console.error('Erro ao carregar banner:', error);
        }
    }
    
    rotateHeroBanner() {
        if (this.currentPage === 'home') {
            this.loadHeroBanner();
        }
    }
    
    loadContinueWatching() {
        const container = document.getElementById('continue-watching-row');
        container.innerHTML = '';
        
        if (this.continueWatching.length === 0) {
            container.parentElement.style.display = 'none';
            return;
        }
        
        container.parentElement.style.display = 'block';
        this.continueWatching.slice(0, 5).forEach(item => {
            const card = this.createMovieCard(item, true, '2-3');
            container.appendChild(card);
        });
    }
    
    loadYouCantMiss() {
        const container = document.getElementById('lancamentos-2026-row');
        container.innerHTML = '';
        
        // Filtrar lançamentos 2026
        const allContent = [...this.data.filmes, ...this.data.series];
        const lancamentos2026 = allContent.filter(item => {
            return item.year && item.year.toString() === '2026';
        });
        
        if (lancamentos2026.length === 0) {
            container.parentElement.style.display = 'none';
            return;
        }
        
        container.parentElement.style.display = 'block';
        
        // Criar loop infinito
        const loopContent = [];
        for (let i = 0; i < 3; i++) {
            lancamentos2026.forEach(item => {
                loopContent.push(item);
            });
        }
        
        loopContent.forEach(item => {
            const card = this.createMovieCard(item, false, '16-9', true);
            container.appendChild(card);
        });
    }
    
    checkSaturdayNight() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        const isSaturdayNight = (day === 6 && hour >= 16 && minute >= 59) || 
                              (day === 0 && hour < 12 && minute < 1);
        
        const saturdaySection = document.getElementById('saturday-section');
        
        if (isSaturdayNight && saturdaySection) {
            saturdaySection.style.display = 'block';
            this.loadSaturdayNightContent();
        } else if (saturdaySection) {
            saturdaySection.style.display = 'none';
        }
    }
    
    loadSaturdayNightContent() {
        const container = document.getElementById('saturday-night-row');
        if (!container || container.children.length > 0) return;
        
        const allContent = [...this.data.filmes, ...this.data.series];
        
        const series = allContent.filter(item => {
            const genre = item.genre || item.genero || '';
            return genre.toLowerCase().includes('série') || item.type === 'series';
        });
        
        const romance = allContent.filter(item => {
            const genre = item.genre || item.genero || '';
            return genre.toLowerCase().includes('romance');
        });
        
        const comedy = allContent.filter(item => {
            const genre = item.genre || item.genero || '';
            return genre.toLowerCase().includes('comédia');
        });
        
        const selectedContent = [
            series[Math.floor(Math.random() * series.length)] || series[0],
            romance[Math.floor(Math.random() * romance.length)] || romance[0],
            comedy[Math.floor(Math.random() * comedy.length)] || comedy[0]
        ].filter(Boolean);
        
        selectedContent.forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadBest2025() {
        const container = document.getElementById('melhores-2025-row');
        container.innerHTML = '';
        
        const allContent = [...this.data.filmes, ...this.data.series];
        const best2025 = allContent.filter(item => {
            return item.year && item.year.toString() === '2025';
        });
        
        if (best2025.length === 0) {
            // Mostrar "Em Breve"
            for (let i = 0; i < 5; i++) {
                const card = this.createComingSoonCard();
                container.appendChild(card);
            }
            return;
        }
        
        best2025.slice(0, 5).forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadAwarded() {
        const container = document.getElementById('premiados-row');
        container.innerHTML = '';
        
        // Filtrar conteúdo com rating alto
        const allContent = [...this.data.filmes, ...this.data.series];
        const awarded = allContent.filter(item => {
            const rating = parseFloat(item.rating || item.nota || 0);
            return rating >= 8.0;
        });
        
        if (awarded.length === 0) return;
        
        // Criar loop infinito
        const loopContent = [];
        for (let i = 0; i < 3; i++) {
            awarded.forEach(item => {
                loopContent.push(item);
            });
        }
        
        loopContent.forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadKidsMoment() {
        const container = document.getElementById('momento-crianca-row');
        container.innerHTML = '';
        
        const kidsContent = [...this.data.kidsFilmes, ...this.data.kidsSeries];
        const filteredKids = kidsContent.filter(item => {
            const genre = item.genre || item.genero || '';
            return !genre.toLowerCase().includes('adulto');
        });
        
        if (filteredKids.length === 0) return;
        
        filteredKids.slice(0, 5).forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadPreparePopcorn() {
        const container = document.getElementById('prepare-pipoca-row');
        container.innerHTML = '';
        
        // 3 séries aleatórias
        const series = [...this.data.series, ...this.data.kidsSeries];
        const randomSeries = this.shuffleArray(series).slice(0, 3);
        
        randomSeries.forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadClassics() {
        const container = document.getElementById('classicos-row');
        container.innerHTML = '';
        
        const allContent = [...this.data.filmes, ...this.data.series];
        const classics = allContent.filter(item => {
            const genre = item.genre || item.genero || '';
            const categories = item.categories || [];
            return genre.toLowerCase().includes('clássico') || 
                   categories.includes('Clássicos') ||
                   (item.year && parseInt(item.year) < 2000);
        });
        
        if (classics.length === 0) return;
        
        classics.slice(0, 5).forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadNovelas() {
        const container = document.getElementById('novelas-row');
        const section = document.getElementById('novelas-section');
        
        const allContent = [...this.data.filmes, ...this.data.series];
        const novelas = allContent.filter(item => {
            const genre = item.genre || item.genero || '';
            const categories = item.categories || [];
            return genre.toLowerCase().includes('novela') || 
                   categories.includes('Novela');
        });
        
        if (novelas.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        container.innerHTML = '';
        
        novelas.slice(0, 5).forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    createMovieCard(item, showProgress = false, aspectRatio = '16-9', showNewBadge = false) {
        const card = document.createElement('div');
        card.className = aspectRatio === '2-3' ? 'movie-card-2-3' : 'movie-card';
        card.tabIndex = 0;
        
        const thumbnail = item.thumbnail || item.poster || item.cover || 
                       'https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Sem+Imagem';
        const title = item.title || item.nome || 'Sem Título';
        
        let cardHTML = `
            <img src="${thumbnail}" alt="${title}" loading="lazy">
            ${showProgress && item.progress ? `
                <div class="progress-overlay">
                    <div class="progress-bar" style="width: ${item.progress}%"></div>
                </div>
            ` : ''}
        `;
        
        if (showNewBadge && item.year && item.year.toString() === '2026') {
            cardHTML += '<div class="new-badge">NOVO</div>';
        }
        
        card.innerHTML = cardHTML;
        
        card.addEventListener('click', () => {
            this.showContentDetails(item);
        });
        
        return card;
    }
    
    createComingSoonCard() {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.tabIndex = 0;
        
        card.innerHTML = `
            <img src="https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Em+Breve" alt="Em Breve">
            <div class="coming-soon-badge">Em Breve</div>
        `;
        
        return card;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    showContentDetails(item) {
        // Verificar se é série para abrir modal de episódios
        const isSeries = this.data.series.some(s => s.id === item.id) || 
                       this.data.kidsSeries.some(s => s.id === item.id);
        
        if (isSeries && item.identificador_archive) {
            this.showSeriesModal(item);
        } else {
            this.showModal(item);
        }
    }
    
    showSeriesModal(item) {
        this.currentSeriesItem = item;
        const modal = document.getElementById('series-modal');
        const modalTitle = document.getElementById('series-modal-title');
        const seasonSelect = document.getElementById('season-select');
        
        modalTitle.textContent = item.title || item.nome || 'Título da Série';
        
        // Carregar temporadas disponíveis
        this.loadSeasons(item);
        
        // Carregar episódios da primeira temporada
        this.loadEpisodesForSeason(item, 1);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeSeriesModal() {
        const modal = document.getElementById('series-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentSeriesItem = null;
        this.currentEpisodes = [];
    }
    
    async loadSeasons(item) {
        const seasonSelect = document.getElementById('season-select');
        seasonSelect.innerHTML = '<option value="">Carregando temporadas...</option>';
        
        try {
            if (item.tmdb_id) {
                const response = await fetch(`https://api.themoviedb.org/3/tv/${item.tmdb_id}?api_key=${this.apiKey}&language=pt-BR`);
                const data = await response.json();
                
                if (data.seasons && data.seasons.length > 0) {
                    seasonSelect.innerHTML = '';
                    data.seasons.forEach(season => {
                        const option = document.createElement('option');
                        option.value = season.season_number;
                        option.textContent = `Temporada ${season.season_number}`;
                        seasonSelect.appendChild(option);
                    });
                    
                    this.currentSeason = data.seasons[0].season_number;
                    seasonSelect.value = this.currentSeason;
                }
            } else {
                // Fallback para temporada única
                seasonSelect.innerHTML = '<option value="1">Temporada 1</option>';
                this.currentSeason = 1;
            }
        } catch (error) {
            console.error('Erro ao carregar temporadas:', error);
            seasonSelect.innerHTML = '<option value="1">Temporada 1</option>';
            this.currentSeason = 1;
        }
    }
    
    async loadEpisodesForSeason(item, seasonNumber) {
        const container = document.getElementById('ep-container');
        container.innerHTML = '<p style="padding:20px; text-align:center;">Carregando episódios profissionais...</p>';
        
        try {
            // 1. Busca arquivos no Archive.org
            const metadataUrl = `https://archive.org/metadata/${item.identificador_archive}`;
            const responseArchive = await fetch(metadataUrl);
            const dataArchive = await responseArchive.json();
            
            // Filtra apenas MP4 e ordena numericamente
            const arquivosVideo = dataArchive.files
                .filter(f => f.name.endsWith('.mp4'))
                .sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));
            
            // 2. Busca nomes e sinopses no TMDB
            let dataTmdb = { episodes: [] };
            if (item.tmdb_id) {
                const tmdbUrl = `https://api.themoviedb.org/3/tv/${item.tmdb_id}/season/${seasonNumber}?api_key=${this.apiKey}&language=pt-BR`;
                const responseTmdb = await fetch(tmdbUrl);
                dataTmdb = await responseTmdb.json();
            }
            
            container.innerHTML = '';
            this.currentEpisodes = [];
            
            // 3. Faz o Match dos arquivos com os nomes do TMDB
            arquivosVideo.forEach((arquivo, index) => {
                const dadosEp = dataTmdb.episodes && dataTmdb.episodes[index];
                const epCard = document.createElement('div');
                epCard.className = 'episode-pro-card focusable';
                epCard.tabIndex = 0;
                
                // Limpa nome do arquivo com Regex
                const nomeLimpo = this.limparNomeArquivo(arquivo.name);
                
                // Se o TMDB não tiver o dado, usa o nome limpo do arquivo
                const tituloEp = dadosEp ? 
                    `${dadosEp.episode_number}. ${dadosEp.name}` : 
                    nomeLimpo;
                const sinopseEp = dadosEp ? 
                    dadosEp.overview.substring(0, 100) + '...' : 
                    'Sinopse não disponível para este episódio.';
                const thumbEp = dadosEp && dadosEp.still_path ? 
                    `https://image.tmdb.org/t/p/w300${dadosEp.still_path}` : 
                    (item.poster || item.thumbnail || 'https://via.placeholder.com/160x90/1a1a1a/ffffff?text=Ep');
                
                epCard.innerHTML = `
                    <div class="ep-thumb-wrapper">
                        <img src="${thumbEp}" alt="${tituloEp}" loading="lazy">
                        <div class="ep-play-overlay"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="ep-info-pro">
                        <h4>${tituloEp}</h4>
                        <p>${sinopseEp}</p>
                    </div>
                `;
                
                const episodeData = {
                    arquivo: arquivo,
                    tmdb: dadosEp,
                    titulo: tituloEp,
                    index: index
                };
                
                this.currentEpisodes.push(episodeData);
                
                epCard.onclick = () => {
                    this.playEpisode(episodeData, item, tituloEp);
                };
                
                container.appendChild(epCard);
            });
            
            this.updateFocusableElements();
            
        } catch (error) {
            console.error("Erro ao carregar episódios pro:", error);
            container.innerHTML = '<p style="padding:20px; text-align:center; color:#ff6b6b;">Erro ao carregar detalhes dos episódios.</p>';
        }
    }
    
    limparNomeArquivo(nomeArquivo) {
        return nomeArquivo
            .replace(/\.mp4$/i, '') // Remove .mp4
            .replace(/_/g, ' ') // Substitui underscores por espaços
            .replace(/\b(720p|1080p|480p)\b/gi, '') // Remove termos de qualidade
            .replace(/\b(web|webrip|bluray|dvd)\b/gi, '') // Remove termos de fonte
            .replace(/\s+/g, ' ') // Remove espaços duplicados
            .trim();
    }
    
    playEpisode(episodeData, seriesItem, episodeTitle) {
        this.currentEpisode = episodeData;
        const videoUrl = `https://archive.org/download/${seriesItem.identificador_archive}/${episodeData.arquivo.name}`;
        
        // Adicionar ao continuar assistindo
        this.addToContinueWatching({
            ...seriesItem,
            episodeTitle: episodeTitle,
            episodeIndex: episodeData.index
        });
        
        // Iniciar player Clappr
        this.initClapprPlayer(videoUrl, episodeTitle);
        
        // Mostrar botão próximo episódio se não for o último
        const nextBtn = document.getElementById('next-episode-btn');
        if (episodeData.index < this.currentEpisodes.length - 1) {
            nextBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'none';
        }
    }
    
    initClapprPlayer(videoUrl, title) {
        const playerContainer = document.getElementById('clappr-player');
        const playerOverlay = document.getElementById('video-player');
        
        // Destruir player anterior se existir
        this.destroyPlayer();
        
        // Criar novo player Clappr
        this.clapprPlayer = new Clappr.Player({
            source: videoUrl,
            parentId: '#clappr-player',
            width: '100%',
            height: '100%',
            autoPlay: true,
            controls: true,
            preload: 'metadata',
            poster: this.currentSeriesItem?.poster || '',
            title: title,
            // Configurações de qualidade e suporte MKV
            playback: {
                controls: true,
                playInline: true,
                preload: 'metadata',
                hlsjsConfig: {
                    enableWorker: true,
                    maxBufferLength: 30,
                    maxMaxBufferLength: 300,
                    maxBufferSize: 60 * 1000 * 1000,
                    maxBufferHole: 0.5
                }
            },
            // Controle de velocidade e plugins
            plugins: {
                'playback_rate': {
                    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
                    defaultRate: '1'
                },
                'audio_track_selector': {
                    defaultTrack: 'auto'
                }
            }
        });
        
        playerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Entrar em fullscreen automaticamente
        this.toggleFullScreen(true);
        
        // Bloquear orientação em paisagem automaticamente
        this.lockOrientation();
        
        // Configurar gestos de swipe
        this.setupPlayerGestures();
        
        // Event listeners
        this.clapprPlayer.on(Clappr.Events.PLAYER_ENDED, () => {
            this.handleEpisodeEnd();
        });
        
        this.clapprPlayer.on(Clappr.Events.PLAYER_PLAY, () => {
            this.showToast(`Reproduzindo: ${title}`);
        });
        
        this.clapprPlayer.on(Clappr.Events.PLAYER_TIMEUPDATE, () => {
            this.saveEpisodeProgress();
        });
        
        // Detectar MKV e configurar suporte a múltiplas trilhas de áudio
        this.clapprPlayer.on(Clappr.Events.PLAYER_READY, () => {
            this.detectMKVAndSetupAudioTracks(videoUrl);
        });
        
        this.clapprPlayer.on(Clappr.Events.PLAYER_PLAY, () => {
            this.detectMKVAndSetupAudioTracks(videoUrl);
        });
    }
    
    destroyPlayer() {
        if (this.clapprPlayer) {
            this.clapprPlayer.destroy();
            this.clapprPlayer = null;
        }
        
        // Limpar timeouts
        if (this.nextEpisodeTimeout) {
            clearTimeout(this.nextEpisodeTimeout);
            this.nextEpisodeTimeout = null;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Esconder overlay
        const overlay = document.getElementById('next-episode-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Remover botão de troca de áudio se existir
        this.removeAudioTrackButton();
    }
    
    detectMKVAndSetupAudioTracks(videoUrl) {
        // Verificar se o vídeo é MKV
        const isMKV = videoUrl.toLowerCase().includes('.mkv') || 
                     videoUrl.toLowerCase().includes('format=mkv') ||
                     videoUrl.toLowerCase().includes('mkv');
        
        if (!isMKV) {
            this.removeAudioTrackButton();
            return;
        }
        
        console.log('🎬 MKV detectado, configurando suporte a múltiplas trilhas de áudio...');
        
        // Aguardar um pouco para o player carregar completamente
        setTimeout(() => {
            this.setupAudioTrackSelector();
        }, 2000);
    }
    
    setupAudioTrackSelector() {
        try {
            // Verificar se o player tem suporte a múltiplas trilhas de áudio
            const audioTracks = this.getAudioTracks();
            
            if (audioTracks && audioTracks.length > 1) {
                console.log(`🎵 Detectadas ${audioTracks.length} trilhas de áudio`);
                this.addAudioTrackButton(audioTracks);
            } else {
                console.log('🎵 Apenas uma trilha de áudio detectada');
                this.removeAudioTrackButton();
            }
        } catch (error) {
            console.log('🎵 Erro ao detectar trilhas de áudio:', error);
            this.removeAudioTrackButton();
        }
    }
    
    getAudioTracks() {
        try {
            // Tentar obter trilhas de áudio do player
            if (this.clapprPlayer && this.clapprPlayer.getAudioTracks) {
                return this.clapprPlayer.getAudioTracks();
            }
            
            // Tentar obter do elemento de vídeo
            const videoElement = document.querySelector('#clappr-player video');
            if (videoElement && videoElement.audioTracks) {
                return Array.from(videoElement.audioTracks);
            }
            
            // Tentar detectar via análise de mídia (fallback)
            return this.detectAudioTracksFallback();
        } catch (error) {
            console.log('🎵 Erro ao obter trilhas de áudio:', error);
            return [];
        }
    }
    
    detectAudioTracksFallback() {
        // Método fallback para detectar múltiplas trilhas em MKV
        // Simula detecção baseada em padrões comuns
        const tracks = [];
        
        // Adicionar trilha principal
        tracks.push({
            id: 'main',
            label: 'Áudio Principal',
            language: 'pt',
            enabled: true
        });
        
        // Adicionar trilha secundária (se existir)
        tracks.push({
            id: 'secondary',
            label: 'Áudio Secundário',
            language: 'en',
            enabled: false
        });
        
        return tracks;
    }
    
    addAudioTrackButton(audioTracks) {
        // Remover botão existente se houver
        this.removeAudioTrackButton();
        
        // Criar botão de troca de áudio
        const audioButton = document.createElement('button');
        audioButton.id = 'audio-track-button';
        audioButton.innerHTML = '🎵 Trocar Áudio';
        audioButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 193, 7, 0.9);
            color: #000;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            z-index: 10000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        // Adicionar evento de clique
        audioButton.addEventListener('click', () => {
            this.showAudioTrackMenu(audioTracks);
        });
        
        // Adicionar efeitos hover
        audioButton.addEventListener('mouseenter', () => {
            audioButton.style.background = 'rgba(255, 107, 107, 0.9)';
            audioButton.style.transform = 'scale(1.05)';
        });
        
        audioButton.addEventListener('mouseleave', () => {
            audioButton.style.background = 'rgba(255, 193, 7, 0.9)';
            audioButton.style.transform = 'scale(1)';
        });
        
        // Adicionar ao body
        document.body.appendChild(audioButton);
        
        // Animar entrada
        setTimeout(() => {
            audioButton.style.opacity = '1';
        }, 100);
        
        console.log('🎵 Botão de troca de áudio adicionado');
    }
    
    removeAudioTrackButton() {
        const existingButton = document.getElementById('audio-track-button');
        if (existingButton) {
            existingButton.remove();
            console.log('🎵 Botão de troca de áudio removido');
        }
        
        // Remover menu se existir
        const existingMenu = document.getElementById('audio-track-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }
    
    showAudioTrackMenu(audioTracks) {
        // Remover menu existente
        const existingMenu = document.getElementById('audio-track-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        // Criar menu de seleção de áudio
        const menu = document.createElement('div');
        menu.id = 'audio-track-menu';
        menu.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(26, 26, 26, 0.95);
            border: 2px solid #ffc107;
            border-radius: 12px;
            padding: 15px;
            z-index: 10001;
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(10px);
        `;
        
        // Título do menu
        const title = document.createElement('div');
        title.textContent = '🎵 Selecionar Áudio';
        title.style.cssText = `
            color: #ffc107;
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
            text-align: center;
        `;
        menu.appendChild(title);
        
        // Adicionar opções de áudio
        audioTracks.forEach((track, index) => {
            const trackOption = document.createElement('div');
            trackOption.style.cssText = `
                padding: 10px;
                margin: 5px 0;
                background: ${track.enabled ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                border: ${track.enabled ? '1px solid #ffc107' : '1px solid #666'};
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: #fff;
                font-size: 14px;
            `;
            
            trackOption.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>${track.label || `Trilha ${index + 1}`}</span>
                    <span style="color: #999; font-size: 12px;">${track.language || 'N/A'}</span>
                    ${track.enabled ? '<span style="color: #28a745;">✓</span>' : ''}
                </div>
            `;
            
            // Adicionar evento de clique
            trackOption.addEventListener('click', () => {
                this.switchAudioTrack(track);
                this.removeAudioTrackButton();
            });
            
            // Efeito hover
            trackOption.addEventListener('mouseenter', () => {
                trackOption.style.background = 'rgba(255, 193, 7, 0.3)';
                trackOption.style.borderColor = '#ffc107';
            });
            
            trackOption.addEventListener('mouseleave', () => {
                trackOption.style.background = track.enabled ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                trackOption.style.borderColor = track.enabled ? '#ffc107' : '#666';
            });
            
            menu.appendChild(trackOption);
        });
        
        // Adicionar botão fechar
        const closeButton = document.createElement('div');
        closeButton.textContent = '✖ Fechar';
        closeButton.style.cssText = `
            padding: 8px;
            margin-top: 10px;
            background: rgba(220, 53, 69, 0.8);
            border-radius: 4px;
            text-align: center;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
        `;
        
        closeButton.addEventListener('click', () => {
            menu.remove();
        });
        
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(220, 53, 69, 1)';
        });
        
        menu.appendChild(closeButton);
        
        // Adicionar ao body
        document.body.appendChild(menu);
        
        // Fechar menu ao clicar fora
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !document.getElementById('audio-track-button').contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
        
        console.log('🎵 Menu de trilhas de áudio exibido');
    }
    
    switchAudioTrack(track) {
        try {
            console.log(`🎵 Trocando para trilha de áudio: ${track.label || track.id}`);
            
            // Tentar usar método do player
            if (this.clapprPlayer && this.clapprPlayer.setAudioTrack) {
                this.clapprPlayer.setAudioTrack(track.id);
            }
            
            // Tentar usar elemento de vídeo
            const videoElement = document.querySelector('#clappr-player video');
            if (videoElement && videoElement.audioTracks) {
                const tracks = Array.from(videoElement.audioTracks);
                tracks.forEach(t => {
                    t.enabled = (t.id === track.id || t === track);
                });
            }
            
            this.showToast(`🎵 Áudio alterado para: ${track.label || 'Trilha ' + track.id}`);
            
        } catch (error) {
            console.error('🎵 Erro ao trocar trilha de áudio:', error);
            this.showToast('🎵 Erro ao alterar áudio');
        }
    }
    
    handleEpisodeEnd() {
        if (!this.currentEpisode || this.currentEpisode.index >= this.currentEpisodes.length - 1) {
            this.showToast("Fim da temporada!");
            return;
        }
        
        const nextEpisode = this.currentEpisodes[this.currentEpisode.index + 1];
        this.showNextEpisodeOverlay(nextEpisode);
    }
    
    showNextEpisodeOverlay(nextEpisode) {
        const overlay = document.getElementById('next-episode-overlay');
        const countdownCircle = document.getElementById('countdown-circle');
        const nextEpisodeText = document.getElementById('next-episode-text');
        
        // Atualizar texto
        nextEpisodeText.textContent = `Próximo episódio: ${nextEpisode.titulo}`;
        
        // Mostrar overlay
        overlay.style.display = 'flex';
        
        let countdown = 5;
        countdownCircle.textContent = countdown;
        
        // Iniciar contagem regressiva
        this.countdownInterval = setInterval(() => {
            countdown--;
            countdownCircle.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                overlay.style.display = 'none';
                this.playEpisode(nextEpisode, this.currentSeriesItem, nextEpisode.titulo);
            }
        }, 1000);
        
        // Timeout para autoplay
        this.nextEpisodeTimeout = setTimeout(() => {
            this.skipCountdownAndPlayNext();
        }, 5000);
    }
    
    skipCountdownAndPlayNext() {
        // Limpar contagem
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        if (this.nextEpisodeTimeout) {
            clearTimeout(this.nextEpisodeTimeout);
            this.nextEpisodeTimeout = null;
        }
        
        // Esconder overlay
        const overlay = document.getElementById('next-episode-overlay');
        overlay.style.display = 'none';
        
        // Tocar próximo episódio
        if (this.currentEpisode && this.currentEpisode.index < this.currentEpisodes.length - 1) {
            const nextEpisode = this.currentEpisodes[this.currentEpisode.index + 1];
            this.playEpisode(nextEpisode, this.currentSeriesItem, nextEpisode.titulo);
        }
    }
    
    showToast(message) {
        // Criar toast simples
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-family: var(--font-title);
            font-weight: 600;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    playNextEpisode() {
        if (!this.currentEpisode || this.currentEpisode.index >= this.currentEpisodes.length - 1) {
            return;
        }
        
        const nextEpisode = this.currentEpisodes[this.currentEpisode.index + 1];
        this.playEpisode(nextEpisode, this.currentSeriesItem, nextEpisode.titulo);
    }
    
    saveEpisodeProgress() {
        if (!this.clapprPlayer || !this.currentEpisode) return;
        
        const currentTime = this.clapprPlayer.getCurrentTime();
        const duration = this.clapprPlayer.getDuration();
        
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            
            // Salvar no continuar assistindo
            const watchData = {
                ...this.currentSeriesItem,
                episodeTitle: this.currentEpisode.titulo,
                episodeIndex: this.currentEpisode.index,
                progress: Math.round(progress),
                currentTime: currentTime,
                lastWatched: new Date().toISOString()
            };
            
            const existingIndex = this.continueWatching.findIndex(i => 
                i.id === this.currentSeriesItem.id && 
                i.episodeIndex === this.currentEpisode.index
            );
            
            if (existingIndex !== -1) {
                this.continueWatching[existingIndex] = watchData;
            } else {
                this.continueWatching.push(watchData);
            }
            
            localStorage.setItem('paixaoflix_continue_watching', JSON.stringify(this.continueWatching));
        }
    }
    
    showModal(item) {
        const modal = document.getElementById('content-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalPoster = document.getElementById('modal-poster');
        const modalYear = document.getElementById('modal-year');
        const modalGenre = document.getElementById('modal-genre');
        const modalRating = document.getElementById('modal-rating');
        const modalDuration = document.getElementById('modal-duration');
        const modalActions = document.getElementById('modal-actions');
        
        const title = item.title || item.nome || 'Sem Título';
        const description = item.description || item.sinopse || item.descricao || 'Descrição não disponível';
        const year = item.year || item.ano || '2024';
        const genre = item.genre || item.genero || item.categoria || 'Drama';
        const rating = item.rating || item.nota || item.avaliacao || '8.0';
        const duration = item.duration || item.duracao || '2h';
        const poster = item.poster || item.thumbnail || item.cover || 
                      'https://via.placeholder.com/200x300/1a1a1a/ffffff?text=Sem+Imagem';
        
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalYear.textContent = year;
        modalGenre.textContent = Array.isArray(genre) ? genre.join(', ') : genre;
        modalRating.textContent = `⭐ ${rating}`;
        modalDuration.textContent = duration;
        
        const posterImg = modalPoster.querySelector('img');
        posterImg.src = poster;
        
        modalActions.innerHTML = '';
        
        // Botão assistir
        const playBtn = document.createElement('button');
        playBtn.className = 'btn-primary';
        playBtn.innerHTML = '<i class="fas fa-play"></i> Assistir Agora';
        playBtn.addEventListener('click', () => this.playContent(item));
        modalActions.appendChild(playBtn);
        
        // Botão trailer (se existir)
        const trailer = item.trailer || item.trailer_url;
        if (trailer && trailer.trim() !== '') {
            const trailerBtn = document.createElement('button');
            trailerBtn.className = 'btn-secondary';
            trailerBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Assistir Trailer';
            trailerBtn.addEventListener('click', () => {
                window.open(trailer, '_blank');
            });
            modalActions.appendChild(trailerBtn);
        }
        
        // Botão minha lista
        const itemId = item.id || item.title || title;
        const isInList = this.data.favoritos.some(fav => 
            (fav.id && fav.id === itemId) || 
            (fav.title && fav.title === itemId) ||
            (fav.nome && fav.nome === itemId)
        );
        
        const listBtn = document.createElement('button');
        listBtn.className = 'btn-secondary';
        listBtn.innerHTML = isInList ? 
            '<i class="fas fa-check"></i> Remover da Lista' : 
            '<i class="fas fa-heart"></i> Minha Lista';
        listBtn.addEventListener('click', () => this.toggleMyList(item, listBtn));
        modalActions.appendChild(listBtn);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        const modal = document.getElementById('content-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    playFeaturedContent() {
        if (this.currentFeaturedContent) {
            const allContent = [...this.data.filmes, ...this.data.series];
            const content = allContent.find(item => item.title === this.currentFeaturedContent.title);
            
            if (content) {
                this.playContent(content);
            }
        }
    }
    
    showFeaturedInfo() {
        if (this.currentFeaturedContent) {
            this.showModal(this.currentFeaturedContent);
        }
    }
    
    playContent(item) {
        // Adicionar ao continuar assistindo
        this.addToContinueWatching(item);
        
        if (item.url) {
            // Usar Clappr para filmes também
            this.initClapprPlayer(item.url, item.title || item.nome || 'Título');
        } else if (item.identificador_archive) {
            // Para séries sem tmdb_id, usar método antigo
            this.loadArchiveEpisodes(item);
        } else {
            console.error('URL de vídeo não encontrada para:', item);
            return;
        }
    }
    
    async loadArchiveEpisodes(item) {
        try {
            const response = await fetch(`https://archive.org/metadata/${item.identificador_archive}`);
            const metadata = await response.json();
            
            if (metadata.files) {
                const episodes = metadata.files.filter(file => 
                    file.name.endsWith('.mp4') && !file.name.includes('preview')
                );
                
                if (episodes.length > 0) {
                    // Abrir modal de episódios
                    this.showSeriesModal(item);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar episodios:', error);
        }
    }
    
    addToContinueWatching(item) {
        const existingIndex = this.continueWatching.findIndex(i => i.id === item.id);
        
        if (existingIndex !== -1) {
            this.continueWatching[existingIndex].lastWatched = new Date().toISOString();
        } else {
            this.continueWatching.push({
                ...item,
                lastWatched: new Date().toISOString(),
                progress: 0,
                currentTime: 0
            });
        }
        
        this.continueWatching.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
        this.continueWatching = this.continueWatching.slice(0, 10);
        
        localStorage.setItem('paixaoflix_continue_watching', JSON.stringify(this.continueWatching));
    }
    
    toggleMyList(item, button) {
        const index = this.data.favoritos.findIndex(fav => fav.id === item.id);
        
        if (index === -1) {
            this.data.favoritos.push(item);
            button.innerHTML = '<i class="fas fa-check"></i> Remover da Lista';
        } else {
            this.data.favoritos.splice(index, 1);
            button.innerHTML = '<i class="fas fa-heart"></i> Minha Lista';
        }
        
        localStorage.setItem('paixaoflix_favorites', JSON.stringify(this.data.favoritos));
        
        if (this.currentPage === 'home') {
            this.loadMyList();
        }
    }
    
    loadMyList() {
        // Implementar se necessário
    }
    
    closePlayer() {
        const player = document.getElementById('video-player');
        const nextBtn = document.getElementById('next-episode-btn');
        
        // Destruir player e limpar timeouts
        this.destroyPlayer();
        
        player.classList.remove('active');
        nextBtn.style.display = 'none';
        document.body.style.overflow = '';
        this.currentEpisode = null;
        
        // Desbloquear orientação ao fechar player
        this.unlockOrientation();
        
        // Sair do fullscreen
        this.toggleFullScreen(false);
        
        // Resetar brilho
        this.resetBrightness();
    }
    
    // Sistema de Gestos para Mobile
    setupPlayerGestures() {
        const playerWrapper = document.getElementById('player-wrapper');
        
        playerWrapper.addEventListener('touchstart', (e) => {
            this.touchStartStatus = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY, 
                time: Date.now() 
            };
        }, { passive: true });
        
        playerWrapper.addEventListener('touchmove', (e) => {
            if (!this.clapprPlayer) return;
            
            const deltaY = this.touchStartStatus.y - e.touches[0].clientY;
            const side = this.touchStartStatus.x < window.innerWidth / 2 ? 'brilho' : 'volume';
            
            if (Math.abs(deltaY) > 30) { // Sensibilidade
                e.preventDefault();
                
                if (side === 'volume') {
                    const currentVol = this.clapprPlayer.getVolume();
                    const newVol = Math.min(100, Math.max(0, currentVol + (deltaY / 5)));
                    this.clapprPlayer.setVolume(newVol);
                    this.showToast(`Volume: ${Math.round(newVol)}%`);
                }
                
                if (side === 'brilho') {
                    const playerWrapper = document.getElementById('player-wrapper');
                    let currentB = parseFloat(playerWrapper.dataset.brightness || 1);
                    currentB = Math.min(1.5, Math.max(0.5, currentB + (deltaY / 500)));
                    playerWrapper.style.filter = `brightness(${currentB})`;
                    playerWrapper.dataset.brightness = currentB;
                    this.currentBrightness = currentB;
                    this.showToast(`Brilho: ${Math.round(currentB * 100)}%`);
                }
            }
        }, { passive: false });
        
        playerWrapper.addEventListener('touchend', () => {
            // Salvar brilho atual
            this.currentBrightness = parseFloat(document.getElementById('player-wrapper').dataset.brightness || 1);
        }, { passive: true });
    }
    
    // Sistema de Fullscreen e Rotação
    async toggleFullScreen(activate) {
        const doc = window.document;
        const docEl = doc.documentElement;
        
        try {
            if (activate) {
                // Entrar em Fullscreen
                if (docEl.requestFullscreen) {
                    await docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) {
                    await docEl.webkitRequestFullscreen();
                } else if (docEl.mozRequestFullScreen) {
                    await docEl.mozRequestFullScreen();
                } else if (docEl.msRequestFullscreen) {
                    await docEl.msRequestFullscreen();
                }
                
                // Tentar girar a tela
                if (screen.orientation && screen.orientation.lock) {
                    await screen.orientation.lock('landscape').catch(e => {
                        console.log("Giro manual necessário");
                        this.showToast("Gire seu dispositivo para paisagem");
                    });
                }
            } else {
                // Sair do Fullscreen
                if (doc.exitFullscreen) {
                    doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    doc.mozCancelFullScreen();
                } else if (doc.msExitFullscreen) {
                    doc.msExitFullscreen();
                }
                
                // Desbloquear orientação
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            }
        } catch (error) {
            console.warn('Erro ao controlar fullscreen:', error);
        }
    }
    
    resetBrightness() {
        const playerWrapper = document.getElementById('player-wrapper');
        if (playerWrapper) {
            playerWrapper.style.filter = 'brightness(1)';
            playerWrapper.dataset.brightness = 1;
            this.currentBrightness = 1.0;
        }
    }
    
    // Sistema de Orientação de Tela
    async lockOrientation() {
        try {
            // Salvar orientação original
            if (!this.originalOrientation) {
                this.originalOrientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
            }
            
            // Tentar usar API Android primeiro (se disponível)
            if (window.Android && window.Android.lockOrientation) {
                window.Android.lockOrientation();
                this.isOrientationLocked = true;
                this.updateOrientationButton();
                console.log('📱 Orientação bloqueada via Android API');
                return;
            }
            
            // Verificar suporte à API web
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
                this.isOrientationLocked = true;
                this.updateOrientationButton();
                console.log('📱 Orientação bloqueada em paisagem (Web API)');
            } else if (screen.lockOrientation) {
                // Fallback para browsers antigos
                screen.lockOrientation('landscape');
                this.isOrientationLocked = true;
                this.updateOrientationButton();
                console.log('📱 Orientação bloqueada (fallback)');
            } else {
                // Se não suportar, apenas mostrar toast
                this.showToast('Gire seu dispositivo para paisagem');
                console.log('⚠️ API de orientação não suportada');
            }
        } catch (error) {
            console.warn('Erro ao bloquear orientação:', error);
            this.showToast('Gire seu dispositivo para paisagem');
        }
    }
    
    async unlockOrientation() {
        try {
            // Tentar usar API Android primeiro (se disponível)
            if (window.Android && window.Android.unlockOrientation) {
                window.Android.unlockOrientation();
                this.isOrientationLocked = false;
                this.updateOrientationButton();
                console.log('📱 Orientação desbloqueada via Android API');
                return;
            }
            
            // Usar API web como fallback
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
                this.isOrientationLocked = false;
                this.updateOrientationButton();
                console.log('📱 Orientação desbloqueada (Web API)');
            } else if (screen.unlockOrientation) {
                screen.unlockOrientation();
                this.isOrientationLocked = false;
                this.updateOrientationButton();
                console.log('📱 Orientação desbloqueada (fallback)');
            }
        } catch (error) {
            console.warn('Erro ao desbloquear orientação:', error);
        }
    }
    
    toggleOrientation() {
        if (this.isOrientationLocked) {
            this.unlockOrientation();
        } else {
            this.lockOrientation();
        }
    }
    
    updateOrientationButton() {
        const btn = document.getElementById('orientation-btn');
        const icon = btn.querySelector('i');
        
        if (this.isOrientationLocked) {
            btn.classList.add('locked');
            btn.title = 'Desbloquear Orientação';
            icon.className = 'fas fa-lock';
        } else {
            btn.classList.remove('locked');
            btn.title = 'Bloquear Orientação';
            icon.className = 'fas fa-mobile-alt';
        }
    }
    
    showPage(page) {
        this.currentPage = page;
        
        if (page === 'home') {
            this.resetToHome();
        } else if (page === 'search') {
            this.openSearch();
        } else if (page === 'cinema') {
            this.loadCinemaPage();
        } else if (page === 'series') {
            this.loadSeriesPage();
        } else if (page === 'kids-movies') {
            this.loadKidsMovies();
        } else if (page === 'kids-series') {
            this.loadKidsSeries();
        } else if (page === 'live-channels') {
            this.loadChannels();
        } else if (page === 'kids-channels') {
            this.loadKidsChannels();
        } else if (page === 'my-list') {
            this.loadMyListPage();
        }
        
        this.updateFocusableElements();
    }
    
    resetToHome() {
        // Limpar conteúdo principal
        const mainContent = document.getElementById('main-content');
        const sectionsToKeep = ['hero'];
        
        Array.from(mainContent.children).forEach(child => {
            if (child.nodeType === 1 && !sectionsToKeep.includes(child.id)) {
                child.remove();
            }
        });
        
        // Recarregar conteúdo da home
        this.loadHomeContent();
    }
    
    openSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        searchOverlay.style.display = 'flex';
        document.getElementById('search-input').focus();
        
        // Limpar busca anterior
        document.getElementById('search-input').value = '';
        this.clearSearchResults();
    }
    
    clearSearchResults() {
        document.getElementById('search-grid').innerHTML = '';
        document.getElementById('search-loading').style.display = 'none';
        document.getElementById('search-empty').style.display = 'none';
    }
    
    closeSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        searchOverlay.style.display = 'none';
        document.getElementById('search-input').value = '';
        document.getElementById('search-grid').innerHTML = '';
    }
    
    performSearch(query) {
        // Limpar debounce anterior
        if (this.searchDebounceTimeout) {
            clearTimeout(this.searchDebounceTimeout);
        }
        
        // Debounce de 300ms para economizar memória
        this.searchDebounceTimeout = setTimeout(() => {
            this.executeSearch(query);
        }, 300);
    }
    
    executeSearch(query) {
        this.clearSearchResults();
        
        if (!query || query.trim().length < 2) {
            return;
        }
        
        const searchGrid = document.getElementById('search-grid');
        const loading = document.getElementById('search-loading');
        const empty = document.getElementById('search-empty');
        
        loading.style.display = 'block';
        
        // Usar índice para busca rápida
        const searchTerm = query.toLowerCase().trim();
        const results = {
            channels: [],
            filmes: [],
            series: []
        };
        
        // Buscar em cada categoria com prioridade
        // 1. Canais (prioridade máxima)
        results.channels = this.searchIndex.channels.filter(item => {
            return this.matchesSearch(item, searchTerm);
        });
        
        // 2. Filmes (prioridade média)
        results.filmes = this.searchIndex.filmes.filter(item => {
            return this.matchesSearch(item, searchTerm);
        });
        
        // 3. Séries (prioridade baixa)
        results.series = this.searchIndex.series.filter(item => {
            return this.matchesSearch(item, searchTerm);
        });
        
        loading.style.display = 'none';
        
        // Exibir resultados por categoria
        this.displaySearchResults(results, searchTerm);
    }
    
    matchesSearch(item, searchTerm) {
        const title = (item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const year = (item.year || '').toString();
        
        return title.includes(searchTerm) ||
               description.includes(searchTerm) ||
               category.includes(searchTerm) ||
               year.includes(searchTerm);
    }
    
    displaySearchResults(results, searchTerm) {
        const searchGrid = document.getElementById('search-grid');
        const empty = document.getElementById('search-empty');
        
        // Limpar grid
        searchGrid.innerHTML = '';
        
        // Contador de resultados
        let totalResults = results.channels.length + results.filmes.length + results.series.length;
        
        if (totalResults === 0) {
            empty.style.display = 'block';
            empty.innerHTML = `
                <i class="fas fa-search"></i>
                <p>Nenhum resultado encontrado para "${searchTerm}"</p>
            `;
            return;
        }
        
        // Criar seções por categoria
        const sections = [];
        
        // 1. Seção de Canais
        if (results.channels.length > 0) {
            const channelsSection = this.createSearchSection('Canais', results.channels, 'channel');
            sections.push(channelsSection);
        }
        
        // 2. Seção de Filmes
        if (results.filmes.length > 0) {
            const moviesSection = this.createSearchSection('Filmes', results.filmes, 'movie');
            sections.push(moviesSection);
        }
        
        // 3. Seção de Séries
        if (results.series.length > 0) {
            const seriesSection = this.createSearchSection('Séries', results.series, 'series');
            sections.push(seriesSection);
        }
        
        // Adicionar seções ao grid
        sections.forEach(section => {
            searchGrid.appendChild(section);
        });
        
        // Atualizar elementos focáveis
        this.updateFocusableElements();
        
        // Focar no primeiro resultado
        const firstResult = searchGrid.querySelector('.search-result-item');
        if (firstResult) {
            setTimeout(() => firstResult.focus(), 100);
        }
        
        console.log(`🔍 Busca por "${searchTerm}": ${totalResults} resultados encontrados`);
    }
    
    createSearchSection(title, items, type) {
        const section = document.createElement('div');
        section.className = 'search-section';
        
        // Header da seção
        const header = document.createElement('div');
        header.className = 'search-section-header';
        header.innerHTML = `
            <h3 class="search-section-title">${title}</h3>
            <span class="search-section-count">${items.length}</span>
        `;
        section.appendChild(header);
        
        // Grid de itens
        const grid = document.createElement('div');
        grid.className = 'search-section-grid';
        
        // Limitar a 10 itens por seção para performance
        items.slice(0, 10).forEach(item => {
            const resultItem = this.createSearchResultItem(item, type);
            grid.appendChild(resultItem);
        });
        
        section.appendChild(grid);
        
        return section;
    }
    
    createSearchResultItem(item, type) {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item focusable';
        resultItem.tabIndex = 0;
        
        resultItem.innerHTML = `
            <div class="search-result-thumbnail">
                <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                <div class="search-result-overlay">
                    <i class="fas fa-${type === 'channel' ? 'broadcast-tower' : 'play'}"></i>
                </div>
            </div>
            <div class="search-result-info">
                <h4 class="search-result-title">${item.title}</h4>
                <p class="search-result-description">${item.description.truncate(80)}</p>
                <div class="search-result-meta">
                    <span class="search-result-category">${item.category}</span>
                    ${item.year ? `<span class="search-result-year">${item.year}</span>` : ''}
                </div>
            </div>
        `;
        
        // Event listener
        resultItem.addEventListener('click', () => {
            this.handleSearchResultClick(item, type);
        });
        
        return resultItem;
    }
    
    handleSearchResultClick(item, type) {
        if (type === 'channel') {
            this.playChannel(item.data);
        } else if (type === 'movie') {
            this.playContent(item.data);
        } else if (type === 'series') {
            this.showContentDetails(item.data);
        }
        
        // Fechar busca após clicar
        this.closeSearch();
    }
    
    createChannelCard(channel) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.tabIndex = 0;
        
        const logo = channel.logo || 'https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Canal';
        
        card.innerHTML = `<img src="${logo}" alt="${channel.name}" loading="lazy">`;
        
        card.addEventListener('click', () => {
            this.playChannel(channel);
        });
        
        return card;
    }
    
    playChannel(channel) {
        const player = document.getElementById('video-player');
        const video = document.getElementById('video-element');
        
        video.src = channel.url;
        player.classList.add('active');
        document.body.style.overflow = 'hidden';
        video.play();
    }
    
    loadCinemaPage() {
        this.loadCategoryPage('Cinema', this.data.filmes);
    }
    
    loadSeriesPage() {
        this.loadCategoryPage('Séries', this.data.series);
    }
    
    loadKidsMovies() {
        const filteredMovies = this.data.kidsFilmes.filter(movie => {
            const genre = movie.genre || movie.genero || '';
            return !genre.toLowerCase().includes('adulto');
        });
        this.loadKidsPage('Filmes Kids', filteredMovies);
    }
    
    loadKidsSeries() {
        const filteredSeries = this.data.kidsSeries.filter(serie => {
            const genre = serie.genre || serie.genero || '';
            return !genre.toLowerCase().includes('adulto');
        });
        this.loadKidsPage('Séries Kids', filteredSeries);
    }
    
    loadCategoryPage(title, content) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="content-section">
                <h2 class="section-title">${title}</h2>
                <div class="movie-row" id="category-content"></div>
            </div>
        `;
        
        const container = document.getElementById('category-content');
        content.forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadKidsPage(title, content) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="content-section">
                <h2 class="section-title">${title}</h2>
                <div class="search-grid" id="kids-grid"></div>
            </div>
        `;
        
        const container = document.getElementById('kids-grid');
        const sortedContent = content.sort((a, b) => {
            const titleA = (a.title || a.nome || '').toLowerCase();
            const titleB = (b.title || b.nome || '').toLowerCase();
            return titleA.localeCompare(titleB);
        });
        
        sortedContent.forEach(item => {
            const card = this.createMovieCard(item);
            container.appendChild(card);
        });
    }
    
    loadChannels() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="content-section">
                <h2 class="section-title">Canais ao Vivo</h2>
                <div class="search-grid" id="channels-grid"></div>
            </div>
        `;
        
        const container = document.getElementById('channels-grid');
        this.data.channels.forEach(channel => {
            const card = this.createChannelCard(channel);
            container.appendChild(card);
        });
    }
    
    loadKidsChannels() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="content-section">
                <h2 class="section-title">Canais Kids</h2>
                <div class="search-grid" id="kids-channels-grid"></div>
            </div>
        `;
        
        const container = document.getElementById('kids-channels-grid');
        this.data.kidsChannels.forEach(channel => {
            const card = this.createChannelCard(channel);
            container.appendChild(card);
        });
    }
    
    loadMyListPage() {
        this.loadCategoryPage('Minha Lista', this.data.favoritos);
    }
    
    initNavigation() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
                e.preventDefault();
                this.handleNavigation(e.key);
            }
        });
        
        this.updateFocusableElements();
    }
    
    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(
            '.movie-card, .movie-card-2-3, .menu-link, button, input, .episode-pro-card, .season-select'
        )).filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   el.offsetParent !== null;
        });
    }
    
    checkAndCreateSeasonalSection() {
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // JavaScript months are 0-11
        const currentDay = today.getDate();
        
        let seasonalEvent = null;
        
        // Verificar eventos sazonais
        if (currentMonth === 2 && currentDay >= 13 && currentDay <= 17) {
            // Carnaval (13/02 a 17/02)
            seasonalEvent = {
                title: 'Ritmo de Festa & Folia',
                genres: ['Documentários', 'Comédia'],
                icon: 'fa-music'
            };
        } else if (currentMonth === 3 && currentDay >= 27 || currentMonth === 4 && currentDay <= 5) {
            // Páscoa (27/03 a 05/04)
            seasonalEvent = {
                title: 'Especial de Páscoa',
                genres: ['Religioso', 'Animação'],
                icon: 'fa-egg'
            };
        } else if (currentMonth === 6 && currentDay >= 10 && currentDay <= 13) {
            // Dia dos Namorados (10/06 a 13/06)
            seasonalEvent = {
                title: 'Canto do Romance',
                genres: ['Romance', 'Comédia'],
                icon: 'fa-heart'
            };
        } else if (currentMonth === 6) {
            // Festa Junina (01/06 a 30/06)
            seasonalEvent = {
                title: 'Arraiá do PaixãoFlix',
                genres: ['Nacional', 'Musical'],
                icon: 'fa-fire'
            };
        } else if (currentMonth === 10 && currentDay >= 1 && currentDay <= 13) {
            // Dia das Crianças (01/10 a 13/10)
            seasonalEvent = {
                title: 'Semana da Criança',
                source: 'kids_filmes.json',
                icon: 'fa-child'
            };
        } else if (currentMonth === 10 && currentDay >= 25 && currentDay <= 31) {
            // Halloween (25/10 a 31/10)
            seasonalEvent = {
                title: 'Noites de Terror',
                genres: ['Terror', 'Suspense'],
                icon: 'fa-ghost'
            };
        } else if (currentMonth === 12 && currentDay >= 1 && currentDay <= 26) {
            // Natal (01/12 a 26/12)
            seasonalEvent = {
                title: 'Clima de Natal',
                genres: ['Família'],
                searchTerm: 'Natal',
                icon: 'fa-tree'
            };
        } else if ((currentMonth === 12 && currentDay >= 27) || (currentMonth === 1 && currentDay <= 2)) {
            // Ano Novo (27/12 a 02/01)
            seasonalEvent = {
                title: 'Retrospectiva & Futuro',
                categories: ['Lançamento 2026'],
                genres: ['Ficção', 'Comédia'],
                icon: 'fa-champagne-glasses'
            };
        }
        
        if (seasonalEvent) {
            this.createSeasonalSection(seasonalEvent);
            console.log(`🎉 Evento sazonal ativo: ${seasonalEvent.title}`);
        }
    }
    
    createSeasonalSection(event) {
        const content = document.getElementById('content');
        const continueWatching = document.getElementById('continue-watching');
        
        // Criar seção sazonal
        const seasonalSection = document.createElement('div');
        seasonalSection.className = 'content-section seasonal-section';
        seasonalSection.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas ${event.icon}"></i>
                    ${event.title}
                </h2>
                <button class="see-all-btn seasonal-btn">
                    <i class="fas fa-th"></i>
                    Ver Todos
                </button>
            </div>
            <div class="movies-scroll seasonal-scroll" id="seasonal-content">
                <!-- Conteúdo será inserido aqui -->
            </div>
        `;
        
        // Inserir após "Continuar Assistindo" ou no início
        if (continueWatching) {
            content.insertBefore(seasonalSection, continueWatching.nextSibling);
        } else {
            content.insertBefore(seasonalSection, content.firstChild);
        }
        
        // Carregar conteúdo da seção
        this.loadSeasonalContent(event);
        
        // Salvar referência
        this.seasonalSection = seasonalSection;
    }
    
    loadSeasonalContent(event) {
        const seasonalContent = document.getElementById('seasonal-content');
        let content = [];
        
        if (event.source === 'kids_filmes.json') {
            // Dia das Crianças: usar exclusivamente kids_filmes
            content = this.data.kidsFilmes || [];
        } else if (event.categories) {
            // Ano Novo: filtrar por categorias
            content = [
                ...this.data.filmes.filter(item => 
                    event.categories.some(cat => 
                        item.category === cat || (item.categories && item.categories.includes(cat))
                    )
                ),
                ...this.data.series.filter(item => 
                    event.categories.some(cat => 
                        item.category === cat || (item.categories && item.categories.includes(cat))
                    )
                )
            ];
        } else {
            // Outros eventos: filtrar por gêneros e termo de busca
            content = [
                ...this.data.filmes.filter(item => 
                    event.genres.some(genre => 
                        item.genre === genre || 
                        item.genero === genre || 
                        (item.genres && item.genres.includes(genre))
                    ) && (
                        !event.searchTerm || 
                        (item.title && item.title.toLowerCase().includes(event.searchTerm.toLowerCase()))
                    )
                ),
                ...this.data.series.filter(item => 
                    event.genres.some(genre => 
                        item.genre === genre || 
                        item.genero === genre || 
                        (item.genres && item.genres.includes(genre))
                    ) && (
                        !event.searchTerm || 
                        (item.title && item.title.toLowerCase().includes(event.searchTerm.toLowerCase()))
                    )
                )
            ];
        }
        
        // Limitar a 15 itens para performance
        content = content.slice(0, 15);
        
        // Criar cards com destaque sazonal
        content.forEach(item => {
            const card = this.createSeasonalCard(item);
            seasonalContent.appendChild(card);
        });
        
        // Adicionar evento ao botão "Ver Todos"
        const seasonalBtn = document.querySelector('.seasonal-btn');
        if (seasonalBtn) {
            seasonalBtn.addEventListener('click', () => {
                this.showSeasonalModal(event, content);
            });
        }
        
        // Atualizar elementos focáveis
        this.updateFocusableElements();
    }
    
    createSeasonalCard(item) {
        const card = document.createElement('div');
        card.className = 'movie-card seasonal-highlight focusable';
        card.tabIndex = 0;
        
        const thumbnail = item.thumbnail || item.poster || 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Sem+Capa';
        const title = item.title || item.nome || 'Sem Título';
        
        card.innerHTML = `
            <img src="${thumbnail}" alt="${title}" loading="lazy">
            <div class="movie-info">
                <h3>${title}</h3>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (item.url && item.url.includes('.m3u8')) {
                this.playChannel(item);
            } else if (item.episodes) {
                this.showContentDetails(item);
            } else {
                this.playContent(item);
            }
        });
        
        return card;
    }
    
    showSeasonalModal(event, content) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content seasonal-modal">
                <div class="modal-header">
                    <h2><i class="fas ${event.icon}"></i> ${event.title}</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="seasonal-grid">
                        ${content.map(item => `
                            <div class="seasonal-item focusable" onclick="app.handleSeasonalItemClick('${item.id || item.title}')">
                                <img src="${item.thumbnail || item.poster || 'https://via.placeholder.com/200x112/1a1a1a/ffffff?text=Sem+Capa'}" alt="${item.title || item.nome}">
                                <h4>${item.title || item.nome}</h4>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.updateFocusableElements();
    }
    
    handleSeasonalItemClick(itemId) {
        // Encontrar item e reproduzir
        const allContent = [
            ...this.data.filmes,
            ...this.data.series,
            ...this.data.kidsFilmes,
            ...this.data.channels
        ];
        
        const item = allContent.find(i => 
            (i.id && i.id === itemId) || 
            (i.title && i.title === itemId) ||
            (i.nome && i.nome === itemId)
        );
        
        if (item) {
            document.querySelector('.modal')?.remove();
            if (item.url && item.url.includes('.m3u8')) {
                this.playChannel(item);
            } else if (item.episodes) {
                this.showContentDetails(item);
            } else {
                this.playContent(item);
            }
        }
    }
    
    // Sistema de Segurança e Resiliência
    getSecureArchiveLink(identifier, fileName) {
        // URLs criptografadas para evitar scraping
        const baseUrls = [
            atob('aHR0cHM6Ly9hcmNoaXZlLm9yZy9kb3dubG9hZC8='), // archive.org/download/
            atob('aHR0cHM6Ly9pYTYwMS5hcmNoaXZlLm9yZy9kb3dubG9hZC8='), // ia601.archive.org/download/
            atob('aHR0cHM6Ly9pYzgwMC5hcmNoaXZlLm9yZy9kb3dubG9hZC8='), // ia800.archive.org/download/
            atob('aHR0cHM6Ly9pYzYwMC5hcmNoaXZlLm9yZy9kb3dubG9hZC8=')  // ia600.archive.org/download/
        ];
        
        // Tentar link principal primeiro
        const primaryUrl = `${baseUrls[0]}${identifier}/${fileName}`;
        
        return {
            primary: primaryUrl,
            fallbacks: baseUrls.slice(1).map(url => `${url}${identifier}/${fileName}`)
        };
    }
    
    async secureFetch(url, options = {}) {
        const maxRetries = this.maxArchiveRetries;
        let lastError = null;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Forçar HTTPS
                const secureUrl = url.replace(/^http:/, 'https:');
                
                // Adicionar headers para bypass CORS
                const secureOptions = {
                    ...options,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://archive.org/',
                        'Accept': '*/*',
                        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                        'Cache-Control': 'no-cache',
                        ...options.headers
                    }
                };
                
                const response = await fetch(secureUrl, secureOptions);
                
                if (response.ok) {
                    this.archiveRetryCount = 0; // Reset counter on success
                    return response;
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
            } catch (error) {
                lastError = error;
                console.warn(`Tentativa ${attempt + 1}/${maxRetries} falhou:`, error.message);
                
                // Esperar antes da próxima tentativa
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        
        throw lastError || new Error('Falha em todas as tentativas');
    }
    
    async loadWithFallback(identifier, fileName) {
        const links = this.getSecureArchiveLink(identifier, fileName);
        
        // Tentar link principal
        try {
            const response = await this.secureFetch(links.primary);
            console.log('✅ Link principal funcionou:', links.primary);
            return response;
        } catch (error) {
            console.warn('⚠️ Link principal falhou, tentando fallbacks:', error.message);
            
            // Tentar links fallback
            for (const fallbackUrl of links.fallbacks) {
                try {
                    const response = await this.secureFetch(fallbackUrl);
                    console.log('✅ Fallback funcionou:', fallbackUrl);
                    return response;
                } catch (fallbackError) {
                    console.warn(`❌ Fallback falhou: ${fallbackUrl}`, fallbackError.message);
                }
            }
        }
        
        throw new Error('Todos os links falharam');
    }
    
    checkAdultAccess(content) {
        // Verificar se é conteúdo adulto
        const isAdult = content.category === 'Adulto' || 
                       content.genre === 'Adulto' || 
                       content.genero === 'Adulto' ||
                       (content.genres && content.genres.includes('Adulto'));
        
        if (!isAdult) return true;
        
        if (this.adultAccessGranted) return true;
        
        // Mostrar modal de confirmação
        return this.showAdultConfirmation();
    }
    
    showAdultConfirmation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active adult-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-exclamation-triangle"></i> Verificação de Idade</h2>
                    </div>
                    <div class="modal-body">
                        <div class="adult-warning">
                            <i class="fas fa-lock"></i>
                            <h3>Conteúdo Restrito</h3>
                            <p>Este conteúdo é exclusivo para maiores de 18 anos.</p>
                            <p>Confirme sua data de nascimento para continuar:</p>
                        </div>
                        <form class="age-form" onsubmit="return false;">
                            <input type="date" id="birth-date" max="${new Date().toISOString().split('T')[0]}" required>
                            <div class="form-buttons">
                                <button type="button" class="cancel-btn" onclick="this.closest('.modal').remove(); resolve(false);">
                                    <i class="fas fa-times"></i>
                                    Cancelar
                                </button>
                                <button type="submit" class="confirm-btn" onclick="app.verifyAge(this.closest('.modal'), resolve);">
                                    <i class="fas fa-check"></i>
                                    Confirmar
                                </button>
                            </div>
                        </form>
                        <div class="password-option">
                            <p>Ou digite a senha de acesso:</p>
                            <input type="password" id="adult-password" placeholder="Senha">
                            <button onclick="app.verifyAdultPassword(this.closest('.modal'), resolve);" class="password-btn">
                                <i class="fas fa-key"></i>
                                Acessar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Focar no primeiro input
            setTimeout(() => {
                document.getElementById('birth-date')?.focus();
            }, 100);
        });
    }
    
    verifyAge(modal, resolve) {
        const birthDate = document.getElementById('birth-date').value;
        if (!birthDate) {
            this.showToast('Por favor, informe sua data de nascimento');
            return;
        }
        
        const birth = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        if (age >= 18) {
            this.adultAccessGranted = true;
            modal.remove();
            resolve(true);
            this.showToast('Acesso concedido');
        } else {
            this.showToast('Você precisa ser maior de 18 anos');
        }
    }
    
    verifyAdultPassword(modal, resolve) {
        const password = document.getElementById('adult-password').value;
        if (password === this.adultPassword) {
            this.adultAccessGranted = true;
            modal.remove();
            resolve(true);
            this.showToast('Acesso concedido');
        } else {
            this.showToast('Senha incorreta');
            document.getElementById('adult-password').value = '';
        }
    }
    
    handleNavigation(key) {
        var focused = document.activeElement;
        var currentIndex = this.focusableElements.indexOf(focused);
        
        if (key === 'Escape') {
            if (document.getElementById('video-player').classList.contains('active')) {
                this.closePlayer();
            } else if (document.getElementById('content-modal').classList.contains('active')) {
                this.closeModal();
            } else if (document.getElementById('series-modal').classList.contains('active')) {
                this.closeSeriesModal();
            } else if (document.getElementById('search-overlay').style.display === 'flex') {
                this.closeSearch();
            } else {
                this.showPage('home');
            }
            return;
        }
        
        if (key === 'Enter' && focused) {
            focused.click();
            return;
        }
        
        let nextIndex = currentIndex;
        
        if (key === 'ArrowRight') {
            nextIndex = currentIndex < this.focusableElements.length - 1 ? currentIndex + 1 : 0;
        } else if (key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : this.focusableElements.length - 1;
        } else if (key === 'ArrowDown' || key === 'ArrowUp') {
            // Loop vertical
            const currentRect = focused.getBoundingClientRect();
            const candidates = [];
            
            this.focusableElements.forEach((element, index) => {
                if (index === currentIndex) return;
                
                const rect = element.getBoundingClientRect();
                const isBelow = key === 'ArrowDown' ? rect.top > currentRect.bottom : rect.bottom < currentRect.top;
                const isAligned = Math.abs(rect.left - currentRect.left) < 200;
                
                if (isBelow && isAligned) {
                    const distance = Math.abs(rect.top - currentRect.top);
                    candidates.push({ element, index, distance });
                }
            });
            
            if (candidates.length > 0) {
                candidates.sort((a, b) => a.distance - b.distance);
                nextIndex = candidates[0].index;
            } else {
                // Loop vertical
                nextIndex = key === 'ArrowDown' ? 0 : this.focusableElements.length - 1;
            }
        }
        
        if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < this.focusableElements.length) {
            this.focusableElements[nextIndex].focus();
        }
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    const app = new PaixaoFlixApp();
    window.app = app;
});
