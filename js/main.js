// SISTEMA CINEMA LIMPO - APENAS DADOS DO JSON
let filmes = [];
let carregando = false;

// Limpar completamente antes de carregar
function limparCinema() {
    const container = document.getElementById('cinemaCategories');
    if (container) {
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'flex-start';
        container.style.flexWrap = 'wrap';
        container.style.gap = '20px';
        container.style.padding = '40px 20px';
    }
}

// Carregar exclusivamente do data/cinema.json
async function carregarCinema() {
    if (carregando) return;
    carregando = true;
    
    try {
        limparCinema();
        
        const response = await fetch('data/cinema.json');
        if (!response.ok) throw new Error('Falha ao carregar JSON');
        
        const data = await response.json();
        
        // Filtrar apenas filmes (type === 'movie')
        filmes = data.filmes ? data.filmes.filter(item => item.type === 'movie') : [];
        
        if (filmes.length === 0) {
            mostrarMensagem('A atualizar catálogo de Cinema...');
            return;
        }
        
        renderizarCinema();
        
    } catch (error) {
        console.error('Erro ao carregar cinema:', error);
        mostrarMensagem('A atualizar catálogo de Cinema...');
    } finally {
        carregando = false;
    }
}

// Renderizar cards com layout centralizado
function renderizarCinema() {
    const container = document.getElementById('cinemaCategories');
    if (!container) return;
    
    container.innerHTML = '';
    
    filmes.forEach(filme => {
        const card = document.createElement('div');
        card.className = 'cinema-card';
        card.style.cssText = `
            background: #141414;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            width: 200px;
            flex-shrink: 0;
        `;
        
        card.innerHTML = `
            <div style="aspect-ratio: 2/3; overflow: hidden;">
                <img src="${filme.poster || ''}" 
                     alt="${filme.titulo || ''}" 
                     style="width: 100%; height: 100%; object-fit: cover; display: block;"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzI0MjQyNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+U0VTSU08L3RleHQ+PC9zdmc+'">
            </div>
            <div style="padding: 12px; text-align: center;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="color: #b3b3b3; font-family: 'Helvetica', 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 400;">
                        ${filme.ano || ''}
                    </span>
                    <span style="color: #46d369; font-family: 'Helvetica', 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600;">
                        ${filme.avaliacao || filme.rating || 'N/A'}
                    </span>
                </div>
                <h3 style="color: #ffffff; font-family: 'Helvetica', 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 500; margin: 0; line-height: 1.3; text-align: center;">
                    ${filme.titulo || ''}
                </h3>
            </div>
        `;
        
        // Hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 8px 25px rgba(229, 9, 20, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            card.style.boxShadow = 'none';
        });
        
        container.appendChild(card);
    });
}

// Mostrar mensagem de carregamento
function mostrarMensagem(mensagem) {
    const container = document.getElementById('cinemaCategories');
    if (!container) return;
    
    container.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            width: 100%;
            color: #b3b3b3;
            font-family: 'Helvetica', 'Inter', Arial, sans-serif;
            font-size: 16px;
        ">
            ${mensagem}
        </div>
    `;
}

// Navegação - Página Cinema
function mostrarSecao(secaoId) {
    if (secaoId === 'cinema') {
        // Esconder outras seções
        document.getElementById('hero').style.display = 'none';
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        document.querySelector('header').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        
        // Mostrar página cinema
        document.getElementById('cinema-page').style.display = 'block';
        
        // Carregar cinema
        carregarCinema();
        
    } else {
        // Esconder cinema
        document.getElementById('cinema-page').style.display = 'none';
        
        // Mostrar outras seções
        document.getElementById('hero').style.display = 'flex';
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'block');
        document.querySelector('header').style.display = 'flex';
        document.querySelector('footer').style.display = 'block';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Sistema Cinema iniciado');
    
    // Configurar menu
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const secao = this.dataset.page;
            mostrarSecao(secao);
        });
    });
    
    // Botão voltar
    const backBtn = document.getElementById('backFromCinema');
    if (backBtn) {
        backBtn.addEventListener('click', () => mostrarSecao('home'));
    }
});
