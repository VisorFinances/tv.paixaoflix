// Variáveis globais
let filmesData = [];
let categoriasData = [];

// Carregar dados do JSON local
async function carregarDados() {
    try {
        console.log('Carregando JSON...');
        
        const response = await fetch('data/cinema.json');
        const data = await response.json();
        
        filmesData = data.filmes;
        categoriasData = data.categorias;
        
        console.log('Carregado:', filmesData.length, 'filmes,', categoriasData.length, 'categorias');
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Mostrar página de cinema
function mostrarPaginaCinema() {
    console.log('Carregando cinema...');
    
    const container = document.getElementById('cinemaCategories');
    if (!container) {
        console.error('Container não encontrado');
        return;
    }
    
    container.innerHTML = '';
    
    categoriasData.forEach(categoria => {
        const filmes = filmesData.filter(f => f.genero.includes(categoria.nome));
        
        if (filmes.length > 0) {
            const section = document.createElement('div');
            section.innerHTML = `
                <h2>${categoria.nome}</h2>
                <div class="category-grid">
                    ${filmes.map(f => `
                        <div class="movie-card">
                            <img src="${f.poster}" alt="${f.titulo}">
                            <h3>${f.titulo}</h3>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(section);
        }
    });
    
    console.log('Cinema carregado');
}

// Navegação
function mostrarSecao(secaoId) {
    if (secaoId === 'cinema') {
        document.getElementById('cinema-page').style.display = 'block';
        document.querySelector('header').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        mostrarPaginaCinema();
    } else {
        document.getElementById('cinema-page').style.display = 'none';
        document.querySelector('header').style.display = 'flex';
        document.querySelector('footer').style.display = 'block';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM pronto');
    carregarDados();
    
    // Configurar menu
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarSecao(this.dataset.page);
        });
    });
    
    // Botão voltar do cinema
    document.getElementById('backFromCinema').addEventListener('click', function() {
        mostrarSecao('home');
    });
});
