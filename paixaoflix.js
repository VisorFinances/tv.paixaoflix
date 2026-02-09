const TMDB_CONFIG = {
    apiKey: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
    baseUrl: 'https://api.themoviedb.org/3',
    imgUrl: 'https://image.tmdb.org/t/p/w500',
    lang: 'pt-BR'
};

// Esta função é o coração da busca
async function buscarNoTMDB(nome, tipo = 'movie') {
    const url = `${TMDB_CONFIG.baseUrl}/search/${tipo}?api_key=${TMDB_CONFIG.apiKey}&query=${encodeURIComponent(nome)}&language=${TMDB_CONFIG.lang}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const resultado = data.results[0];
            return {
                titulo: resultado.title || resultado.name,
                poster: TMDB_CONFIG.imgUrl + resultado.poster_path,
                banner: 'https://image.tmdb.org/t/p/original' + resultado.backdrop_path,
                resumo: resultado.overview,
                nota: resultado.vote_average,
                id: resultado.id
            };
        }
    } catch (erro) {
        console.error("Erro ao conectar com TMDB:", erro);
    }
    return null;
}
