const TMDB_CONFIG = {
    apiKey: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
    baseUrl: 'https://api.themoviedb.org/3',
    imgUrl: 'https://image.tmdb.org/t/p/w500',
    lang: 'pt-BR'
};

let player;
let dadosFilmes = [];

// Lista Exata solicitada
const CATEGORIAS_OFICIAIS = [
    "Lançamento 2026", "Lançamento 2025", "Ação", "Aventura", "Comédia", 
    "Drama", "Nacional", "Romance", "Religioso", "Ficção", "Anime", 
    "Animação", "Clássicos", "Dorama", "Suspense", "Policial", 
    "Crime", "Terror", "Documentários", "Faroeste", "Musical", "Adulto"
];

// --- 1. CARREGAMENTO DE DADOS ---

async function carregarFilmes() {
    try {
        const resp = await fetch('/data/filmes.json');
        dadosFilmes = await resp.json();
        renderizarCategorias('movie');
    } catch (e) {
        console.error("Erro ao carregar filmes.json", e);
    }
}

function renderizarCategorias(tipo) {
    document.getElementById('hero').style.display = 'none';
    const page = document.getElementById('categories-page');
    const container = document.getElementById('dynamic-rows') || document.getElementById('categories-container');
    
    page.style.display = 'block';
    container.innerHTML = "";

    CATEGORIAS_OFICIAIS.forEach(cat => {
        // Filtra conteúdo: permite que o mesmo filme esteja em várias categorias
        const filtrados = dadosFilmes.filter(f => {
            const matchTipo = f.type === tipo;
            const generoArray = Array.isArray(f.genero) ? f.genero : [f.genero];
            const matchCat = generoArray.includes(cat) || 
                           (f.year === "2026" && cat === "Lançamento 2026") ||
                           (f.year === "2025" && cat === "Lançamento 2025");
            return matchTipo && matchCat;
        });

        if (filtrados.length > 0) {
            const rowWrapper = document.createElement('div');
            rowWrapper.className = 'content-section';
            rowWrapper.style.paddingLeft = "100px";
            rowWrapper.innerHTML = `
                <h2 class="category-title" style="margin: 20px 0 10px 0; color: #888;">${cat}</h2>
                <div class="movie-row" id="row-${cat.replace(/\s+/g, '-')}"></div>
            `;
            container.appendChild(rowWrapper);
            
            const rowContent = rowWrapper.querySelector('.movie-row');
            filtrados.forEach(f => {
                const card = document.createElement('div');
                card.className = "movie-card focusable";
                card.tabIndex = 0;
                card.innerHTML = `<img src="${f.poster}">`;
                card.onclick = () => abrirDetalhes(f);
                rowContent.appendChild(card);
            });
        }
    });

    setTimeout(() => {
        const primeiro = page.querySelector('.focusable');
        if (primeiro) primeiro.focus();
    }, 300);
}

// --- 2. DETALHES E TRAILER ---

function abrirDetalhes(filme) {
    document.getElementById('det-title').innerText = filme.titulo;
    document.getElementById('det-desc').innerText = filme.desc || filme.overview || "Sinopse não disponível.";
    document.getElementById('det-poster').src = filme.poster;
    document.getElementById('movie-details').style.display = 'block';

    const btnTrailer = document.getElementById('btn-trailer');
    if (filme.trailer && filme.trailer.trim() !== "") {
        btnTrailer.style.display = "flex";
        btnTrailer.onclick = () => window.open(filme.trailer, '_blank');
    } else {
        btnTrailer.style.display = "none";
    }

    document.getElementById('btn-play-video').onclick = () => iniciarPlayer(filme.url);
    setTimeout(() => document.getElementById('btn-play-video').focus(), 200);
}

// --- 3. PLAYER E TV AO VIVO ---

function iniciarPlayer(url) {
    const container = document.getElementById('video-player');
    container.style.display = 'block';
    if (player) player.destroy();
    player = new Clappr.Player({
        source: url,
        parentId: "#clappr-player",
        width: '100%', height: '100%',
        autoPlay: true
    });
}

async function carregarTvAoVivo() {
    const sidebar = document.getElementById('live-channels-list');
    const container = document.getElementById('channels-container');
    try {
        const resp = await fetch('/data/ativa_canais.m3u');
        const text = await resp.text();
        const canais = parseM3U(text);
        
        container.innerHTML = "";
        canais.forEach(canal => {
            const item = document.createElement('div');
            item.className = "channel-item focusable";
            item.tabIndex = 0;
            item.innerHTML = `<img src="${canal.logo || ''}" style="width:40px"><span>${canal.nome}</span>`;
            item.onclick = () => {
                iniciarPlayer(canal.url);
                sidebar.classList.remove('active');
            };
            container.appendChild(item);
        });

        document.getElementById('video-player').style.display = 'block';
        sidebar.classList.add('active');
        setTimeout(() => {
            const first = container.querySelector('.channel-item');
            if (first) first.focus();
        }, 300);
    } catch (e) { console.error("Erro M3U", e); }
}

function parseM3U(texto) {
    const linhas = texto.split('\n');
    const canais = [];
    let atual = {};
    linhas.forEach(l => {
        if (l.startsWith('#EXTINF:')) {
            atual.nome = l.split(',').pop().trim();
            const m = l.match(/tvg-logo="([^"]+)"/);
            atual.logo = m ? m[1] : '';
        } else if (l.startsWith('http')) {
            atual.url = l.trim();
            canais.push(atual);
            atual = {};
        }
    });
    return canais;
}

// --- 4. SISTEMA DE NAVEGAÇÃO E REGRAS DE SETAS ---

document.addEventListener('keydown', (e) => {
    const sidebar = document.getElementById('live-channels-list');
    const playerAberto = document.getElementById('video-player').style.display === 'block';

    // Regras de negócio do Player e Barra de Canais
    if (playerAberto) {
        if (e.key === 'ArrowLeft' && !sidebar.classList.contains('active')) {
            e.preventDefault();
            sidebar.classList.add('active');
            setTimeout(() => sidebar.querySelector('.channel-item').focus(), 100);
            return;
        }
        if (e.key === 'ArrowRight' && sidebar.classList.contains('active')) {
            e.preventDefault();
            sidebar.classList.remove('active');
            document.getElementById('btn-close-player').focus();
            return;
        }
    }

    // Navegação Geográfica Geral
    const itens = Array.from(document.querySelectorAll('.focusable'));
    const atual = document.activeElement;
    if (e.key === 'Enter' && atual) { atual.click(); return; }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const rectAtual = atual.getBoundingClientRect();
        let proximo = null;
        let menorD = Infinity;

        itens.forEach(item => {
            if (item === atual) return;
            const r = item.getBoundingClientRect();
            let ok = false;
            if (e.key === 'ArrowRight') ok = r.left >= rectAtual.right - 10;
            if (e.key === 'ArrowLeft')  ok = r.right <= rectAtual.left + 10;
            if (e.key === 'ArrowDown')  ok = r.top >= rectAtual.bottom - 10;
            if (e.key === 'ArrowUp')    ok = r.bottom <= rectAtual.top + 10;

            if (ok) {
                const d = Math.sqrt(Math.pow(r.left - rectAtual.left, 2) + Math.pow(r.top - rectAtual.top, 2));
                if (d < menorD) { menorD = d; proximo = item; }
            }
        });

        if (proximo) {
            e.preventDefault();
            proximo.focus();
            proximo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

function fecharDetalhes() { document.getElementById('movie-details').style.display = 'none'; }
function fecharPlayer() { 
    if(player) player.destroy(); 
    document.getElementById('video-player').style.display = 'none'; 
    document.getElementById('live-channels-list').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a Home ou carregar algo padrão
});
