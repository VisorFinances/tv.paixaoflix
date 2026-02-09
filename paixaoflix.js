// 1. CONFIGURAÇÃO (Onde está sua chave)
const TMDB_CONFIG = {
    apiKey: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
    baseUrl: 'https://api.themoviedb.org/3',
    imgUrl: 'https://image.tmdb.org/t/p/w500',
    lang: 'pt-BR'
};

// 2. O COMANDO DE BUSCAR (O cérebro)
async function buscarNoTMDB(nome, tipo = 'movie') {
    const url = `${TMDB_CONFIG.baseUrl}/search/${tipo}?api_key=${TMDB_CONFIG.apiKey}&query=${encodeURIComponent(nome)}&language=${TMDB_CONFIG.lang}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0]; // Retorna o primeiro filme encontrado
        }
    } catch (erro) {
        console.error("Erro na API:", erro);
    }
    return null;
}

// 3. O PASSO 3: COLOCAR NA TELA (A mágica)
// Esta função cria o HTML dentro das prateleiras do seu index.html
async function carregarCatalogo() {
    const filmesParaTestar = ['Batman', 'Superman', 'Avatar'];
    const container = document.getElementById('melhores-2025-row');

    for (let nome of filmesParaTestar) {
        const info = await buscarNoTMDB(nome);
        if (info) {
            const card = document.createElement('div');
            card.className = 'movie-card focusable'; 
            card.tabIndex = 0; // Isso é essencial para a seta funcionar!
            card.innerHTML = `
                <img src="${TMDB_CONFIG.imgUrl + info.poster_path}" alt="${info.title}">
                <div style="padding:10px; font-size:12px;">${info.title}</div>
            `;
            container.appendChild(card);
        }
    }

    // NOVO: Dá o foco inicial no primeiro card que aparecer
    const primeiroCard = document.querySelector('.focusable');
    if (primeiroCard) {
        primeiroCard.focus();
    }
}

// 4. INICIALIZAÇÃO
// Quando o site carregar, ele executa a função acima
document.addEventListener('DOMContentLoaded', carregarCatalogo);

// SISTEMA DE NAVEGAÇÃO POR SETAS (D-PAD)
document.addEventListener('keydown', function(e) {
    // 1. Pegar todos os elementos que podem ser focados
    const itens = Array.from(document.querySelectorAll('.focusable'));
    const atual = document.activeElement;
    let proximo;

    // 2. Lógica de Direção
    const index = itens.indexOf(atual);

    if (e.key === 'ArrowRight') {
        proximo = itens[index + 1];
    } else if (e.key === 'ArrowLeft') {
        proximo = itens[index - 1];
    } else if (e.key === 'ArrowDown') {
        // Pula para o item logo abaixo (baseado na posição na tela)
        proximo = itens.find(el => el.getBoundingClientRect().top > atual.getBoundingClientRect().bottom);
    } else if (e.key === 'ArrowUp') {
        // Pula para o item logo acima
        proximo = itens.reverse().find(el => el.getBoundingClientRect().bottom < atual.getBoundingClientRect().top);
        itens.reverse(); // Volta a lista ao normal
    }

    // 3. Executar o Foco
    if (proximo) {
        e.preventDefault(); // Impede a página de rolar sozinha
        proximo.focus();
    }
});
