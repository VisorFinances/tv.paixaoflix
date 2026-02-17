// Data Management and API Integration
class DataManager {
    constructor() {
        this.cache = new Map();
        this.apiKeys = {
            tmdb: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
            archive: 'https://archive.org/download/'
        };
        this.endpoints = {
            github: 'https://raw.githubusercontent.com/VisorFinances/tv.paixaoflix/main/data/',
            tmdb: 'https://api.themoviedb.org/3',
            archive: 'https://archive.org/metadata/'
        };
        this.categories = [
            'Lançamento 2026',
            'Lançamento 2025',
            'Ação',
            'Aventura',
            'Anime',
            'Animação',
            'Comédia',
            'Drama',
            'Dorama',
            'Clássicos',
            'Crime',
            'Policial',
            'Família',
            'Musical',
            'Documentário',
            'Faroeste',
            'Ficção',
            'Nacional',
            'Religioso',
            'Romance',
            'Terror',
            'Suspense',
            'Adulto'
        ];
        
        this.init();
    }
    
    init() {
        this.setupCache();
        this.setupOfflineSupport();
        console.log('📊 Sistema de dados inicializado');
    }
    
    setupCache() {
        // Setup cache with expiration
        this.cache = {
            data: new Map(),
            timestamps: new Map(),
            maxAge: 30 * 60 * 1000, // 30 minutes
            maxSize: 100,
            
            set(key, value) {
                // Remove oldest items if cache is full
                if (this.data.size >= this.maxSize) {
                    const oldestKey = this.data.keys().next().value;
                    this.delete(oldestKey);
                }
                
                this.data.set(key, value);
                this.timestamps.set(key, Date.now());
            },
            
            get(key) {
                const timestamp = this.timestamps.get(key);
                if (!timestamp || Date.now() - timestamp > this.maxAge) {
                    this.delete(key);
                    return null;
                }
                return this.data.get(key);
            },
            
            delete(key) {
                this.data.delete(key);
                this.timestamps.delete(key);
            },
            
            clear() {
                this.data.clear();
                this.timestamps.clear();
            }
        };
    }
    
    setupOfflineSupport() {
        // Service Worker not required for basic functionality
        console.log('📱 Service Worker desabilitado para compatibilidade');
    }
    
    // GitHub Data Loading
    async loadGitHubData() {
        const cacheKey = 'github_data';
        const cached = this.cache.get(cacheKey);
        
        if (cached) {
            console.log('📦 Usando dados em cache');
            return cached;
        }
        
        try {
            console.log('📥 Carregando dados do GitHub...');
            
            const urls = {
                cinema: this.endpoints.github + 'cinema.json',
                series: this.endpoints.github + 's%C3%A9ries.json',
                channels: this.endpoints.github + 'canaisaovivo.m3u8',
                favorites: this.endpoints.github + 'favoritos.json',
                kidsMovies: this.endpoints.github + 'filmeskids.json',
                kidsSeries: this.endpoints.github + 's%C3%A9rieskids.json'
            };
            
            const promises = Object.entries(urls).map(async ([key, url]) => {
                try {
                    if (key === 'channels') {
                        const text = await this.fetchText(url);
                        return [key, this.parseM3U8(text)];
                    } else {
                        const data = await this.fetchJson(url);
                        return [key, data];
                    }
                } catch (error) {
                    console.error(`❌ Erro ao carregar ${key}:`, error);
                    return [key, []];
                }
            });
            
            const results = await Promise.all(promises);
            const data = Object.fromEntries(results);
            
            // Cache the results
            this.cache.set(cacheKey, data);
            
            console.log('✅ Dados carregados:', {
                cinema: data.cinema?.length || 0,
                series: data.series?.length || 0,
                channels: data.channels?.length || 0,
                favorites: data.favorites?.length || 0,
                kidsMovies: data.kidsMovies?.length || 0,
                kidsSeries: data.kidsSeries?.length || 0
            });
            
            return data;
            
        } catch (error) {
            console.error('❌ Erro crítico ao carregar dados:', error);
            return this.getFallbackData();
        }
    }
    
    async fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const text = await response.text();
        
        // Handle GitHub returning text/plain instead of application/json
        if (text.trim() === '') {
            throw new Error('Empty response');
        }
        
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error('JSON Parse Error:', error, 'Response length:', text.length);
            throw new Error(`Invalid JSON response from ${url}`);
        }
    }
    
    async fetchText(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
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
                    
                    // Extract additional info
                    const attributes = line.match(/([a-zA-Z-]+)="([^"]*)"/g);
                    if (attributes) {
                        attributes.forEach(attr => {
                            const [key, value] = attr.split('=');
                            currentChannel[key] = value.replace(/"/g, '');
                        });
                    }
                }
            } else if (line && !line.startsWith('#') && currentChannel.name) {
                currentChannel.url = line.trim();
                currentChannel.id = this.generateId(currentChannel.name);
                currentChannel.logo = currentChannel.tvgLogo || `https://via.placeholder.com/200x200/141414/e50914?text=${encodeURIComponent(currentChannel.name)}`;
                currentChannel.type = 'channel';
                
                channels.push({...currentChannel});
                currentChannel = {};
            }
        }
        
        return channels;
    }
    
    // TMDB API Integration
    async getTMDBData(title, type = 'movie', year = null) {
        const cacheKey = `tmdb_${type}_${title}_${year || ''}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            // Search for the content
            const searchUrl = `${this.endpoints.tmdb}/search/${type}?api_key=${this.apiKeys.tmdb}&query=${encodeURIComponent(title)}&language=pt-BR${year ? `&year=${year}` : ''}`;
            const searchResponse = await this.fetchJson(searchUrl);
            
            if (!searchResponse.results || searchResponse.results.length === 0) {
                return null;
            }
            
            const result = searchResponse.results[0];
            
            // Get detailed information
            const detailsUrl = `${this.endpoints.tmdb}/${type}/${result.id}?api_key=${this.apiKeys.tmdb}&language=pt-BR&append_to_response=videos,images`;
            const details = await this.fetchJson(detailsUrl);
            
            const processedData = {
                id: details.id,
                title: details.title || details.name,
                originalTitle: details.original_title || details.original_name,
                overview: details.overview,
                poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
                backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null,
                releaseDate: details.release_date || details.first_air_date,
                year: new Date(details.release_date || details.first_air_date).getFullYear(),
                genres: details.genres?.map(g => g.name) || [],
                rating: details.vote_average,
                voteCount: details.vote_count,
                runtime: details.runtime || details.episode_run_time?.[0],
                trailer: this.extractTrailer(details.videos?.results),
                type: type,
                tmdbId: details.id
            };
            
            this.cache.set(cacheKey, processedData);
            return processedData;
            
        } catch (error) {
            console.error('❌ Erro ao buscar dados TMDB:', error);
            return null;
        }
    }
    
    extractTrailer(videos) {
        if (!videos || videos.length === 0) return null;
        
        // Try to find official trailer first
        const trailer = videos.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' && 
            video.official === true
        );
        
        if (trailer) {
            return `https://www.youtube.com/watch?v=${trailer.key}`;
        }
        
        // Fallback to any trailer
        const anyTrailer = videos.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube'
        );
        
        return anyTrailer ? `https://www.youtube.com/watch?v=${anyTrailer.key}` : null;
    }
    
    // Archive.org Integration
    async getArchiveEpisodes(archiveId) {
        const cacheKey = `archive_${archiveId}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            const metadataUrl = `${this.endpoints.archive}${archiveId}`;
            const metadata = await this.fetchJson(metadataUrl);
            
            const episodes = metadata.files
                .filter(file => 
                    file.name.match(/\.(mp4|mkv|avi)$/i) &&
                    !file.name.includes(/trailer|sample|preview/i)
                )
                .map((file, index) => ({
                    id: file.name,
                    title: this.extractEpisodeTitle(file.name, index),
                    description: file.description || '',
                    duration: this.formatDuration(file.duration),
                    size: file.size,
                    url: `${this.apiKeys.archive}${archiveId}/${encodeURIComponent(file.name)}`,
                    thumbnail: this.getEpisodeThumbnail(archiveId, file.name),
                    season: this.extractSeason(file.name),
                    episode: this.extractEpisodeNumber(file.name)
                }))
                .sort((a, b) => {
                    // Sort by season and episode number
                    if (a.season !== b.season) {
                        return (a.season || 0) - (b.season || 0);
                    }
                    return (a.episode || 0) - (b.episode || 0);
                });
            
            this.cache.set(cacheKey, episodes);
            return episodes;
            
        } catch (error) {
            console.error('❌ Erro ao buscar episódios do Archive.org:', error);
            return [];
        }
    }
    
    extractEpisodeTitle(filename, index) {
        // Try to extract title from filename
        const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        return `Episódio ${index + 1}`;
    }
    
    extractSeason(filename) {
        const match = filename.match(/S(\d+)/i) || filename.match(/season(\d+)/i);
        return match ? parseInt(match[1]) : null;
    }
    
    extractEpisodeNumber(filename) {
        const match = filename.match(/E(\d+)/i) || filename.match(/episode(\d+)/i);
        return match ? parseInt(match[1]) : null;
    }
    
    getEpisodeThumbnail(archiveId, filename) {
        // Try to find thumbnail in archive
        return `${this.apiKeys.archive}${archiveId}/__thumb__/${encodeURIComponent(filename.replace(/\.[^/.]+$/, '.jpg'))}`;
    }
    
    formatDuration(seconds) {
        if (!seconds) return '45min';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    }
    
    // Data Processing
    processContent(content) {
        return content.map(item => ({
            ...item,
            id: item.id || this.generateId(item.title || item.name || item.titulo),
            title: item.title || item.name || item.titulo,
            poster: this.processImageUrl(item.poster || item.image || item.capa),
            backdrop: this.processImageUrl(item.backdrop),
            year: item.year || this.extractYear(item.releaseDate || item.ano),
            genre: this.processGenre(item.genre || item.genero || item.genres),
            description: item.description || item.overview || item.sinopse || '',
            rating: item.rating || item.voteAverage || item.nota,
            type: item.type || this.detectContentType(item),
            streamUrl: item.streamUrl || item.url || item.url_stream,
            trailer: item.trailer,
            seasons: item.seasons || item.number_of_seasons,
            episodes: item.episodes || item.number_of_episodes,
            archiveId: item.identificador_archive || item.archiveId
        }));
    }
    
    processImageUrl(url) {
        if (!url) return null;
        
        // If it's already a full URL, return as is
        if (url.startsWith('http')) {
            return url;
        }
        
        // If it's a relative path, make it absolute
        if (url.startsWith('/')) {
            return url;
        }
        
        // Otherwise, treat as relative to current domain
        return `/${url}`;
    }
    
    processGenre(genre) {
        if (Array.isArray(genre)) {
            return genre.join(', ');
        }
        
        if (typeof genre === 'string') {
            return genre.replace(/[\[\]]/g, '').trim();
        }
        
        return 'Gênero';
    }
    
    extractYear(dateString) {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        return isNaN(date.getFullYear()) ? null : date.getFullYear();
    }
    
    detectContentType(item) {
        if (item.type) return item.type;
        
        const title = (item.title || item.name || item.titulo || '').toLowerCase();
        
        if (title.includes('série') || title.includes('serie') || title.includes('temporada') || item.seasons || item.episodes || item.identificador_archive) {
            return 'series';
        }
        
        if (title.includes('canal') || title.includes('channel') || item.url?.includes('.m3u8')) {
            return 'channel';
        }
        
        return 'movie';
    }
    
    generateId(text) {
        if (!text) return Math.random().toString(36).substr(2, 9);
        
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
    }
    
    // Content Categorization by Genre
    categorizeContent(content) {
        const categorized = {};
        
        // Initialize all categories
        this.categories.forEach(category => {
            categorized[category] = [];
        });
        
        content.forEach(item => {
            const genres = this.processGenre(item.genre || item.genero || item.genres).toLowerCase().split(', ');
            const title = (item.title || item.name || item.titulo || '').toLowerCase();
            const year = item.year || this.extractYear(item.releaseDate || item.ano);
            
            // Check for launch years first
            if (year === 2026) {
                categorized['Lançamento 2026'].push(item);
            } else if (year === 2025) {
                categorized['Lançamento 2025'].push(item);
            } else {
                // Check genre matching
                let foundCategory = false;
                
                genres.forEach(genre => {
                    const cleanGenre = genre.trim();
                    
                    // Direct genre matching
                    if (this.categories.includes(cleanGenre)) {
                        categorized[cleanGenre].push(item);
                        foundCategory = true;
                    }
                    
                    // Special genre mappings
                    if (cleanGenre.includes('ação') || cleanGenre.includes('action')) {
                        categorized['Ação'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('aventura') || cleanGenre.includes('adventure')) {
                        categorized['Aventura'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('anime') || cleanGenre.includes('animation')) {
                        categorized['Anime'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('animação') || cleanGenre.includes('animation')) {
                        categorized['Animação'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('comédia') || cleanGenre.includes('comedy')) {
                        categorized['Comédia'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('drama')) {
                        categorized['Drama'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('dorama') || cleanGenre.includes('asian drama')) {
                        categorized['Dorama'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('clássico') || cleanGenre.includes('classic')) {
                        categorized['Clássicos'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('crime') || cleanGenre.includes('criminal')) {
                        categorized['Crime'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('policial') || cleanGenre.includes('police')) {
                        categorized['Policial'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('família') || cleanGenre.includes('family')) {
                        categorized['Família'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('musical') || cleanGenre.includes('music')) {
                        categorized['Musical'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('documentário') || cleanGenre.includes('documentary')) {
                        categorized['Documentário'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('faroeste') || cleanGenre.includes('western')) {
                        categorized['Faroeste'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('ficção') || cleanGenre.includes('sci-fi') || cleanGenre.includes('science fiction')) {
                        categorized['Ficção'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('nacional') || cleanGenre.includes('brasileiro') || cleanGenre.includes('brazilian')) {
                        categorized['Nacional'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('religioso') || cleanGenre.includes('religious') || cleanGenre.includes('faith')) {
                        categorized['Religioso'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('romance') || cleanGenre.includes('love')) {
                        categorized['Romance'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('terror') || cleanGenre.includes('horror')) {
                        categorized['Terror'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('suspense') || cleanGenre.includes('thriller')) {
                        categorized['Suspense'].push(item);
                        foundCategory = true;
                    }
                    if (cleanGenre.includes('adulto') || cleanGenre.includes('adult') || cleanGenre.includes('+18')) {
                        categorized['Adulto'].push(item);
                        foundCategory = true;
                    }
                });
                
                // Title-based categorization as fallback
                if (!foundCategory) {
                    if (title.includes('ação') || title.includes('action')) {
                        categorized['Ação'].push(item);
                    } else if (title.includes('comédia') || title.includes('comedy')) {
                        categorized['Comédia'].push(item);
                    } else if (title.includes('terror') || title.includes('horror')) {
                        categorized['Terror'].push(item);
                    } else if (title.includes('romance') || title.includes('love')) {
                        categorized['Romance'].push(item);
                    } else {
                        // Default to Drama if no category matches
                        categorized['Drama'].push(item);
                    }
                }
            }
        });
        
        return categorized;
    }
    
    // Content Filtering and Search
    filterByCategory(content, category) {
        if (!category || category === 'all') return content;
        
        return content.filter(item => {
            const genres = this.processGenre(item.genre).toLowerCase().split(', ');
            return genres.some(g => g.trim() === category.toLowerCase());
        });
    }
    
    filterByYear(content, year) {
        if (!year) return content;
        
        return content.filter(item => {
            return item.year == year;
        });
    }
    
    filterByType(content, type) {
        if (!type) return content;
        
        return content.filter(item => item.type === type);
    }
    
    searchContent(content, query) {
        if (!query || query.length < 2) return [];
        
        const searchTerm = query.toLowerCase();
        
        return content.filter(item => {
            const title = (item.title || item.name || item.titulo || '').toLowerCase();
            const description = (item.description || item.overview || item.sinopse || '').toLowerCase();
            const genre = this.processGenre(item.genre || item.genero || item.genres).toLowerCase();
            
            return title.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   genre.includes(searchTerm);
        });
    }
    
    getRandomContent(content, count = 5) {
        const shuffled = [...content].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, content.length));
    }
    
    getFeaturedContent(content, count = 5) {
        // Get content with highest ratings
        return content
            .filter(item => item.rating && item.rating > 7)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, Math.min(count, content.length));
    }
    
    // Fallback Data
    getFallbackData() {
        console.log('📺 Usando dados de exemplo...');
        
        const exampleMovies = [
            {
                id: 'movie_1',
                title: 'Filme Ação 2024',
                poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Ação+2024',
                backdrop: 'https://via.placeholder.com/1920x1080/141414/e50914?text=Ação+2024',
                year: 2024,
                genre: 'Ação',
                description: 'Um filme de ação emocionante com muitas cenas de perigo.',
                rating: 8.5,
                type: 'movie',
                streamUrl: 'https://example.com/action_movie.mp4'
            },
            {
                id: 'movie_2',
                title: 'Comédia Romântica',
                poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Comédia',
                backdrop: 'https://via.placeholder.com/1920x1080/141414/e50914?text=Comédia',
                year: 2024,
                genre: 'Comédia',
                description: 'Uma história de amor divertida e comovente.',
                rating: 7.8,
                type: 'movie',
                streamUrl: 'https://example.com/comedy_movie.mp4'
            },
            {
                id: 'movie_3',
                title: 'Terror Psicológico',
                poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Terror',
                backdrop: 'https://via.placeholder.com/1920x1080/141414/e50914?text=Terror',
                year: 2024,
                genre: 'Terror',
                description: 'Um thriller que vai prender sua atenção.',
                rating: 8.2,
                type: 'movie',
                streamUrl: 'https://example.com/horror_movie.mp4'
            },
            {
                id: 'movie_4',
                title: 'Drama Intenso',
                poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Drama',
                backdrop: 'https://via.placeholder.com/1920x1080/141414/e50914?text=Drama',
                year: 2024,
                genre: 'Drama',
                description: 'Uma história dramática poderosa e emocionante.',
                rating: 9.1,
                type: 'movie',
                streamUrl: 'https://example.com/drama_movie.mp4'
            },
            {
                id: 'movie_5',
                title: 'Animação Família',
                poster: 'https://via.placeholder.com/200x300/141414/e50914?text=Animação',
                backdrop: 'https://via.placeholder.com/1920x1080/141414/e50914?text=Animação',
                year: 2024,
                genre: 'Animação',
                description: 'Uma animação encantadora para toda a família.',
                rating: 8.7,
                type: 'movie',
                streamUrl: 'https://example.com/animation_movie.mp4'
            }
        ];
        
        const exampleSeries = exampleMovies.map((movie, index) => ({
            ...movie,
            id: `series_${index + 1}`,
            type: 'series',
            seasons: 3,
            episodes: 24,
            description: `Série baseada no filme ${movie.title}`,
            archiveId: `series-example-${index + 1}`
        }));
        
        const exampleChannels = exampleMovies.map((movie, index) => ({
            id: `channel_${index + 1}`,
            name: `Canal ${movie.title}`,
            logo: movie.poster,
            type: 'channel',
            url: movie.streamUrl,
            description: `Canal 24/7 de ${movie.genre}`
        }));
        
        return {
            cinema: exampleMovies,
            series: exampleSeries,
            channels: exampleChannels,
            favorites: [],
            kidsMovies: exampleMovies.slice(0, 3),
            kidsSeries: exampleSeries.slice(0, 2)
        };
    }
    
    // Utility Methods
    async enrichWithTMDB(content) {
        const enriched = [];
        
        for (const item of content) {
            try {
                const tmdbData = await this.getTMDBData(item.title, item.type, item.year);
                
                if (tmdbData) {
                    enriched.push({
                        ...item,
                        poster: tmdbData.poster || item.poster,
                        backdrop: tmdbData.backdrop || item.backdrop,
                        description: tmdbData.overview || item.description,
                        rating: tmdbData.rating || item.rating,
                        genres: tmdbData.genres || item.genres,
                        trailer: tmdbData.trailer || item.trailer,
                        tmdbId: tmdbData.tmdbId
                    });
                } else {
                    enriched.push(item);
                }
            } catch (error) {
                console.error(`Erro ao enriquecer ${item.title}:`, error);
                enriched.push(item);
            }
        }
        
        return enriched;
    }
    
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpo');
    }
    
    getCacheInfo() {
        return {
            size: this.cache.data.size,
            maxSize: this.cache.maxSize,
            maxAge: this.cache.maxAge
        };
    }
}

// Initialize data manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dataManager = new DataManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
