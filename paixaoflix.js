const TMDB_CONFIG = {
    apiKey: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
    baseUrl: 'https://api.themoviedb.org/3',
    imgUrl: 'https://image.tmdb.org/t/p/w500',
    lang: 'pt-BR'
};

let player;

async function buscarNoTMDB(nome) {
    const url = `${TMDB_CONFIG.baseUrl}/search/movie?api_key=${TMDB_CONFIG.apiKey}&query=${encodeURIComponent(nome)}&language=${TMDB_CONFIG.lang}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results ? data.results[0] : null;
    } catch (e) { return null; }
}

function abrirDetalhes(info) {
    document.getElementById('det-title').innerText = info.title;
    document.getElementById('det-overview').innerText = info.overview || "Sinopse não disponível.";
    document.getElementById('det-rating').innerText = `⭐ ${info.vote_average.toFixed(1)}`;
    document.getElementById('det-year').innerText = info.release_date ? info.release_date.split('-')[0] : "2025";
    document.getElementById('det-poster').src = TMDB_CONFIG.imgUrl + info.poster_path;
    const backdropUrl = info.backdrop_path ? `https://image.tmdb.org/t/p/original${info.backdrop_path}` : '';
    document.getElementById('det-backdrop').style.backgroundImage = `url(${backdropUrl})`;
    document.getElementById('movie-details').style.display = 'block';
    setTimeout(() => document.getElementById('btn-play-now').focus(), 200);
}

function fecharDetalhes() {
    document.getElementById('movie-details').style.display = 'none';
    const card = document.querySelector('.movie-card');
    if (card) card.focus();
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
            card.innerHTML = `<img src="${TMDB_CONFIG.imgUrl + info.poster_path}">`;
            card.onclick = () => abrirDetalhes(info);
            container.appendChild(card);
        }
    }
    setTimeout(() => {
        const p = document.querySelector('.movie-card.focusable');
        if (p) p.focus();
    }, 1000);
}

function iniciarPlayer(videoUrl, posterUrl) {
    const container = document.getElementById('video-player');
    container.style.display = 'block';
    if (player) player.destroy();

    player = new Clappr.Player({
        source: videoUrl,
        poster: posterUrl,
        parentId: "#clappr-player",
        width: '100%', height: '100%',
        autoPlay: true,
        plugins: [LevelSelector],
        playback: { hlsjsConfig: { enableWorker: true } }
    });

    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    document.addEventListener('keydown', handlePlayerControls);
}

function fecharPlayer() {
    if (player) { player.destroy(); player = null; }
    document.getElementById('video-player').style.display = 'none';
    document.getElementById('live-channels-list').classList.remove('active');
    if (document.exitFullscreen) document.exitFullscreen();
}

async function carregarTvAoVivo() {
    const urlM3U = "/data/ativa_canais.m3u";
    const sidebar = document.getElementById('live-channels-list');
    const container = document.getElementById('channels-container');
    
    try {
        const resp = await fetch(urlM3U);
        const text = await resp.text();
        const canais = parseM3U(text);
        container.innerHTML = "";
        
        canais.forEach(canal => {
            const item = document.createElement('div');
            item.className = 'channel-item focusable';
            item.tabIndex = 0;
            item.innerHTML = `<img src="${canal.logo || ''}"><span>${canal.nome}</span>`;
            item.onclick = () => {
                iniciarPlayer(canal.url, "");
                sidebar.classList.remove('active');
            };
            container.appendChild(item);
        });

        document.getElementById('video-player').style.display = 'block';
        sidebar.classList.add('active');
        setTimeout(() => container.firstChild.focus(), 500);
    } catch (e) { console.error("Erro na lista", e); }
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

function handlePlayerControls(e) {
    if (!player) return;
    if (e.key === 'ArrowRight') player.seek(player.getCurrentTime() + 10);
    if (e.key === 'ArrowLeft') {
        const sidebar = document.getElementById('live-channels-list');
        if (sidebar.style.display !== 'none') {
             sidebar.classList.add('active');
             document.querySelector('.channel-item').focus();
        } else {
             player.seek(player.getCurrentTime() - 10);
        }
    }
}

// Navegação Geográfica
document.addEventListener('keydown', function(e) {
    const itens = Array.from(document.querySelectorAll('.focusable'));
    const atual = document.activeElement;
    if (e.key === 'Enter' && atual) { atual.click(); return; }
    
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

    if (proximo) { e.preventDefault(); proximo.focus(); proximo.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
});

document.addEventListener('DOMContentLoaded', carregarCatalogo);
