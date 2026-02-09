class TMDBService {
    constructor() {
        this.apiKey = 'SUA_API_KEY_AQUI'; // Substitua pela sua chave do TMDB
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imgBaseUrl = 'https://image.tmdb.org/t/p/w500';
        this.lang = 'pt-BR';
    }

    // Busca metadados baseados no nome da pasta ou arquivo
    async fetchMetadata(query, type = 'movie') {
        try {
            const searchPath = type === 'movie' ? '/search/movie' : '/search/tv';
            const response = await fetch(
                `${this.baseUrl}${searchPath}?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=${this.lang}`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                return this.formatData(data.results[0], type);
            }
            return null;
        } catch (error) {
            console.error("Erro TMDB:", error);
            return null;
        }
    }

    // Busca detalhes dos episódios (essencial para as pastas do Archive)
    async fetchEpisodeDetails(tvId, seasonNum, episodeNum) {
        try {
            const response = await fetch(
                `${this.baseUrl}/tv/${tvId}/season/${seasonNum}/episode/${episodeNum}?api_key=${this.apiKey}&language=${this.lang}`
            );
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    formatData(item, type) {
        return {
            tmdbId: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster: `${this.imgBaseUrl}${item.poster_path}`,
            backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
            rating: item.vote_average.toFixed(1),
            year: (item.release_date || item.first_air_date || '').split('-')[0],
            type: type
        };
    }
}
