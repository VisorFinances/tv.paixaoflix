// CONFIGURAÇÃO CENTRAL DE FONTES - PAIXÃOFLIX
const PaixaoConfig = {
  // Se você mudar o nome do usuário ou repositório, mude apenas aqui:
  username: "VisorFinances",
  repo: "tv.paixaoflix",
  branch: "main",
  
  // Função que gera o link RAW automaticamente
  getRawBase() {
    return `https://raw.githubusercontent.com/${this.username}/${this.repo}/${this.branch}/data/`;
  }
};

// CONFIGURAÇÕES GLOBAIS
const APP_NAME = "PaixãoFlix";
const GITHUB_BASE_URL = PaixaoConfig.getRawBase();
const ARCHIVE_BASE_URL = 'https://archive.org/download/';
const TMDB_API_KEY = 'b275ce8e1a6b3d5d879bb0907e4f56ad';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// ORDEM EXATA DAS CATEGORIAS
const CATEGORIES_ORDER = [
  'Lançamento 2026',
  '2025',
  'Ação',
  'Aventura',
  'Anime',
  'Animação',
  'Comédia',
  'Drama',
  'Dorama',
  'Clássicos',
  'Crime',
  'Policial',
  'Família',
  'Musical',
  'Documentário',
  'Faroeste',
  'Ficção',
  'Nacional',
  'Religioso',
  'Romance',
  'Terror',
  'Suspense',
  'Adulto'
];

// ESTADOS GLOBAIS
let currentFocus = null;
let isTransitioning = false;

// 1. BLOQUEIO DE BOTÃO DIREITO
document.addEventListener('contextmenu', event => event.preventDefault());

// 2. BLOQUEIO DE TECLAS DE INSPEÇÃO (DEVTOOLS)
document.addEventListener('keydown', function(e) {
    if (
        e.key === "F12" || 
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || 
        (e.ctrlKey && e.key === "U")
    ) {
        e.preventDefault();
        return false;
    }
});

// 3. AUTO-HIDE MOUSE CURSOR (EFEITO SMART TV)
let mouseTimer;
document.addEventListener('mousemove', () => {
    document.body.style.cursor = 'default';
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
        document.body.style.cursor = 'none';
    }, 3000); // 3 segundos para sumir
});

// 4. PREVENÇÃO DE DRAG (ARRASTAR IMAGENS E VÍDEOS)
document.addEventListener('dragstart', (e) => e.preventDefault());

// 5. NAVEGAÇÃO POR CONTROLO REMOTO / TECLADO (D-PAD)
document.addEventListener('keydown', (e) => {
    const currentFocus = document.activeElement;
    let nextFocus;

    switch(e.key) {
        case 'ArrowRight':
            nextFocus = currentFocus.nextElementSibling || currentFocus.parentElement.nextElementSibling?.firstElementChild;
            break;
        case 'ArrowLeft':
            nextFocus = currentFocus.previousElementSibling || currentFocus.parentElement.previousElementSibling?.lastElementChild;
            break;
        case 'ArrowDown':
            // Lógica para saltar para a prateleira de baixo
            const currentSection = currentFocus.closest('.movie-section');
            const nextSection = currentSection.nextElementSibling;
            if (nextSection) nextFocus = nextSection.querySelector('.focusable');
            break;
        case 'ArrowUp':
            // Lógica para saltar para a prateleira de cima ou menu
            const prevSection = currentFocus.closest('.movie-section')?.previousElementSibling;
            if (prevSection) nextFocus = prevSection.querySelector('.focusable');
            break;
        case 'Enter':
            currentFocus.click(); // Simula o toque/clique no botão focado
            break;
    }

    if (nextFocus && nextFocus.classList.contains('focusable')) {
        nextFocus.focus();
        nextFocus.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
});

// 6. LÓGICA DO CARROSSEL INFINITO (LOOP)
function setupInfiniteScroll(sectionId) {
    const track = document.querySelector(`#${sectionId} .carousel-track`);
    if (!track) return;
    
    const cards = Array.from(track.children);
    
    // Clonar os primeiros 5 itens e os últimos 5 para criar o efeito visual de loop
    const firstClones = cards.slice(0, 5).map(card => card.cloneNode(true));
    const lastClones = cards.slice(-5).map(card => card.cloneNode(true));
    
    firstClones.forEach(clone => track.appendChild(clone));
    lastClones.reverse().forEach(clone => track.insertBefore(clone, track.firstChild));
    
    let isTransitioning = false;
    
    track.addEventListener('scroll', () => {
        if (isTransitioning) return;
        
        // Se chegar ao fim (clones da direita), salta instantaneamente para o início real
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
            isTransitioning = true;
            track.scrollLeft = track.clientWidth; 
            isTransitioning = false;
        }
        
        // Se chegar ao início (clones da esquerda), salta instantaneamente para o fim real
        if (track.scrollLeft <= 0) {
            isTransitioning = true;
            track.scrollLeft = track.scrollWidth - (track.clientWidth * 2);
            isTransitioning = false;
        }
    });
}

// 7. PERSISTÊNCIA DE PROGRESSO (CONTINUAR ASSISTINDO)
function salvarProgresso(videoID, tempoAtual, total) {
    let progresso = JSON.parse(localStorage.getItem('paixaoflix_progress')) || [];
    
    // Remove se já existir para atualizar a posição
    progresso = progresso.filter(item => item.id !== videoID);
    
    // Calcula percentagem
    const percent = (tempoAtual / total) * 100;
    
    if (percent < 98) { // Se não terminou o filme (menos de 98%)
        progresso.unshift({ id: videoID, time: tempoAtual, p: percent });
        
        // Mantém apenas os 3 mais recentes
        if (progresso.length > 3) progresso.pop();
    } 
    // Se terminou (>= 98%), o item é removido da lista automaticamente
    
    localStorage.setItem('paixaoflix_progress', JSON.stringify(progresso));
}

// 8. FUNÇÕES DE CONTEÚDO
function playContent(item) {
    if (item.type === 'movie') {
        // Reproduz direto
        initPlayer(item.url);
    } else if (item.type === 'serie' || item.type === 'series') {
        // Direciona para a página de episódios usando o identificador
        const archiveID = item.identificador_archive;
        abrirPaginaEpisodios(archiveID, item.titulo);
    }
}

// 9. LIMPEZA DE GÊNEROS (para as prateleiras da Home)
function cleanGenres(genreData) {
    if (Array.isArray(genreData)) return genreData.map(g => g.replace('[', '').trim());
    if (typeof genreData === 'string') return genreData.replace('[', '').split(',').map(g => g.trim());
    return [];
}

// 10. BUSCAR METADADOS DO TMDB
async function getTMDBData(title, type = 'movie') {
    try {
        const searchType = type === 'series' ? 'tv' : 'movie';
        const searchResponse = await fetch(`${TMDB_BASE_URL}/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=pt-BR`);
        const searchData = await searchResponse.json();
        
        if (searchData.results && searchData.results.length > 0) {
            const result = searchData.results[0];
            
            // Buscar detalhes completos
            const detailsResponse = await fetch(`${TMDB_BASE_URL}/${searchType}/${result.id}?api_key=${TMDB_API_KEY}&language=pt-BR`);
            const details = await detailsResponse.json();
            
            // Buscar trailer
            const videosResponse = await fetch(`${TMDB_BASE_URL}/${searchType}/${result.id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`);
            const videos = await videosResponse.json();
            
            const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            
            return {
                ...details,
                trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
                poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
                backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null
            };
        }
    } catch (error) {
        console.error('Erro ao buscar dados do TMDB:', error);
    }
    return null;
}

// 11. BUSCAR EPISÓDIOS DO ARCHIVE
async function getArchiveEpisodes(archiveID) {
    try {
        const metadataResponse = await fetch(`https://archive.org/metadata/${archiveID}`);
        const metadata = await metadataResponse.json();
        
        if (metadata.files) {
            // Filtrar apenas arquivos de vídeo
            const videoFiles = Object.entries(metadata.files)
                .filter(([key, file]) => 
                    file.name.match(/\.(mp4|mkv|m3u8)$/i) && 
                    !file.name.includes('thumbnail')
                )
                .map(([key, file]) => ({
                    name: file.name,
                    title: extractEpisodeTitle(file.name),
                    episode: extractEpisodeNumber(file.name),
                    url: `${ARCHIVE_BASE_URL}${archiveID}/${file.name}`,
                    size: file.size
                }))
                .sort((a, b) => a.episode - b.episode);
            
            return videoFiles;
        }
    } catch (error) {
        console.error('Erro ao buscar episódios do Archive:', error);
    }
    return [];
}

// 12. FUNÇÕES AUXILIARES
function extractEpisodeTitle(filename) {
    // Remover extensão e identificador
    const cleanName = filename.replace(/\.(mp4|mkv|m3u8)$/i, '');
    
    // Se tiver padrão S01E01, extrair
    const match = cleanName.match(/S\d{2}E\d{2}(.*)/i);
    if (match) {
        return match[1].trim() || `Episódio ${extractEpisodeNumber(filename)}`;
    }
    
    // Se só tiver número, usar padrão
    const numberMatch = cleanName.match(/(\d+)/);
    if (numberMatch) {
        return `Episódio ${numberMatch[1]}`;
    }
    
    return cleanName;
}

function extractEpisodeNumber(filename) {
    const match = filename.match(/E(\d+)/i);
    if (match) return parseInt(match[1]);
    
    const numberMatch = filename.match(/(\d+)/);
    if (numberMatch) return parseInt(numberMatch[1]);
    
    return 0;
}

// 13. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Configurar carrosseis infinitos
    document.querySelectorAll('.movie-section').forEach(section => {
        setupInfiniteScroll(section.id);
    });
    
    // Adicionar classe focusable aos elementos navegáveis
    document.querySelectorAll('.movie-card, .menu-tile, button').forEach(el => {
        el.classList.add('focusable');
        el.setAttribute('tabindex', '0');
    });
    
    // Adicionar evento de foco
    document.addEventListener('focus', (e) => {
        if (e.target.classList.contains('focusable')) {
            document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
            e.target.classList.add('focused');
        }
    }, true);
});

// Exportar para uso em outros módulos
window.PaixaoFlix = {
    PaixaoConfig,
    APP_NAME,
    setupInfiniteScroll,
    salvarProgresso,
    playContent,
    cleanGenres,
    getTMDBData,
    getArchiveEpisodes,
    CATEGORIES_ORDER
};
