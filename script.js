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
        // Conteúdo base vazio - apenas mídias do JSON externo
        const baseContent = [];
        
        streamingData.allContent = baseContent;
        
        // Carregar progresso salvo
        const savedProgress = JSON.parse(localStorage.getItem('streamflix-progress') || '[]');
        streamingData.continueWatching = savedProgress.slice(0, 5);
        
        // Carregar seções
        loadSections();
    }

    // Carregar seções
    function loadSections() {
        // Não Deixe de Ver (Lançamentos 2026) - vazio sem JSON
        streamingData.dontMiss = [];
        
        // Top 10 Brasileiro - vazio sem JSON
        streamingData.top10Brazil = [];
        
        // Kids - vazio sem JSON
        streamingData.kids = [];
        
        // Sábado à Noite - vazio sem JSON
        streamingData.saturdayNight = [];
        
        // Premiados - vazio sem JSON
        streamingData.awarded = [];
        
        // Maratona - vazio sem JSON
        streamingData.marathon = [];
        
        // Negritude - vazio sem JSON
        streamingData.blackCulture = [];
        
        // Nostalgia - vazio sem JSON
        streamingData.nostalgia = [];
        
        // Romance - vazio sem JSON
        streamingData.romance = [];
        
        // Nacionais - vazio sem JSON
        streamingData.national = [];
        
        // Novelas - vazio sem JSON
        streamingData.soapOperas = [];
        
        // Renderizar seções
        renderSections();
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
            
            // Scroll suave para a seção correspondente
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
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
