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
    let index = itens.indexOf(atual);

    if (index === -1) {
        if (itens[0]) itens[0].focus();
        return;
    }

    let proximo;

    if (e.key === 'ArrowRight') proximo = itens[index + 1];
    if (e.key === 'ArrowLeft') proximo = itens[index - 1];
    
    // Navegação Vertical (pular de linha)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const rectAtual = atual.getBoundingClientRect();
        proximo = itens.find(el => {
            const rectEl = el.getBoundingClientRect();
            return e.key === 'ArrowDown' ? rectEl.top > rectAtual.bottom : rectEl.bottom < rectAtual.top;
        });
    }

    if (proximo) {
        e.preventDefault(); // Mata o scroll da página
        proximo.focus();
        proximo.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
});

document.addEventListener('DOMContentLoaded', carregarCatalogo);
