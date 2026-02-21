// StreamFlix - Sistema de Streaming Completo

document.addEventListener('DOMContentLoaded', function() {
    
    // Base de dados local
    const streamingData = {
        featured: [
            { id: 1, title: "Ação Explosiva", type: "Filme", rating: "4.8", year: "2024", image: "https://picsum.photos/300/450?random=1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 2, title: "Romance Proibido", type: "Série", rating: "4.6", year: "2024", image: "https://picsum.photos/300/450?random=2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 3, title: "Terror Noturno", type: "Filme", rating: "4.5", year: "2023", image: "https://picsum.photos/300/450?random=3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 4, title: "Comédia Leve", type: "Série", rating: "4.7", year: "2024", image: "https://picsum.photos/300/450?random=4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" }
        ],
        movies: [
            { id: 5, title: "Missão Impossível", type: "Filme", year: "2024", image: "https://picsum.photos/300/450?random=5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 6, title: "Velocidade Máxima", type: "Filme", year: "2023", image: "https://picsum.photos/300/450?random=6", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 7, title: "Herói em Ação", type: "Filme", year: "2024", image: "https://picsum.photos/300/450?random=7", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 8, title: "Batalha Final", type: "Filme", year: "2023", image: "https://picsum.photos/300/450?random=8", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 9, title: "Resgate Urgente", type: "Filme", year: "2024", image: "https://picsum.photos/300/450?random=9", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 10, title: "Aventura Perdida", type: "Filme", year: "2023", image: "https://picsum.photos/300/450?random=10", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" }
        ],
        series: [
            { id: 11, title: "Drama Intenso", type: "Série", year: "2024", image: "https://picsum.photos/300/450?random=11", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 12, title: "Comédia Romântica", type: "Série", year: "2023", image: "https://picsum.photos/300/450?random=12", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 13, title: "Suspense Psicológico", type: "Série", year: "2024", image: "https://picsum.photos/300/450?random=13", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 14, title: "Ficção Científica", type: "Série", year: "2023", image: "https://picsum.photos/300/450?random=14", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 15, title: "Mistério Policial", type: "Série", year: "2024", image: "https://picsum.photos/300/450?random=15", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 16, title: "Aventura Épica", type: "Série", year: "2023", image: "https://picsum.photos/300/450?random=16", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" }
        ],
        live: [
            { id: 17, title: "Canal de Notícias", type: "Ao Vivo", image: "https://picsum.photos/300/450?random=17", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", live: true },
            { id: 18, title: "Esportes ao Vivo", type: "Ao Vivo", image: "https://picsum.photos/300/450?random=18", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8", live: true },
            { id: 19, title: "Variedades", type: "Ao Vivo", image: "https://picsum.photos/300/450?random=19", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", live: true },
            { id: 20, title: "Documentários", type: "Ao Vivo", image: "https://picsum.photos/300/450?random=20", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8", live: true }
        ]
    };

    let currentPlayer = null;
    const watchlist = JSON.parse(localStorage.getItem('streamflix-watchlist') || '[]');

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(0,0,0,0.95)';
        } else {
            header.style.background = 'rgba(0,0,0,0.9)';
        }
    });

    // Navigation
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Create cards
    function createCard(item, type = 'default') {
        const card = document.createElement('div');
        card.className = 'card';
        
        let cardHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="card-overlay">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-info">${item.type} ${item.year ? '• ' + item.year : ''} ${item.rating ? '• ⭐ ' + item.rating : ''}</p>
        `;
        
        if (item.live) {
            cardHTML += `<span class="live-badge">🔴 AO VIVO</span>`;
        }
        
        cardHTML += `</div>`;
        card.innerHTML = cardHTML;
        
        card.addEventListener('click', function() {
            showContentModal(item);
        });
        
        return card;
    }

    // Load content sections
    function loadContent() {
        console.log('🔄 Carregando conteúdo...');
        
        // Featured
        const featuredGrid = document.getElementById('featuredGrid');
        streamingData.featured.forEach(item => {
            featuredGrid.appendChild(createCard(item, 'featured'));
        });
        
        // Movies
        const moviesGrid = document.getElementById('moviesGrid');
        streamingData.movies.forEach(item => {
            moviesGrid.appendChild(createCard(item, 'movie'));
        });
        
        // Series
        const seriesGrid = document.getElementById('seriesGrid');
        streamingData.series.forEach(item => {
            seriesGrid.appendChild(createCard(item, 'series'));
        });
        
        // Live TV
        const liveGrid = document.getElementById('liveGrid');
        streamingData.live.forEach(item => {
            liveGrid.appendChild(createCard(item, 'live'));
        });
        
        console.log('✅ Conteúdo carregado com sucesso!');
    }

    // Content Modal
    function showContentModal(item) {
        const modal = document.getElementById('contentModal');
        const modalContent = document.getElementById('modalContent');
        
        const isInWatchlist = watchlist.includes(item.title);
        
        modalContent.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${item.image}" alt="${item.title}" style="width: 200px; height: 300px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h2 style="margin-bottom: 15px;">${item.title}</h2>
                    <p style="color: #ccc; margin-bottom: 10px;">${item.type} ${item.year ? '• ' + item.year : ''}</p>
                    <p style="color: #ccc; margin-bottom: 20px;">${item.rating ? '⭐ ' + item.rating : ''}</p>
                    <p style="margin-bottom: 30px;">Esta é uma descrição detalhada do conteúdo selecionado. Aproveite a melhor experiência de streaming com qualidade superior.</p>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <button class="btn-primary" onclick="playVideo('${item.title}', '${item.stream}')">▶ Assistir Agora</button>
                        <button class="btn-secondary" onclick="toggleWatchlist('${item.title}')">${isInWatchlist ? '✓ Na Lista' : '+ Minha Lista'}</button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    window.closeContentModal = function() {
        document.getElementById('contentModal').style.display = 'none';
    };

    // Player Modal
    window.playVideo = function(title, stream) {
        closeContentModal();
        const modal = document.getElementById('playerModal');
        const container = document.getElementById('playerContainer');
        
        modal.style.display = 'flex';
        
        // Destroy existing player
        if (currentPlayer) {
            currentPlayer.destroy();
        }
        
        // Create new player
        currentPlayer = new Clappr.Player({
            source: stream,
            parentId: '#playerContainer',
            width: '100%',
            height: '100%',
            autoPlay: true
        });
        
        console.log(`🎬 Reproduzindo: ${title}`);
    };

    window.closePlayer = function() {
        if (currentPlayer) {
            currentPlayer.destroy();
            currentPlayer = null;
        }
        document.getElementById('playerModal').style.display = 'none';
    };

    // Watchlist
    window.toggleWatchlist = function(title) {
        const index = watchlist.indexOf(title);
        if (index > -1) {
            watchlist.splice(index, 1);
            showNotification('Removido da sua lista');
        } else {
            watchlist.push(title);
            showNotification('Adicionado à sua lista');
        }
        localStorage.setItem('streamflix-watchlist', JSON.stringify(watchlist));
        
        // Update modal if open
        const modal = document.getElementById('contentModal');
        if (modal.style.display === 'flex') {
            const modalContent = document.getElementById('modalContent');
            const button = modalContent.querySelector('button[onclick*="toggleWatchlist"]');
            if (button) {
                button.textContent = watchlist.includes(title) ? '✓ Na Lista' : '+ Minha Lista';
            }
        }
    };

    // Featured content play
    window.playFeatured = function() {
        playVideo('Ação Explosiva', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    };

    // Plans modal
    window.showPlans = function() {
        const modal = document.getElementById('contentModal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <h2>Planos StreamFlix</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
                <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>Básico</h3>
                    <p style="font-size: 24px; margin: 20px 0;">R$ 19,90/mês</p>
                    <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
                        <li>✓ 1 tela simultânea</li>
                        <li>✓ HD 720p</li>
                        <li>✓ Catálogo completo</li>
                    </ul>
                    <button class="btn-secondary">Assinar</button>
                </div>
                <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #ff2e2e;">
                    <h3>Premium</h3>
                    <p style="font-size: 24px; margin: 20px 0;">R$ 29,90/mês</p>
                    <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
                        <li>✓ 4 telas simultâneas</li>
                        <li>✓ Full HD 1080p</li>
                        <li>✓ Catálogo completo</li>
                        <li>✓ Downloads offline</li>
                    </ul>
                    <button class="btn-primary">Assinar</button>
                </div>
                <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>Family</h3>
                    <p style="font-size: 24px; margin: 20px 0;">R$ 39,90/mês</p>
                    <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
                        <li>✓ 6 telas simultâneas</li>
                        <li>✓ 4K Ultra HD</li>
                        <li>✓ Catálogo completo</li>
                        <li>✓ Downloads offline</li>
                        <li>✓ Perfis individuais</li>
                    </ul>
                    <button class="btn-secondary">Assinar</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    };

    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = prompt('Buscar conteúdo:');
            if (query) {
                performSearch(query);
            }
        });
    }

    function performSearch(query) {
        const allContent = [
            ...streamingData.featured,
            ...streamingData.movies,
            ...streamingData.series,
            ...streamingData.live
        ];
        
        const results = allContent.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        
        if (results.length > 0) {
            showContentModal(results[0]);
        } else {
            showNotification('Nenhum resultado encontrado');
        }
    }

    // Notification system
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #ff2e2e;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeContentModal();
            closePlayer();
        }
    });

    // Initialize
    loadContent();
    console.log('✅ StreamFlix iniciado com sucesso!');
});
