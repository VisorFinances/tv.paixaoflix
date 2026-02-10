const TMDB_CONFIG = {
    apiKey: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
    baseUrl: 'https://api.themoviedb.org/3',
    imgUrl: 'https://image.tmdb.org/t/p/w500',
    lang: 'pt-BR'
};

// 1. Busca no TMDB
async function buscarNoTMDB(nome) {
    const url = `${TMDB_CONFIG.baseUrl}/search/movie?api_key=${TMDB_CONFIG.apiKey}&query=${encodeURIComponent(nome)}&language=${TMDB_CONFIG.lang}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results ? data.results[0] : null;
    } catch (e) { return null; }
}

// 2. Página de Detalhes
function abrirDetalhes(info) {
    document.getElementById('det-title').innerText = info.title;
    document.getElementById('det-overview').innerText = info.overview || "Sinopse não disponível.";
    document.getElementById('det-rating').innerText = `⭐ ${info.vote_average.toFixed(1)}`;
    document.getElementById('det-year').innerText = info.release_date ? info.release_date.split('-')[0] : "2025";
    document.getElementById('det-poster').src = TMDB_CONFIG.imgUrl + info.poster_path;
    
    // USANDO 'original' para a imagem não ficar embaçada ou invisível
    const backdropUrl = info.backdrop_path ? `https://image.tmdb.org/t/p/original${info.backdrop_path}` : '';
    document.getElementById('det-backdrop').style.backgroundImage = `url(${backdropUrl})`;

    const pane = document.getElementById('movie-details');
    pane.style.display = 'block';
    
    setTimeout(() => {
        const playBtn = document.getElementById('btn-play-now');
        if (playBtn) playBtn.focus();
    }, 200);
}
function fecharDetalhes() {
    document.getElementById('movie-details').style.display = 'none';
    const primeiraCapa = document.querySelector('.movie-card');
    if (primeiraCapa) primeiraCapa.focus();
}

// 3. Carregar Catálogo
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
            
            // Evento de clique para mouse e gatilho para o Enter
            card.onclick = () => abrirDetalhes(info);
            
            container.appendChild(card);
        }
    }
    
    // Foco inicial
    setTimeout(() => {
        const primeiro = document.querySelector('.movie-card.focusable');
        if (primeiro) primeiro.focus();
    }, 1000);
}

// 4. Sistema de Navegação Geográfica
document.addEventListener('keydown', function(e) {
    const itens = Array.from(document.querySelectorAll('.focusable'));
    const atual = document.activeElement;
    
    if (e.key === 'Enter') {
        if (atual) atual.click();
        return;
    }

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

        let isDirecaoCorreta = false;
        if (e.key === 'ArrowRight') isDirecaoCorreta = rectItem.left >= rectAtual.right - 10;
        if (e.key === 'ArrowLeft')  isDirecaoCorreta = rectItem.right <= rectAtual.left + 10;
        if (e.key === 'ArrowDown')  isDirecaoCorreta = rectItem.top >= rectAtual.bottom - 10;
        if (e.key === 'ArrowUp')    isDirecaoCorreta = rectItem.bottom <= rectAtual.top + 10;

        if (isDirecaoCorreta) {
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

// Configuração do Player
let player;

function iniciarPlayer(videoUrl, posterUrl) {
    const playerContainer = document.getElementById('video-player');
    playerContainer.style.display = 'block';

    player = new Clappr.Player({
        source: videoUrl,
        poster: posterUrl,
        parentId: "#clappr-player",
        width: '100%',
        height: '100%',
        autoPlay: true,
        preload: 'auto',
        allowUserInteraction: true,
        chromecast: true,
        // Suporte a MKV/MP4 e Qualidade Adaptativa (HLS)
        plugins: [LevelSelector, ChromecastPlugin],
        levelSelectorConfig: {
            title: 'Qualidade',
            labels: {
                2: '720p',
                1: '480p',
                0: '360p',
            },
            labelCallback: function(level, label) {
                return label; // Automático por padrão
            }
        },
        playback: {
            playInline: true,
            recycleVideo: true,
            externalTracks: [
                // Aqui entrariam as legendas dinâmicas se houver
                {kind: 'subtitles', label: 'Português', src: 'legenda.vtt', srclang: 'pt'}
            ],
        }
    });

    // Forçar Fullscreen ao iniciar
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();

    // Mapeamento de Teclas para o Controle Remoto (Avançar/Voltar)
    document.addEventListener('keydown', handlePlayerControls);
    
    // Focar no botão de sair para facilitar
    setTimeout(() => document.getElementById('btn-close-player').focus(), 2000);
}

function handlePlayerControls(e) {
    if (!player) return;

    const tempoAtual = player.getCurrentTime();

    switch(e.key) {
        case 'ArrowRight': // Avançar 10s (padrão)
            player.seek(tempoAtual + 10);
            exibirFeedback("Avançar +10s");
            break;
        case 'ArrowLeft': // Voltar 10s
            player.seek(tempoAtual - 10);
            exibirFeedback("Voltar -10s");
            break;
        case 'f': // Tecla F para Picture-in-Picture (Mini Tela)
            const videoTag = document.querySelector('#clappr-player video');
            if (videoTag && document.pictureInPictureEnabled) {
                videoTag.requestPictureInPicture();
            }
            break;
        case 'Enter': // Play/Pause
            player.getPlaybackType() === 'live' ? null : (player.isPlaying() ? player.pause() : player.play());
            break;
    }
}

function fecharPlayer() {
    if (player) {
        player.destroy();
        player = null;
    }
    document.getElementById('video-player').style.display = 'none';
    if (document.exitFullscreen) document.exitFullscreen();
    document.removeEventListener('keydown', handlePlayerControls);
}

// Vincula o botão "Assistir" da página de detalhes
document.getElementById('btn-play-now').onclick = function() {
    const filmeNome = document.getElementById('det-title').innerText;
    const backdrop = document.getElementById('det-backdrop').style.backgroundImage.slice(5, -2);
    
    // Exemplo de URL - Aqui você integrará com sua lógica PaixãoFlix
    const urlTeste = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"; 
    iniciarPlayer(urlTeste, backdrop);
};

// Função para carregar a TV ao Vivo
function carregarTvAoVivo() {
    const urlM3U = "/data/ativa_canais.m3u";
    
    // Mostra o container do player
    document.getElementById('video-player').style.display = 'block';

    // No caso de TV ao Vivo, passamos a URL da lista para o player
    // Nota: O Clappr toca diretamente se for um link de stream. 
    // Se for uma lista de vários canais, ele pegará o primeiro ou precisará de um parser.
    iniciarPlayer(urlM3U, "https://raw.githubusercontent.com/VisorFinances/lista-paixaoflix/refs/heads/main/hero_bg.jpg");
    
    exibirFeedback("Carregando Canais ao Vivo...");
}

// Ajuste no iniciarPlayer para identificar se é Live (TV)
function iniciarPlayer(videoUrl, posterUrl) {
    const playerContainer = document.getElementById('video-player');
    playerContainer.style.display = 'block';

    // Destruir player anterior se existir
    if (player) player.destroy();

    player = new Clappr.Player({
        source: videoUrl,
        poster: posterUrl,
        parentId: "#clappr-player",
        width: '100%',
        height: '100%',
        autoPlay: true,
        preload: 'auto',
        // Configurações para TV ao Vivo (HLS)
        playback: {
            hlsjsConfig: {
                enableWorker: true,
            }
        },
        plugins: [LevelSelector, ChromecastPlugin],
        // Otimização para troca de qualidade automática (Internet do usuário)
        levelSelectorConfig: {
            title: 'Qualidade',
            labels: {
                2: 'Full HD',
                1: 'HD',
                0: 'SD',
            },
        },
    });

    // Força tela cheia
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
}
