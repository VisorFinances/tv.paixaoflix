// Configuração da API TMDB
const TMDB_CONFIG = {
    API_KEY: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/original'
};

// Função para buscar filmes populares do TMDB
async function buscarFilmesPopulares(page = 1) {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/movie/popular?api_key=${TMDB_CONFIG.API_KEY}&language=pt-BR&page=${page}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results.map(filme => ({
            id: filme.id.toString(),
            titulo: filme.title,
            descricao: filme.overview,
            poster: `${TMDB_CONFIG.IMAGE_BASE_URL}${filme.poster_path}`,
            backdrop: `${TMDB_CONFIG.BACKDROP_BASE_URL}${filme.backdrop_path}`,
            ano: new Date(filme.release_date).getFullYear(),
            genero: filme.genre_ids.join(', '),
            duracao: '120 min', // TMDB não retorna duração na lista popular
            classificacao: 'L', // TMDB não retorna classificação na API gratuita
            trailer: `https://www.youtube.com/results?search_query=${filme.title}+trailer`,
            video: filme.video ? `https://www.youtube.com/watch?v=${filme.video}` : null,
            rating: Math.round(filme.vote_average * 10)
        }));
    } catch (error) {
        console.error('Erro ao buscar filmes populares:', error);
        return [];
    }
}

// Função para buscar filmes por gênero
async function buscarFilmesPorGenero(generoId, page = 1) {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/discover/movie?api_key=${TMDB_CONFIG.API_KEY}&language=pt-BR&with_genres=${generoId}&page=${page}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results.map(filme => ({
            id: filme.id.toString(),
            titulo: filme.title,
            descricao: filme.overview,
            poster: `${TMDB_CONFIG.IMAGE_BASE_URL}${filme.poster_path}`,
            backdrop: `${TMDB_CONFIG.BACKDROP_BASE_URL}${filme.backdrop_path}`,
            ano: new Date(filme.release_date).getFullYear(),
            genero: filme.genre_ids.join(', '),
            duracao: '120 min',
            classificacao: 'L',
            trailer: `https://www.youtube.com/results?search_query=${filme.title}+trailer`,
            video: filme.video ? `https://www.youtube.com/watch?v=${filme.video}` : null,
            rating: Math.round(filme.vote_average * 10)
        }));
    } catch (error) {
        console.error('Erro ao buscar filmes por gênero:', error);
        return [];
    }
}

// Função para buscar séries populares
async function buscarSeriesPopulares(page = 1) {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/tv/popular?api_key=${TMDB_CONFIG.API_KEY}&language=pt-BR&page=${page}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results.map(serie => ({
            id: serie.id.toString(),
            titulo: serie.name,
            descricao: serie.overview,
            poster: `${TMDB_CONFIG.IMAGE_BASE_URL}${serie.poster_path}`,
            backdrop: `${TMDB_CONFIG.BACKDROP_BASE_URL}${serie.backdrop_path}`,
            ano: new Date(serie.first_air_date).getFullYear(),
            genero: serie.genre_ids.join(', '),
            duracao: '45 min',
            classificacao: 'L',
            trailer: `https://www.youtube.com/results?search_query=${serie.name}+trailer`,
            video: serie.video ? `https://www.youtube.com/watch?v=${serie.video}` : null,
            rating: Math.round(serie.vote_average * 10)
        }));
    } catch (error) {
        console.error('Erro ao buscar séries populares:', error);
        return [];
    }
}

// Função para buscar detalhes de um filme específico
async function buscarDetalhesFilme(filmeId) {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/movie/${filmeId}?api_key=${TMDB_CONFIG.API_KEY}&language=pt-BR`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const filme = await response.json();
        return {
            id: filme.id.toString(),
            titulo: filme.title,
            descricao: filme.overview,
            poster: `${TMDB_CONFIG.IMAGE_BASE_URL}${filme.poster_path}`,
            backdrop: `${TMDB_CONFIG.BACKDROP_BASE_URL}${filme.backdrop_path}`,
            ano: new Date(filme.release_date).getFullYear(),
            genero: filme.genres.map(g => g.name).join(', '),
            duracao: `${filme.runtime} min`,
            classificacao: 'L',
            trailer: `https://www.youtube.com/results?search_query=${filme.title}+trailer`,
            video: filme.video ? `https://www.youtube.com/watch?v=${filme.video}` : null,
            rating: Math.round(filme.vote_average * 10)
        };
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error);
        return null;
    }
}

// Função para buscar filmes por termo de busca
async function buscarFilmesPorTermo(termo, page = 1) {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&language=pt-BR&query=${encodeURIComponent(termo)}&page=${page}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results.map(item => {
            if (item.media_type === 'movie') {
                return {
                    id: item.id.toString(),
                    titulo: item.title,
                    descricao: item.overview,
                    poster: item.poster_path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/300x450/333/fff?text=Sem+Imagem',
                    backdrop: item.backdrop_path ? `${TMDB_CONFIG.BACKDROP_BASE_URL}${item.backdrop_path}` : null,
                    ano: new Date(item.release_date).getFullYear(),
                    genero: item.genre_ids.join(', '),
                    duracao: '120 min',
                    classificacao: 'L',
                    trailer: `https://www.youtube.com/results?search_query=${item.title}+trailer`,
                    video: item.video ? `https://www.youtube.com/watch?v=${item.video}` : null,
                    rating: Math.round(item.vote_average * 10),
                    tipo: 'filme'
                };
            } else if (item.media_type === 'tv') {
                return {
                    id: item.id.toString(),
                    titulo: item.name,
                    descricao: item.overview,
                    poster: item.poster_path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/300x450/333/fff?text=Sem+Imagem',
                    backdrop: item.backdrop_path ? `${TMDB_CONFIG.BACKDROP_BASE_URL}${item.backdrop_path}` : null,
                    ano: new Date(item.first_air_date).getFullYear(),
                    genero: item.genre_ids.join(', '),
                    duracao: '45 min',
                    classificacao: 'L',
                    trailer: `https://www.youtube.com/results?search_query=${item.name}+trailer`,
                    video: item.video ? `https://www.youtube.com/watch?v=${item.video}` : null,
                    rating: Math.round(item.vote_average * 10),
                    tipo: 'serie'
                };
            }
        }).filter(item => item !== undefined);
    } catch (error) {
        console.error('Erro ao buscar filmes por termo:', error);
        return [];
    }
}

// Mapeamento de gêneros TMDB
const GENEROS_TMDB = {
    28: 'Ação',
    12: 'Aventura',
    16: 'Animação',
    35: 'Comédia',
    80: 'Crime',
    99: 'Documentário',
    18: 'Drama',
    10751: 'Família',
    14: 'Fantasia',
    36: 'História',
    27: 'Terror',
    10402: 'Música',
    9648: 'Mistério',
    10749: 'Romance',
    878: 'Ficção Científica',
    53: 'Thriller',
    10752: 'Guerra',
    37: 'Faroeste'
};

// Exportar funções para uso global
window.TMDB_API = {
    buscarFilmesPopulares,
    buscarFilmesPorGenero,
    buscarSeriesPopulares,
    buscarDetalhesFilme,
    buscarFilmesPorTermo,
    GENEROS_TMDB,
    TMDB_CONFIG
};
