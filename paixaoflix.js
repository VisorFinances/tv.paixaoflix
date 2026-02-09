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

// SISTEMA DE NAVEGAÇÃO PROFISSIONAL (ESTILO DISNEY+)
document.addEventListener('keydown', function(e) {
    const itens = Array.from(document.querySelectorAll('.focusable'));
    const atual = document.activeElement;
    const index = itens.indexOf(atual);

    let proximo;

    if (e.key === 'ArrowRight') {
        // Simples: vai para o próximo da lista
        proximo = itens[index + 1];
    } 
    else if (e.key === 'ArrowLeft') {
        // Simples: vai para o anterior da lista
        proximo = itens[index - 1];
    } 
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const rectAtual = atual.getBoundingClientRect();
        
        proximo = itens.find(el => {
            const rectEl = el.getBoundingClientRect();
            // Para Baixo: procura alguém que esteja abaixo do meu pé
            if (e.key === 'ArrowDown') {
                return rectEl.top >= rectAtual.bottom - 10 && Math.abs(rectEl.left - rectAtual.left) < 50;
            }
            // Para Cima: procura alguém que o fundo esteja acima da minha cabeça
            if (e.key === 'ArrowUp') {
                return rectEl.bottom <= rectAtual.top + 10 && Math.abs(rectEl.left - rectAtual.left) < 50;
            }
        });
    }

    if (proximo) {
        e.preventDefault();
        proximo.focus();
        
        // DICA DISNEY+: Faz a tela rolar suavemente para acompanhar o foco
        proximo.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
});
