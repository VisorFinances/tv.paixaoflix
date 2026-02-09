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
    // Busca todos os itens que podem ser focados
    const itensFocaveis = document.querySelectorAll('.focusable');
    let index = Array.from(itensFocaveis).indexOf(document.activeElement);

    if (e.key === 'ArrowRight') {
        index = (index + 1 < itensFocaveis.length) ? index + 1 : index;
    } 
    else if (e.key === 'ArrowLeft') {
        index = (index - 1 >= 0) ? index - 1 : index;
    }
    // Para subir e descer entre as prateleiras
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // Lógica simplificada: procura o item mais próximo verticalmente
        const currentRect = document.activeElement.getBoundingClientRect();
        let closest = null;
        let minDistance = Infinity;

        itensFocaveis.forEach(item => {
            if (item === document.activeElement) return;
            const rect = item.getBoundingClientRect();
            
            // Verifica se está acima ou abaixo
            const isVertical = e.key === 'ArrowDown' ? rect.top > currentRect.bottom : rect.bottom < currentRect.top;
            
            if (isVertical) {
                const distance = Math.sqrt(Math.pow(rect.left - currentRect.left, 2) + Math.pow(rect.top - currentRect.top, 2));
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = item;
                }
            }
        });
        if (closest) closest.focus();
        return; // Sai da função para não usar o index de lateral
    }
    else if (e.key === 'Enter') {
        // Quando carregar no OK do comando
        document.activeElement.click();
    }

    // Aplica o foco no novo item
    if (itensFocaveis[index]) {
        itensFocaveis[index].focus();
    }
});
