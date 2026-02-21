// StreamFlix - Sistema Inteligente de Streaming

document.addEventListener('DOMContentLoaded', function() {
    
    // Base de dados completa
    const streamingData = {
        continueWatching: [],
        dontMiss: [],
        top10Brazil: [],
        kids: [],
        saturdayNight: [],
        awarded: [],
        marathon: [],
        blackCulture: [],
        nostalgia: [],
        romance: [],
        national: [],
        soapOperas: [],
        allContent: []
    };

    // Inicializar dados
    function initializeData() {
        // Conteúdo base
        const baseContent = [
            { id: 1, title: "Ação Explosiva", type: "Filme", year: 2024, category: ["acao"], image: "https://picsum.photos/300/450?random=1", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 2, title: "Romance Proibido", type: "Série", year: 2026, category: ["lancamento-2026", "romance"], image: "https://picsum.photos/300/450?random=2", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 3, title: "Terror Noturno", type: "Filme", year: 2023, category: ["terror"], image: "https://picsum.photos/300/450?random=3", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 4, title: "Comédia Leve", type: "Série", year: 2024, category: ["comedia"], image: "https://picsum.photos/300/450?random=4", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 5, title: "Drama Intenso", type: "Filme", year: 2024, category: ["drama"], image: "https://picsum.photos/300/450?random=5", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 6, title: "Kids Aventura", type: "Série", year: 2024, category: ["kids"], image: "https://picsum.photos/300/450?random=6", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 7, title: "Suspense Psicológico", type: "Filme", year: 2024, category: ["suspense"], image: "https://picsum.photos/300/450?random=7", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 8, title: "Família Unida", type: "Filme", year: 2024, category: ["familia"], image: "https://picsum.photos/300/450?random=8", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 9, title: "Religioso", type: "Filme", year: 2024, category: ["religioso"], image: "https://picsum.photos/300/450?random=9", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 10, title: "Musical", type: "Filme", year: 2024, category: ["musical"], image: "https://picsum.photos/300/450?random=10", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 11, title: "Dorama", type: "Série", year: 2024, category: ["dorama"], image: "https://picsum.photos/300/450?random=11", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 12, title: "Adulto", type: "Filme", year: 2024, category: ["adulto"], image: "https://picsum.photos/300/450?random=12", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 13, title: "Policial", type: "Série", year: 2024, category: ["policial"], image: "https://picsum.photos/300/450?random=13", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 14, title: "Anime", type: "Série", year: 2024, category: ["anime"], image: "https://picsum.photos/300/450?random=14", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 15, title: "Animação", type: "Filme", year: 2024, category: ["animacao"], image: "https://picsum.photos/300/450?random=15", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 16, title: "Nacional", type: "Filme", year: 2024, category: ["nacional"], image: "https://picsum.photos/300/450?random=16", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 17, title: "Ficção Científica", type: "Filme", year: 2024, category: ["ficcao"], image: "https://picsum.photos/300/450?random=17", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 18, title: "Clássico", type: "Filme", year: 1995, category: ["classicos"], image: "https://picsum.photos/300/450?random=18", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
            { id: 19, title: "Negritude", type: "Série", year: 2024, category: ["negritude"], image: "https://picsum.photos/300/450?random=19", stream: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { id: 20, title: "Novela", type: "Novela", year: 2024, category: ["novela"], image: "https://picsum.photos/300/450?random=20", stream: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" }
        ];

        streamingData.allContent = baseContent;
        
        // Carregar progresso salvo
        const savedProgress = JSON.parse(localStorage.getItem('streamflix-progress') || '[]');
        streamingData.continueWatching = savedProgress.slice(0, 5);
        
        // Carregar seções
        loadSections();
    }

    // Carregar seções
    function loadSections() {
        // Não Deixe de Ver (Lançamentos 2026)
        streamingData.dontMiss = streamingData.allContent.filter(item => 
            item.category.includes('lancamento-2026')
        );

        // Top 10 Brasileiro
        loadTop10Brazil();

        // Kids
        streamingData.kids = streamingData.allContent.filter(item => 
            item.category.includes('kids')
        );

        // Sábado à Noite
        loadSaturdayNight();

        // Premiados
        loadAwarded();

        // Maratona
        loadMarathon();

        // Negritude
        streamingData.blackCulture = streamingData.allContent.filter(item => 
            item.category.includes('negritude')
        );

        // Nostalgia
        streamingData.nostalgia = streamingData.allContent.filter(item => 
            item.category.includes('classicos')
        );

        // Romance
        streamingData.romance = streamingData.allContent.filter(item => 
            item.category.includes('romance')
        ).slice(0, 10);

        // Nacionais
        streamingData.national = streamingData.allContent.filter(item => 
            item.category.includes('nacional')
        );

        // Novelas
        streamingData.soapOperas = streamingData.allContent.filter(item => 
            item.category.includes('novela')
        );

        // Renderizar seções
        renderSections();
    }

    // Top 10 Brasileiro
    function loadTop10Brazil() {
        const top10Content = [
            { rank: 1, title: "Ação Explosiva", available: true },
            { rank: 2, title: "Romance Proibido", available: true },
            { rank: 3, title: "Terror Noturno", available: false },
            { rank: 4, title: "Comédia Leve", available: true },
            { rank: 5, title: "Drama Intenso", available: true },
            { rank: 6, title: "Kids Aventura", available: false },
            { rank: 7, title: "Suspense Psicológico", available: true },
            { rank: 8, title: "Família Unida", available: true },
            { rank: 9, title: "Religioso", available: false },
            { rank: 10, title: "Musical", available: true }
        ];

        streamingData.top10Brazil = top10Content.map(item => {
            const content = streamingData.allContent.find(c => c.title === item.title);
            return {
                ...content,
                rank: item.rank,
                comingSoon: !item.available
            };
        });

        // Atualizar a cada 7 minutos
        setInterval(() => {
            streamingData.top10Brazil.forEach(item => {
                if (item.comingSoon && Math.random() > 0.7) {
                    item.comingSoon = false;
                    renderTop10();
                }
            });
        }, 420000);
    }

    // Sábado à Noite
    function loadSaturdayNight() {
        const categories = ["comedia", "suspense", "terror", "drama", "familia", "religioso", "musical", "dorama", "adulto", "policial", "anime", "animacao", "nacional", "ficcao"];
        
        streamingData.saturdayNight = categories.map(cat => {
            const content = streamingData.allContent.find(item => item.category.includes(cat));
            return content || streamingData.allContent[Math.floor(Math.random() * streamingData.allContent.length)];
        });

        // Verificar horário
        checkSaturdaySchedule();
        setInterval(checkSaturdaySchedule, 60000);
    }

    function checkSaturdaySchedule() {
        const now = new Date();
        const day = now.getDay(); // 0 = Domingo, 6 = Sábado
        const hour = now.getHours();
        
        const section = document.getElementById('saturday-night');
        
        if (day === 6 && hour >= 16 && hour < 24) {
            // Sábado 16:59 - 23:59
            section.style.display = 'block';
        } else if (day === 0 && hour < 12) {
            // Domingo 00:00 - 11:59
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    }

    // Premiados
    function loadAwarded() {
        const awardedContent = [
            { title: "Ação Explosiva", award: "Oscar", year: 2024 },
            { title: "Drama Intenso", award: "Globo de Ouro", year: 2024 },
            { title: "Clássico", award: "Cannes", year: 1995 }
        ];

        streamingData.awarded = awardedContent.map(award => {
            const content = streamingData.allContent.find(c => c.title === award.title);
            return {
                ...content,
                award: award.award,
                awardYear: award.year
            };
        }).slice(0, 10);
    }

    // Maratona
    function loadMarathon() {
        const series = streamingData.allContent.filter(item => item.type === "Série");
        const kidsSeries = series.filter(item => item.category.includes('kids'));
        
        streamingData.marathon = [
            ...series.slice(0, 7),
            ...kidsSeries.slice(0, 3)
        ];
    }

    // Renderizar seções
    function renderSections() {
        renderContinueWatching();
        renderDontMiss();
        renderTop10();
        renderKids();
        renderSaturdayNight();
        renderAwarded();
        renderMarathon();
        renderBlackCulture();
        renderNostalgia();
        renderRomance();
        renderNational();
        renderSoapOperas();
    }

    // Render functions
    function renderContinueWatching() {
        const grid = document.getElementById('continueGrid');
        grid.innerHTML = '';
        
        streamingData.continueWatching.forEach(item => {
            const card = createContinueCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'continueWatching');
    }

    function renderDontMiss() {
        const grid = document.getElementById('dontMissGrid');
        grid.innerHTML = '';
        
        streamingData.dontMiss.forEach(item => {
            const card = createCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'dontMiss');
    }

    function renderTop10() {
        const grid = document.getElementById('top10Grid');
        grid.innerHTML = '';
        
        streamingData.top10Brazil.forEach(item => {
            const card = createTop10Card(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'top10Brazil');
    }

    function renderKids() {
        const grid = document.getElementById('kidsGrid');
        grid.innerHTML = '';
        
        streamingData.kids.forEach(item => {
            const card = createCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'kids');
    }

    function renderSaturdayNight() {
        const grid = document.getElementById('saturdayGrid');
        grid.innerHTML = '';
        
        streamingData.saturdayNight.forEach(item => {
            const card = createCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'saturdayNight');
    }

    function renderAwarded() {
        const grid = document.getElementById('awardedGrid');
        grid.innerHTML = '';
        
        streamingData.awarded.forEach(item => {
            const card = createAwardedCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'awarded');
    }

    function renderMarathon() {
        const grid = document.getElementById('marathonGrid');
        grid.innerHTML = '';
        
        streamingData.marathon.forEach(item => {
            const card = createCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'marathon');
    }

    function renderBlackCulture() {
        const section = document.getElementById('black-culture');
        const grid = document.getElementById('blackGrid');
        
        if (streamingData.blackCulture.length > 0) {
            section.style.display = 'block';
            grid.innerHTML = '';
            
            streamingData.blackCulture.forEach(item => {
                const card = createCard(item);
                grid.appendChild(card);
            });
            
            setupInfiniteScroll(grid, 'blackCulture');
        }
    }

    function renderNostalgia() {
        const grid = document.getElementById('nostalgiaGrid');
        grid.innerHTML = '';
        
        streamingData.nostalgia.forEach(item => {
            const card = createCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'nostalgia');
    }

    function renderRomance() {
        const grid = document.getElementById('romanceGrid');
        grid.innerHTML = '';
        
        streamingData.romance.forEach(item => {
            const card = createCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'romance');
    }

    function renderNational() {
        const grid = document.getElementById('nationalGrid');
        grid.innerHTML = '';
        
        streamingData.national.forEach(item => {
            const card = createCard(item);
            grid.appendChild(card);
        });
        
        setupInfiniteScroll(grid, 'national');
    }

    function renderSoapOperas() {
        const section = document.getElementById('soap-operas');
        const grid = document.getElementById('soapGrid');
        
        if (streamingData.soapOperas.length > 0) {
            section.style.display = 'block';
            grid.innerHTML = '';
            
            streamingData.soapOperas.forEach(item => {
                const card = createCard(item);
                grid.appendChild(card);
            });
            
            setupInfiniteScroll(grid, 'soapOperas');
        }
    }

    // Infinite Scroll System
    function setupInfiniteScroll(grid, sectionName) {
        let isLoading = false;
        let page = 1;
        const itemsPerPage = 10;
        
        grid.addEventListener('scroll', function() {
            const scrollLeft = grid.scrollLeft;
            const scrollWidth = grid.scrollWidth;
            const clientWidth = grid.clientWidth;
            
            // Check if scrolled to near the end (within 100px)
            if (scrollLeft + clientWidth >= scrollWidth - 100 && !isLoading) {
                loadMoreContent(grid, sectionName, page, itemsPerPage);
            }
        });
    }
    
    function loadMoreContent(grid, sectionName, currentPage, itemsPerPage) {
        const sectionData = streamingData[sectionName];
        if (!sectionData || sectionData.length === 0) return;
        
        // Show loading indicator
        const loadingCard = document.createElement('div');
        loadingCard.className = 'card loading-card';
        loadingCard.innerHTML = '<div class="loading-spinner">Carregando...</div>';
        grid.appendChild(loadingCard);
        
        // Simulate loading delay
        setTimeout(() => {
            // Remove loading indicator
            loadingCard.remove();
            
            // Generate more content (duplicate existing content for demo)
            const startIndex = (currentPage * itemsPerPage) % sectionData.length;
            const endIndex = Math.min(startIndex + itemsPerPage, sectionData.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = sectionData[i];
                let card;
                
                if (sectionName === 'continueWatching') {
                    card = createContinueCard(item);
                } else if (sectionName === 'top10Brazil') {
                    card = createTop10Card(item);
                } else if (sectionName === 'awarded') {
                    card = createAwardedCard(item);
                } else {
                    card = createCard(item);
                }
                
                grid.appendChild(card);
            }
            
            // Add fade-in animation to new cards
            const newCards = grid.querySelectorAll('.card:nth-last-child(-n+' + itemsPerPage + ')');
            newCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0)';
                }, index * 50);
            });
            
        }, 1000);
    }

    // Card creation functions
    function createCard(item) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="card-overlay">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-info">${item.type} • ${item.year}</p>
            </div>
        `;
        
        card.addEventListener('click', () => showContentModal(item));
        return card;
    }

    function createContinueCard(item) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${item.progress}%"></div>
            </div>
            <div class="card-overlay">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-info">${item.progress}% assistido</p>
            </div>
        `;
        
        card.addEventListener('click', () => showContinueModal(item));
        return card;
    }

    function createTop10Card(item) {
        const card = document.createElement('div');
        card.className = 'top10-item';
        card.innerHTML = `
            <div class="top10-rank">${item.rank}</div>
            <div class="top10-content">
                <img src="${item.image}" alt="${item.title}">
                <div class="top10-info">
                    <h3>${item.title}</h3>
                    <p>${item.type} • ${item.year}</p>
                </div>
                ${item.comingSoon ? '<div class="coming-soon">Em Breve</div>' : ''}
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (!item.comingSoon) {
                showContentModal(item);
            }
        });
        return card;
    }

    function createAwardedCard(item) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="award-badge">${item.award}</div>
            <img src="${item.image}" alt="${item.title}">
            <div class="award-info">${item.award} ${item.awardYear}</div>
            <div class="card-overlay">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-info">${item.type} • ${item.year}</p>
            </div>
        `;
        
        card.addEventListener('click', () => showContentModal(item));
        return card;
    }

    // Modal functions
    let currentPlayer = null;
    let currentContinueItem = null;

    function showContentModal(item) {
        const modal = document.getElementById('contentModal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${item.image}" alt="${item.title}" style="width: 200px; height: 300px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h2>${item.title}</h2>
                    <p style="color: #ccc;">${item.type} • ${item.year}</p>
                    <p style="margin: 20px 0;">Descrição do conteúdo selecionado.</p>
                    <button class="btn-primary" onclick="playVideo('${item.title}', '${item.stream}')">▶ Assistir Agora</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    function showContinueModal(item) {
        currentContinueItem = item;
        const modal = document.getElementById('continueModal');
        const title = document.getElementById('continueTitle');
        
        title.textContent = item.title;
        modal.style.display = 'flex';
    }

    window.resumeWatching = function() {
        if (currentContinueItem) {
            playVideo(currentContinueItem.title, currentContinueItem.stream);
            closeContinueModal();
        }
    };

    window.restartWatching = function() {
        if (currentContinueItem) {
            currentContinueItem.progress = 0;
            saveProgress();
            playVideo(currentContinueItem.title, currentContinueItem.stream);
            closeContinueModal();
        }
    };

    window.closeContinueModal = function() {
        document.getElementById('continueModal').style.display = 'none';
        currentContinueItem = null;
    };

    window.closeContentModal = function() {
        document.getElementById('contentModal').style.display = 'none';
    };

    // Player functions
    window.playVideo = function(title, stream) {
        closeContentModal();
        const modal = document.getElementById('playerModal');
        const container = document.getElementById('playerContainer');
        
        modal.style.display = 'flex';
        
        if (currentPlayer) {
            currentPlayer.destroy();
        }
        
        currentPlayer = new Clappr.Player({
            source: stream,
            parentId: '#playerContainer',
            width: '100%',
            height: '100%',
            autoPlay: true
        });
        
        // Simular progresso
        simulateProgress(title);
    };

    window.closePlayer = function() {
        if (currentPlayer) {
            currentPlayer.destroy();
            currentPlayer = null;
        }
        document.getElementById('playerModal').style.display = 'none';
    };

    // Progress functions
    function simulateProgress(title) {
        const item = streamingData.continueWatching.find(item => item.title === title);
        if (item) {
            const interval = setInterval(() => {
                if (item.progress < 95) {
                    item.progress += 1;
                    saveProgress();
                    renderContinueWatching();
                } else {
                    clearInterval(interval);
                }
            }, 5000);
        } else {
            const newItem = {
                title: title,
                progress: 0,
                image: `https://picsum.photos/300/450?random=${Date.now()}`
            };
            streamingData.continueWatching.unshift(newItem);
            if (streamingData.continueWatching.length > 5) {
                streamingData.continueWatching.pop();
            }
            saveProgress();
        }
    }

    function saveProgress() {
        localStorage.setItem('streamflix-progress', JSON.stringify(streamingData.continueWatching));
    }

    // Other functions
    window.playFeatured = function() {
        playVideo('Ação Explosiva', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    };

    window.showPlans = function() {
        alert('Planos de assinatura em breve!');
    };

    // Navigation
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Search
    document.getElementById('searchBtn').addEventListener('click', function() {
        const query = prompt('Buscar conteúdo:');
        if (query) {
            const results = streamingData.allContent.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase())
            );
            if (results.length > 0) {
                showContentModal(results[0]);
            } else {
                alert('Nenhum resultado encontrado');
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePlayer();
            closeContentModal();
            closeContinueModal();
        }
    });

    // Header scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(0,0,0,0.95)';
        } else {
            header.style.background = 'rgba(0,0,0,0.9)';
        }
    });

    // Procurar novelas a cada 11 minutos
    setInterval(() => {
        const soapSection = document.getElementById('soap-operas');
        if (streamingData.soapOperas.length > 0 && soapSection.style.display === 'none') {
            renderSoapOperas();
        }
    }, 660000);

    // Initialize
    initializeData();
    console.log('✅ StreamFlix Inteligente iniciado!');
});
