const TMDB_CONFIG = {
    apiKey: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
    baseUrl: 'https://api.themoviedb.org/3',
    imgUrl: 'https://image.tmdb.org/t/p/w500',
    lang: 'pt-BR'
};

async function buscarNoTMDB(nome) {
    const url = `${TMDB_CONFIG.baseUrl}/search/movie?api_key=${TMDB_CONFIG.apiKey}&query=${encodeURIComponent(nome)}&language=${TMDB_CONFIG.lang}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results ? data.results[0] : null;
    } catch (e) { return null; }
}

async function carregarCatalogo() {
    const filmes = ['Batman', 'Superman', 'Avatar', 'Deadpool', 'Avengers'];
    const container = document.getElementById('melhores-2025-row');
    if(!container) return;

    for (let nome of filmes) {
        const info = await buscarNoTMDB(nome);
        if (info) {
            const card = document.createElement('div');
            card.className = 'movie-card focusable'; 
            card.tabIndex = 0; 
            card.innerHTML = `<img src="${TMDB_CONFIG.imgUrl + info.poster_path}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            container.appendChild(card);
        }
    }
    
    // Força o primeiro foco após criar os itens
    setTimeout(() => {
        const primeiro = document.querySelector('.focusable');
        if (primeiro) primeiro.focus();
    }, 500);
}

// LÓGICA DE NAVEGAÇÃO TRAVADA
document.addEventListener('keydown', function(e) {
    const itens = Array.from(document.querySelectorAll('.focusable'));
    const atual = document.activeElement;
    
    // Se nada estiver focado, foca no primeiro item disponível
    if (!itens.includes(atual)) {
        if (itens.length > 0) itens[0].focus();
        return;
    }

    const rectAtual = atual.getBoundingClientRect();
    let proximo = null;
    let menorDistancia = Infinity;

    itens.forEach(item => {
        if (item === atual) return;
        const rectItem = item.getBoundingClientRect();

        // Lógica de direção: verifica se o item está na direção da seta
        let isDirecaoCorreta = false;
        if (e.key === 'ArrowRight') isDirecaoCorreta = rectItem.left >= rectAtual.right - 10;
        if (e.key === 'ArrowLeft')  isDirecaoCorreta = rectItem.right <= rectAtual.left + 10;
        if (e.key === 'ArrowDown')  isDirecaoCorreta = rectItem.top >= rectAtual.bottom - 10;
        if (e.key === 'ArrowUp')    isDirecaoCorreta = rectItem.bottom <= rectAtual.top + 10;

        if (isDirecaoCorreta) {
            // Calcula a distância entre o item atual e o candidato
            const distancia = Math.sqrt(
                Math.pow(rectItem.left - rectAtual.left, 2) + 
                Math.pow(rectItem.top - rectAtual.top, 2)
            );
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                proximo = item;
            }
        }
    });

    if (proximo) {
        e.preventDefault();
        proximo.focus();
        proximo.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
});
document.addEventListener('DOMContentLoaded', carregarCatalogo);
