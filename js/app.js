// Main Application Controller
class PaixaoFlixApp {
    constructor() {
        this.currentSection = 'home';
        this.searchActive = false;
        this.data = {
            cinema: [],
            series: [],
            channels: [],
            favorites: [],
            kidsMovies: [],
            kidsSeries: []
        };
        this.heroSlideIndex = 0;
        this.heroSlideInterval = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Iniciando PaixãoFlix...');
        
        // Initialize components
        this.setupEventListeners();
        this.setupNavigation();
        this.setupKeyboardShortcuts();
        
        // Load data
        await this.loadData();
        
        // Initialize UI
        this.renderHeroSection();
        this.renderContentSections();
        this.startHeroCarousel();
        
        console.log('✅ PaixãoFlix inicializado com sucesso!');
    }
    
    setupEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Search
        const searchInput = document.getElementById('searchInput');
        const searchContainer = document.getElementById('searchContainer');
        
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchContainer.classList.add('active');
                this.searchActive = true;
            });
            
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    searchContainer.classList.remove('active');
                    this.searchActive = false;
                }, 200);
            });
            
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // Menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Hero buttons
        const heroPlayBtn = document.getElementById('heroPlayBtn');
        const heroInfoBtn = document.getElementById('heroInfoBtn');
        
        if (heroPlayBtn) {
            heroPlayBtn.addEventListener('click', () => {
                this.playHeroContent();
            });
        }
        
        if (heroInfoBtn) {
            heroInfoBtn.addEventListener('click', () => {
                this.showHeroDetails();
            });
        }
    }
    
    setupNavigation() {
        // Touch gestures for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
        
        // Scroll behavior for category rows
        const categoryRows = document.querySelectorAll('.category-row');
        categoryRows.forEach(row => {
            this.setupInfiniteScroll(row);
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for our shortcuts
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
                e.preventDefault();
            }
            
            switch (e.key) {
                case 'ArrowUp':
                    this.navigateUp();
                    break;
                case 'ArrowDown':
                    this.navigateDown();
                    break;
                case 'ArrowLeft':
                    this.navigateLeft();
                    break;
                case 'ArrowRight':
                    this.navigateRight();
                    break;
                case 'Enter':
                    this.activateCurrentElement();
                    break;
                case 'Escape':
                    this.closeModals();
                    break;
                case '/':
                    if (!this.searchActive) {
                        e.preventDefault();
                        document.getElementById('searchInput')?.focus();
                    }
                    break;
            }
        });
    }
    
    async loadData() {
        try {
            console.log('📥 Carregando dados...');
            
            // Load from GitHub
            const baseUrl = 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/';
            
            console.log('🌐 Buscando dados do GitHub...');
            
            const [
                cinemaData,
                seriesData,
                channelsData,
                favoritesData,
                kidsMoviesData,
                kidsSeriesData
            ] = await Promise.all([
                this.fetchJson(baseUrl + 'cinema.json'),
                this.fetchJson(baseUrl + 's%C3%A9ries.json'),
                this.fetchM3U8(baseUrl + 'canaisaovivo.m3u8'),
                this.fetchJson(baseUrl + 'favoritos.json'),
                this.fetchJson(baseUrl + 'filmeskids.json'),
                this.fetchJson(baseUrl + 's%C3%A9rieskids.json')
            ]);
            
            console.log('✅ Dados brutos recebidos:', {
                cinema: cinemaData?.length || 0,
                series: seriesData?.length || 0,
                channels: channelsData?.length || 0,
                favorites: favoritesData?.length || 0,
                kidsMovies: kidsMoviesData?.length || 0,
                kidsSeries: kidsSeriesData?.length || 0
            });
            
            // Process and categorize content
            this.data = {
                cinema: window.dataManager.processContent(cinemaData || []),
                series: window.dataManager.processContent(seriesData || []),
                channels: channelsData || [],
                favorites: window.dataManager.processContent(favoritesData || []),
                kidsMovies: window.dataManager.processContent(kidsMoviesData || []),
                kidsSeries: window.dataManager.processContent(kidsSeriesData || [])
            };
            
            // Categorize content by genre
            this.categorizedContent = {
                cinema: window.dataManager.categorizeContent(this.data.cinema),
                series: window.dataManager.categorizeContent(this.data.series),
                kids: window.dataManager.categorizeContent([...this.data.kidsMovies, ...this.data.kidsSeries])
            };
            
            console.log('✅ Dados processados e categorizados:', {
                cinema: this.data.cinema.length,
                series: this.data.series.length,
                channels: this.data.channels.length,
                favorites: this.data.favorites.length,
                kidsMovies: this.data.kidsMovies.length,
                kidsSeries: this.data.kidsSeries.length
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            console.log('🔄 Usando dados de exemplo...');
            this.loadFallbackData();
        }
    }
    
    async fetchJson(url) {
        console.log(`🌐 Buscando: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const text = await response.text();
        console.log(`📄 Resposta recebida: ${text.length} caracteres`);
        
        if (text.trim() === '') {
            throw new Error('Resposta vazia');
        }
        
        try {
            const data = JSON.parse(text);
            console.log(`✅ JSON parseado: ${data?.length || 0} itens`);
            return data;
        } catch (error) {
            console.error('❌ JSON Parse Error:', error);
            console.log('📄 Primeiros 100 caracteres:', text.substring(0, 100));
            throw new Error(`JSON inválido: ${error.message}`);
        }
    }
    
    async fetchM3U8(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        return this.parseM3U8(text);
    }
    
    parseM3U8(text) {
        const lines = text.split('\n');
        const channels = [];
        let currentChannel = {};
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXTINF:')) {
                const parts = line.split(',');
                if (parts.length > 1) {
                    currentChannel.name = parts[1].trim();
                }
            } else if (line && !line.startsWith('#') && currentChannel.name) {
                currentChannel.url = line.trim();
                currentChannel.id = currentChannel.name.replace(/\s+/g, '-').toLowerCase();
                currentChannel.logo = `https://via.placeholder.com/200x200/141414/e50914?text=${encodeURIComponent(currentChannel.name)}`;
                channels.push({...currentChannel});
                currentChannel = {};
            }
        }
        
        return channels;
    }
    
    loadFallbackData() {
        console.log('📺 Usando dados de exemplo...');
        const exampleMovies = [
            { id: '1', title: 'Filme Ação 2024', poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Ação+2024', year: '2024', genre: 'Ação', streamUrl: 'https://example.com/video1.mp4', type: 'movie' },
            { id: '2', title: 'Comédia Romântica', poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Comédia', year: '2024', genre: 'Comédia', streamUrl: 'https://example.com/video2.mp4', type: 'movie' },
            { id: '3', title: 'Terror Psicológico', poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Terror', year: '2024', genre: 'Terror', streamUrl: 'https://example.com/video3.mp4', type: 'movie' },
            { id: '4', title: 'Drama Intenso', poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Drama', year: '2024', genre: 'Drama', streamUrl: 'https://example.com/video4.mp4', type: 'movie' },
            { id: '5', title: 'Animação Família', poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Animação', year: '2024', genre: 'Animação', streamUrl: 'https://example.com/video5.mp4', type: 'movie' }
        ];
        
        this.data.cinema = this.shuffleArray(exampleMovies);
        this.data.series = exampleMovies.map(m => ({...m, id: m.id + '_s', seasons: 3, type: 'series'}));
        this.data.channels = exampleMovies.map(m => ({...m, id: m.id + '_c', name: 'Canal ' + m.title, logo: m.poster, type: 'channel'}));
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    renderHeroSection() {
        const heroCarousel = document.getElementById('heroCarousel');
        if (!heroCarousel) return;
        
        const featuredContent = this.getFeaturedContent();
        if (featuredContent.length === 0) return;
        
        heroCarousel.innerHTML = featuredContent.map((item, index) => `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${item.poster}');">
                <div class="hero-slide-overlay"></div>
            </div>
        `).join('');
        
        this.updateHeroContent(featuredContent[0]);
    }
    
    getFeaturedContent() {
        const allContent = [
            ...this.data.cinema.slice(0, 3),
            ...this.data.series.slice(0, 2)
        ];
        return this.shuffleArray(allContent).slice(0, 5);
    }
    
    updateHeroContent(content) {
        const heroTitle = document.getElementById('heroTitle');
        const heroDescription = document.getElementById('heroDescription');
        const heroPlayBtn = document.getElementById('heroPlayBtn');
        const heroInfoBtn = document.getElementById('heroInfoBtn');
        
        if (heroTitle) heroTitle.textContent = content.title || 'PaixãoFlix';
        if (heroDescription) heroDescription.textContent = content.description || 'Romance, ação, adrenalina e comédia';
        
        if (heroPlayBtn) {
            heroPlayBtn.onclick = () => this.playContent(content);
        }
        
        if (heroInfoBtn) {
            heroInfoBtn.onclick = () => this.showDetails(content);
        }
    }
    
    playHeroContent() {
        const featuredContent = this.getFeaturedContent();
        if (featuredContent.length > 0) {
            this.playContent(featuredContent[0]);
        }
    }
    
    renderContentSections() {
        this.renderContinueWatching();
        
        // Render categorized sections for Cinema
        if (this.categorizedContent && this.categorizedContent.cinema) {
            this.renderSection('lancamento2026', this.categorizedContent.cinema['Lançamento 2026']);
            this.renderSection('lancamento2025', this.categorizedContent.cinema['Lançamento 2025']);
            this.renderSection('acao', this.categorizedContent.cinema['Ação']);
            this.renderSection('aventura', this.categorizedContent.cinema['Aventura']);
            this.renderSection('anime', this.categorizedContent.cinema['Anime']);
            this.renderSection('animacao', this.categorizedContent.cinema['Animação']);
            this.renderSection('comedia', this.categorizedContent.cinema['Comédia']);
            this.renderSection('drama', this.categorizedContent.cinema['Drama']);
            this.renderSection('dorama', this.categorizedContent.cinema['Dorama']);
            this.renderSection('classicos', this.categorizedContent.cinema['Clássicos']);
            this.renderSection('crime', this.categorizedContent.cinema['Crime']);
            this.renderSection('policial', this.categorizedContent.cinema['Policial']);
            this.renderSection('familia', this.categorizedContent.cinema['Família']);
            this.renderSection('musical', this.categorizedContent.cinema['Musical']);
            this.renderSection('documentario', this.categorizedContent.cinema['Documentário']);
            this.renderSection('faroeste', this.categorizedContent.cinema['Faroeste']);
            this.renderSection('ficcao', this.categorizedContent.cinema['Ficção']);
            this.renderSection('nacional', this.categorizedContent.cinema['Nacional']);
            this.renderSection('religioso', this.categorizedContent.cinema['Religioso']);
            this.renderSection('romance', this.categorizedContent.cinema['Romance']);
            this.renderSection('terror', this.categorizedContent.cinema['Terror']);
            this.renderSection('suspense', this.categorizedContent.cinema['Suspense']);
            this.renderSection('adulto', this.categorizedContent.cinema['Adulto']);
        }
        
        // Render categorized sections for Series
        if (this.categorizedContent && this.categorizedContent.series) {
            this.renderSection('seriesAcao', this.categorizedContent.series['Ação']);
            this.renderSection('seriesComedia', this.categorizedContent.series['Comédia']);
            this.renderSection('seriesDrama', this.categorizedContent.series['Drama']);
            this.renderSection('seriesRomance', this.categorizedContent.series['Romance']);
            this.renderSection('seriesTerror', this.categorizedContent.series['Terror']);
            this.renderSection('seriesSuspense', this.categorizedContent.series['Suspense']);
        }
        
        // Render other sections
        this.renderSection('series', this.data.series.slice(0, 10));
        this.renderSection('channels', this.data.channels.slice(0, 10));
    }
    
    renderContinueWatching() {
        const container = document.getElementById('continueWatchingRow');
        if (!container) return;
        
        const progressData = this.getWatchProgress();
        if (progressData.length === 0) {
            document.getElementById('continueWatchingSection')?.style.setProperty('display', 'none');
            return;
        }
        
        const continueWatchingItems = progressData.map(item => {
            const content = this.findContentById(item.id);
            return content ? {...content, progress: item.progress} : null;
        }).filter(Boolean);
        
        container.innerHTML = continueWatchingItems.map(item => `
            <div class="content-card continue-watching-card focusable" onclick="app.playContent(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x170/141414/e50914?text=Sem+Imagem'">
                <div class="content-card-overlay">
                    <div class="content-card-title">${item.title}</div>
                    <div class="content-card-meta">${item.progress.toFixed(0)}% assistido</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.progress}%"></div>
                </div>
            </div>
        `).join('');
    }
    
    renderSection(sectionId, items) {
        const container = document.getElementById(`${sectionId}Row`);
        if (!container || items.length === 0) return;
        
        container.innerHTML = items.map(item => `
            <div class="content-card focusable" onclick="app.playContent(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x113/141414/e50914?text=Sem+Imagem'">
                <div class="content-card-overlay">
                    <div class="content-card-title">${item.title}</div>
                    <div class="content-card-meta">${item.year || '2024'} • ${this.cleanGenre(item.genre)}</div>
                </div>
            </div>
        `).join('');
    }
    
    getRandomContent(count) {
        const allContent = [...this.data.cinema, ...this.data.series];
        return this.shuffleArray(allContent).slice(0, count);
    }
    
    filterByYear(items, year) {
        return items.filter(item => item.year === year);
    }
    
    filterByGenre(items, genre) {
        return items.filter(item => {
            const genres = this.cleanGenre(item.genre).toLowerCase().split(', ');
            return genres.includes(genre.toLowerCase());
        });
    }
    
    cleanGenre(genre) {
        if (Array.isArray(genre)) return genre.join(', ');
        if (typeof genre === 'string') {
            return genre.replace(/[\[\]]/g, '').trim();
        }
        return 'Gênero';
    }
    
    findContentById(id) {
        const allContent = [
            ...this.data.cinema,
            ...this.data.series,
            ...this.data.channels,
            ...this.data.kidsMovies,
            ...this.data.kidsSeries
        ];
        return allContent.find(item => item.id === id);
    }
    
    getWatchProgress() {
        const progress = localStorage.getItem('paixaoflix_progress');
        return progress ? JSON.parse(progress) : [];
    }
    
    saveWatchProgress(id, progress) {
        const currentProgress = this.getWatchProgress();
        const filteredProgress = currentProgress.filter(item => item.id !== id);
        
        if (progress < 98) {
            filteredProgress.unshift({ id, progress, timestamp: Date.now() });
            if (filteredProgress.length > 10) {
                filteredProgress.pop();
            }
        }
        
        localStorage.setItem('paixaoflix_progress', JSON.stringify(filteredProgress));
    }
    
    startHeroCarousel() {
        this.heroSlideInterval = setInterval(() => {
            const slides = document.querySelectorAll('.hero-slide');
            if (slides.length === 0) return;
            
            slides[this.heroSlideIndex].classList.remove('active');
            this.heroSlideIndex = (this.heroSlideIndex + 1) % slides.length;
            slides[this.heroSlideIndex].classList.add('active');
            
            const featuredContent = this.getFeaturedContent();
            if (featuredContent[this.heroSlideIndex]) {
                this.updateHeroContent(featuredContent[this.heroSlideIndex]);
            }
        }, 8000);
    }
    
    stopHeroCarousel() {
        if (this.heroSlideInterval) {
            clearInterval(this.heroSlideInterval);
            this.heroSlideInterval = null;
        }
    }
    
    setupInfiniteScroll(row) {
        let isScrolling = false;
        
        row.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    const maxScroll = row.scrollWidth - row.clientWidth;
                    
                    // Infinite scroll logic
                    if (row.scrollLeft >= maxScroll - 10) {
                        // Clone first few cards and append to end
                        const firstCards = row.querySelectorAll('.content-card');
                        for (let i = 0; i < Math.min(5, firstCards.length); i++) {
                            const clone = firstCards[i].cloneNode(true);
                            row.appendChild(clone);
                        }
                    }
                    
                    if (row.scrollLeft <= 10) {
                        // Clone last few cards and prepend to beginning
                        const lastCards = row.querySelectorAll('.content-card');
                        for (let i = Math.max(0, lastCards.length - 5); i < lastCards.length; i++) {
                            const clone = lastCards[i].cloneNode(true);
                            row.insertBefore(clone, row.firstChild);
                            row.scrollLeft += clone.offsetWidth;
                        }
                    }
                    
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const currentFocus = document.activeElement;
            if (currentFocus && currentFocus.classList.contains('content-card')) {
                if (diff > 0) {
                    // Swipe left - next card
                    const nextCard = currentFocus.nextElementSibling;
                    if (nextCard) nextCard.focus();
                } else {
                    // Swipe right - previous card
                    const prevCard = currentFocus.previousElementSibling;
                    if (prevCard) prevCard.focus();
                }
            }
        }
    }
    
    handleSearch(query) {
        if (query.length < 2) return;
        
        const allContent = [
            ...this.data.cinema,
            ...this.data.series,
            ...this.data.channels
        ];
        
        const results = allContent.filter(item => 
            item.title?.toLowerCase().includes(query.toLowerCase()) ||
            item.name?.toLowerCase().includes(query.toLowerCase())
        );
        
        console.log('🔍 Resultados da busca:', results);
        // TODO: Implement search results display
    }
    
    navigateToSection(section) {
        this.currentSection = section;
        console.log('📍 Navegando para:', section);
        
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });
        
        // TODO: Implement section-specific content
        switch (section) {
            case 'home':
                this.renderContentSections();
                break;
            case 'cinema':
                this.renderSection('cinema', this.data.cinema);
                break;
            case 'series':
                this.renderSection('series', this.data.series);
                break;
            case 'channels':
                this.renderSection('channels', this.data.channels);
                break;
            case 'kids':
                this.renderSection('kids', [...this.data.kidsMovies, ...this.data.kidsSeries]);
                break;
            case 'favorites':
                this.renderSection('favorites', this.data.favorites);
                break;
        }
    }
    
    playContent(content) {
        if (content.type === 'series') {
            this.showSeriesDetails(content);
        } else {
            this.playVideo(content.streamUrl || content.url, content.id);
        }
    }
    
    showDetails(content) {
        if (content.type === 'series') {
            this.showSeriesDetails(content);
        } else {
            // TODO: Implement movie details modal
            console.log('📽️ Detalhes do filme:', content);
        }
    }
    
    playVideo(url, contentId) {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        
        if (modal && player) {
            player.src = url;
            modal.classList.add('active');
            player.play();
            
            // Track progress
            player.addEventListener('timeupdate', () => {
                const progress = (player.currentTime / player.duration) * 100;
                this.saveWatchProgress(contentId, progress);
            });
        }
    }
    
    showSeriesDetails(series) {
        const modal = document.getElementById('seriesModal');
        const container = document.getElementById('seriesDetails');
        
        if (modal && container) {
            // TODO: Implement series details with episodes
            container.innerHTML = `
                <div class="series-header">
                    <div class="series-poster">
                        <img src="${series.poster}" alt="${series.title}" onerror="this.src='https://via.placeholder.com/200x300/141414/e50914?text=Sem+Imagem'">
                    </div>
                    <div class="series-info">
                        <h2 class="series-title">${series.title}</h2>
                        <p class="series-description">${series.description || 'Sinopse não disponível'}</p>
                        <div class="series-actions">
                            <button class="btn-primary" onclick="app.playFirstEpisode('${series.id}')">
                                <i class="fas fa-play"></i> Assistir
                            </button>
                            <button class="btn-secondary" onclick="app.addToFavorites('${series.id}')">
                                <i class="fas fa-heart"></i> Favoritar
                            </button>
                        </div>
                    </div>
                </div>
                <div class="episodes-grid">
                    <!-- Episodes will be loaded here -->
                </div>
            `;
            
            modal.classList.add('active');
        }
    }
    
    playFirstEpisode(seriesId) {
        const series = this.findContentById(seriesId);
        if (series && series.streamUrl) {
            this.playVideo(series.streamUrl, seriesId);
        }
    }
    
    addToFavorites(contentId) {
        const content = this.findContentById(contentId);
        if (content && !this.data.favorites.find(f => f.id === contentId)) {
            this.data.favorites.push(content);
            localStorage.setItem('paixaoflix_favorites', JSON.stringify(this.data.favorites));
            console.log('❤️ Adicionado aos favoritos:', content.title);
        }
    }
    
    closeModals() {
        document.querySelectorAll('.video-modal, .series-modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        const player = document.getElementById('videoPlayer');
        if (player) {
            player.pause();
            player.src = '';
        }
    }
    
    // Navigation methods for D-pad and keyboard
    navigateUp() {
        // TODO: Implement up navigation
    }
    
    navigateDown() {
        // TODO: Implement down navigation
    }
    
    navigateLeft() {
        // TODO: Implement left navigation
    }
    
    navigateRight() {
        // TODO: Implement right navigation
    }
    
    activateCurrentElement() {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('focusable')) {
            activeElement.click();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PaixaoFlixApp();
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('video-modal') || e.target.classList.contains('series-modal')) {
        window.app?.closeModals();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.app?.closeModals();
    }
});
