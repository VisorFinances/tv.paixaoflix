// PaixãoFlix - Sistema de Streaming
class PaixaoFlix {
    constructor() {
        this.cinemaData = [];
        this.seriesData = [];
        this.kidsData = [];
        this.seriesKidsData = [];
        this.canaisAoVivo = [];
        this.favoritos = [];
        this.assistindo = [];
        this.player = null;
        this.currentMedia = null;
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderHome();
        
        // Inicializar sistema de atualização automática do GitHub
        this.setupAutoGitHubUpdate();
    }

    // Carregar dados EXCLUSIVAMENTE dos arquivos especificados
    async loadData() {
        try {
            // Cinema - Ler EXCLUSIVAMENTE de data/cinema.json
            const cinemaResponse = await fetch('data/cinema.json');
            this.cinemaData = await cinemaResponse.json();
            
            // Séries
            const seriesResponse = await fetch('data/séries.json');
            this.seriesData = await seriesResponse.json();
            
            // Kids
            const kidsResponse = await fetch('data/filmeskids.json');
            this.kidsData = await kidsResponse.json();
            
            // Séries Kids
            const seriesKidsResponse = await fetch('data/sérieskids.json');
            this.seriesKidsData = await seriesKidsResponse.json();
            
            // Canais ao Vivo - Ler EXCLUSIVAMENTE de data/canaisaovivo.m3u8
            await this.loadM3U8Data();
            
            // Favoritos
            const favoritosResponse = await fetch('data/favoritos.json');
            this.favoritos = await favoritosResponse.json();
            
            // Carregar dados do localStorage
            this.loadLocalStorageData();
            
            console.log('Dados carregados com sucesso!');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    // Parser para extrair dados do M3U8
    async loadM3U8Data() {
        try {
            const response = await fetch('data/canaisaovivo.m3u8');
            const m3u8Content = await response.text();
            const lines = m3u8Content.split('\n');
            
            let currentCanal = {};
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('#EXTINF:')) {
                    // Extrair informações do canal
                    const nomeMatch = line.match(/,(.+)$/);
                    const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                    const groupMatch = line.match(/group-title="([^"]+)"/);
                    
                    currentCanal = {
                        nome: nomeMatch ? nomeMatch[1] : 'Canal Sem Nome',
                        logo: logoMatch ? logoMatch[1] : '',
                        grupo: groupMatch ? groupMatch[1] : 'Sem Grupo',
                        url: ''
                    };
                } else if (line && !line.startsWith('#') && currentCanal.nome) {
                    currentCanal.url = line;
                    this.canaisAoVivo.push({...currentCanal});
                    currentCanal = {};
                }
            }
            
            console.log('Canais ao vivo carregados:', this.canaisAoVivo.length);
        } catch (error) {
            console.error('Erro ao carregar canais ao vivo:', error);
        }
    }

    loadLocalStorageData() {
        // Carregar "Continuar Assistindo"
        const assistindo = localStorage.getItem('paixaoflix-continuar');
        if (assistindo) {
            this.assistindo = JSON.parse(assistindo);
        }
        
        // Carregar favoritos do localStorage
        const favoritosLS = localStorage.getItem('paixaoflix-favoritos');
        if (favoritosLS) {
            this.favoritos = JSON.parse(favoritosLS);
        }
    }

    setupEventListeners() {
        // Navegação sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Busca
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            } else {
                this.performSearch(); // Busca em tempo real
            }
        });

        // Modal player
        const modal = document.getElementById('player-modal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => this.closePlayer());
        
        // ESC para fechar player
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePlayer();
            }
        });

        // Hero banner
        document.querySelector('.hero-btn').addEventListener('click', () => {
            this.playRandomMedia();
        });
    }

    // LIMPEZA CRÍTICA - Limpar container antes de renderizar
    clearContent() {
        const container = document.getElementById('content-container');
        container.innerHTML = '';
    }

    // Renderizar Home com 12 seções na ordem OBRIGATÓRIA
    renderHome() {
        this.clearContent();
        
        // 1. Hero Banner (já existe no HTML)
        
        // 2. Continuar Assistindo (Máx 3 itens)
        this.renderSection('continuar-assistindo', 'Continuar Assistindo', this.assistindo.slice(0, 3), true);
        
        // 3. Minha Lista
        this.renderSection('minha-lista', 'Minha Lista', this.favoritos);
        
        // 4. Cards de Menu
        this.renderMenuCards();
        
        // 5. Não deixe de ver essa seleção (Apenas Lançamento 2026)
        const lancamentos2026 = this.getRandomLancamentos2026(5);
        this.renderSection('selecao', 'Não deixe de ver essa seleção', lancamentos2026);
        
        // 6. Sábado a noite merece (Apenas aos sábados após 16:49)
        this.renderSabadoNoite();
        
        // 7. As crianças amam (Gênero: Animação/Kids)
        const criancas = [...this.kidsData, ...this.seriesKidsData];
        this.renderSection('criancas-amam', 'As crianças amam', criancas);
        
        // 8. Romances para inspirações
        const romances = this.filterByGenre([...this.cinemaData, ...this.seriesData], ['Romance']);
        this.renderSection('romances', 'Histórias que aceleram o coração...', romances);
        
        // 9. Nostalgias que aquecem o coração (Ano < 2010)
        const nostalgias = this.filterByYear([...this.cinemaData, ...this.seriesData], (year) => parseInt(year) < 2010);
        this.renderSection('nostalgias', 'Nostalgias que aquecem o coração', nostalgias);
        
        // 10. Os melhores de 2025 (Ano = 2025)
        const melhores2025 = this.filterByYear([...this.cinemaData, ...this.seriesData], (year) => parseInt(year) === 2025);
        this.renderSection('melhores-2025', 'Os melhores de 2025', melhores2025);
        
        // 11. Prepare a pipoca e venha maratonar (Type = series)
        const series = [...this.seriesData, ...this.seriesKidsData];
        this.renderSection('maratonar', 'Prepare a pipoca e venha maratonar', series);
        
        // 12. Novela é sempre bom (Gênero: Novela)
        const novelas = this.filterByGenre([...this.cinemaData, ...this.seriesData], ['Novela']);
        this.renderSection('novelas', 'Novela é sempre bom', novelas);
    }

    renderSection(id, title, items, showProgress = false) {
        if (!items || items.length === 0) return;
        
        const container = document.getElementById('content-container');
        
        const section = document.createElement('section');
        section.className = 'section';
        section.id = id;
        
        section.innerHTML = `
            <h2 class="section-title">${title}</h2>
            <div class="cards-container">
                ${items.map(item => this.createCard(item, showProgress)).join('')}
            </div>
        `;
        
        container.appendChild(section);
    }

    renderMenuCards() {
        const container = document.getElementById('content-container');
        
        const menuSection = document.createElement('section');
        menuSection.className = 'menu-cards-section';
        
        menuSection.innerHTML = `
            <div class="menu-cards">
                <a href="#" class="menu-card" data-section="cinema">🎬 Cinema</a>
                <a href="#" class="menu-card" data-section="series">📺 Séries</a>
                <a href="#" class="menu-card" data-section="canais">📡 Canais ao Vivo</a>
                <a href="#" class="menu-card" data-section="kids">🧸 Filmes Kids</a>
                <a href="#" class="menu-card" data-section="series-kids">🎈 Séries Kids</a>
            </div>
        `;
        
        container.appendChild(menuSection);
        
        // Event listeners para menu cards
        menuSection.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    createCard(item, showProgress = false) {
        const progress = showProgress && item.currentTime && item.duration ? 
            (item.currentTime / item.duration) * 100 : 0;
            
        return `
            <div class="card" data-id="${item.titulo || item.nome}" data-url="${item.url}">
                <img src="${item.poster || item.logo || 'logoof512.png'}" alt="${item.titulo || item.nome}">
                <div class="card-info">
                    <div class="card-title">${item.titulo || item.nome}</div>
                    <div class="card-meta">
                        ${item.year ? item.year : ''} 
                        ${item.rating ? '⭐ ' + item.rating : ''}
                        ${item.grupo ? '📡 ' + item.grupo : ''}
                    </div>
                </div>
                ${showProgress ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Filtros para seções
    filterByGenre(items, genres) {
        return items.filter(item => {
            if (!item.genero) return false;
            return genres.some(genre => 
                item.genero.toLowerCase().includes(genre.toLowerCase())
            );
        });
    }

    filterByYear(items, yearFilter) {
        return items.filter(item => {
            if (!item.year) return false;
            return yearFilter(item.year);
        });
    }

    filterByType(items, type) {
        return items.filter(item => item.type === type);
    }

    getRandomItems(items, count) {
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Sistema de busca universal
    performSearch() {
        const query = document.getElementById('search-input').value.toLowerCase();
        
        if (!query) {
            this.renderHome();
            return;
        }
        
        // Ignorar acentos e maiúsculas/minúsculas
        const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        const results = [];
        
        // Buscar em todos os dados
        const allData = [
            ...this.cinemaData,
            ...this.seriesData,
            ...this.kidsData,
            ...this.seriesKidsData,
            ...this.canaisAoVivo
        ];
        
        allData.forEach(item => {
            const title = (item.titulo || item.nome || '').toLowerCase();
            const normalizedTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const genre = (item.genero || '').toLowerCase();
            const normalizedGenre = genre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            
            if (normalizedTitle.includes(normalizedQuery) || 
                normalizedGenre.includes(normalizedQuery)) {
                results.push(item);
            }
        });
        
        this.renderSearchResults(results, query);
    }

    renderSearchResults(results, query) {
        this.clearContent();
        
        const container = document.getElementById('content-container');
        
        const section = document.createElement('section');
        section.className = 'section';
        
        section.innerHTML = `
            <h2 class="section-title">Resultados para "${query}" (${results.length})</h2>
            <div class="cards-container">
                ${results.map(item => this.createCard(item)).join('')}
            </div>
        `;
        
        container.appendChild(section);
        
        // Adicionar event listeners aos cards
        this.addCardListeners();
    }

    // Navegação entre seções
    navigateToSection(section) {
        // Atualizar menu ativo
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Renderizar seção correspondente
        this.clearContent();
        
        switch(section) {
            case 'home':
                this.renderHome();
                break;
            case 'cinema':
                this.renderCinemaByGenre();
                break;
            case 'series':
                this.renderSeriesByGenre();
                break;
            case 'canais':
                this.renderSection('canais', 'Canais ao Vivo', this.canaisAoVivo);
                break;
            case 'kids':
                this.renderSection('kids', 'Filmes Kids', this.kidsData);
                break;
            case 'series-kids':
                this.renderSection('series-kids', 'Séries Kids', this.seriesKidsData);
                break;
            case 'favoritos':
                this.renderSection('favoritos', 'Minha Lista', this.favoritos);
                break;
        }
        
        this.addCardListeners();
    }

    // Player de vídeo com Clappr e checkpoint
    playMedia(media) {
        this.currentMedia = media;
        const modal = document.getElementById('player-modal');
        const playerContainer = document.getElementById('player-container');
        
        modal.style.display = 'block';
        
        // Destruir player anterior se existir
        if (this.player) {
            this.player.destroy();
        }
        
        // Criar novo player Clappr
        this.player = new Clappr.Player({
            source: media.url,
            parentId: '#player-container',
            width: '100%',
            height: '100%',
            autoPlay: true
        });
        
        // Salvar checkpoint a cada 5 segundos
        this.checkpointInterval = setInterval(() => {
            this.saveCheckpoint();
        }, 5000);
        
        // Adicionar aos "Continuar Assistindo"
        this.addToContinueWatching(media);
    }

    saveCheckpoint() {
        if (!this.player || !this.currentMedia) return;
        
        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();
        
        if (currentTime && duration) {
            const mediaData = {
                ...this.currentMedia,
                currentTime: currentTime,
                duration: duration,
                lastWatched: new Date().toISOString()
            };
            
            // Atualizar ou adicionar aos assistindo
            const existingIndex = this.assistindo.findIndex(item => 
                (item.titulo || item.nome) === (this.currentMedia.titulo || this.currentMedia.nome)
            );
            
            if (existingIndex >= 0) {
                this.assistindo[existingIndex] = mediaData;
            } else {
                this.assistindo.push(mediaData);
            }
        }
    }

    // Renderizar seção Sábado a Noite (com regras de horário)
    renderSabadoNoite() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Verificar se deve mostrar a seção
        const isSabado = dayOfWeek === 6;
        const isDepoisDas1649 = isSabado && (hour > 16 || (hour === 16 && minute >= 49));
        const isDomingoManha = dayOfWeek === 0 && (hour < 11 || (hour === 11 && minute < 59));
        
        // Se não for o horário permitido, não mostrar nada
        if (!isDepoisDas1649 && !isDomingoManha) {
            return;
        }
        
        // Obter conteúdos das categorias específicas
        const comedia = this.filterByGenre([...this.cinemaData, ...this.seriesData], ['Comédia']).slice(0, 2);
        const acao = this.filterByGenre([...this.cinemaData, ...this.seriesData], ['Ação']).slice(0, 1);
        const suspense = this.filterByGenre([...this.cinemaData, ...this.seriesData], ['Suspense']).slice(0, 1);
        const religioso = this.filterByGenre([...this.cinemaData, ...this.seriesData], ['Religioso']).slice(0, 1);
        const musical = this.filterByGenre([...this.cinemaData, ...this.seriesData], ['Musical']).slice(0, 1);
        
        // Combinar todos (total de 6 capas)
        const sabadoNoiteContent = [...comedia, ...acao, ...suspense, ...religioso, ...musical];
        
        // Renderizar seção
        this.renderSection('sabado-noite', 'Sábado a noite merece', sabadoNoiteContent);
        
        // Ajustar outras seções para subir/descer e não deixar espaço vazio
        this.adjustSectionsForSabadoNoite();
    }

    // Ajustar outras seções quando Sábado a Noite está ativo
    adjustSectionsForSabadoNoite() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        const isSabadoNoiteAtivo = (dayOfWeek === 6 && (hour > 16 || (hour === 16 && minute >= 49))) ||
                                      (dayOfWeek === 0 && (hour < 11 || (hour === 11 && minute < 59)));
        
        // Se Sábado a Noite está ativo, ajustar o espaçamento das outras seções
        if (isSabadoNoiteAtivo) {
            // Adicionar classe especial ao container para ajuste de layout
            const container = document.getElementById('content-container');
            container.classList.add('sabado-noite-active');
        }
    }
    getRandomLancamentos2026(count) {
        // Filtrar todos os conteúdos de 2026
        const lancamentos2026 = [
            ...this.cinemaData.filter(item => item.year === '2026'),
            ...this.seriesData.filter(item => item.year === '2026'),
            ...this.kidsData.filter(item => item.year === '2026'),
            ...this.seriesKidsData.filter(item => item.year === '2026')
        ];
        
        // Se não tiver lançamentos 2026, retornar array vazio
        if (lancamentos2026.length === 0) {
            return [];
        }
        
        // Embaralhar e pegar quantidade solicitada
        const shuffled = [...lancamentos2026].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, lancamentos2026.length));
    }

    // Obter itens aleatórios
    getRandomItems(allData, count) {
        if (allData.length === 0) {
            return [];
        }
        
        const shuffled = [...allData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, allData.length));
    }

    addToContinueWatching(media) {
        const mediaData = {
            ...media,
            currentTime: 0,
            duration: 0,
            lastWatched: new Date().toISOString()
        };
        
        const existingIndex = this.assistindo.findIndex(item => 
            (item.titulo || item.nome) === (media.titulo || media.nome)
        );
        
        if (existingIndex >= 0) {
            this.assistindo[existingIndex] = mediaData;
        } else {
            this.assistindo.push(mediaData);
        }
        
        localStorage.setItem('paixaoflix-continuar', JSON.stringify(this.assistindo));
    }

    closePlayer() {
        const modal = document.getElementById('player-modal');
        modal.style.display = 'none';
        
        // Limpar intervalo de checkpoint
        if (this.checkpointInterval) {
            clearInterval(this.checkpointInterval);
        }
        
        // Destruir player
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        
        // Salvar checkpoint final
        this.saveCheckpoint();
        
        // Voltar para home sem recarregar página
        this.renderHome();
    }

    // Sistema de favoritos
    toggleFavorite(media) {
        const index = this.favoritos.findIndex(item => 
            (item.titulo || item.nome) === (media.titulo || media.nome)
        );
        
        if (index >= 0) {
            this.favoritos.splice(index, 1);
        } else {
            this.favoritos.push(media);
        }
        
        // Salvar no localStorage e arquivo
        localStorage.setItem('paixaoflix-favoritos', JSON.stringify(this.favoritos));
        this.saveFavoritosToFile();
    }

    async saveFavoritosToFile() {
        // Em produção, isso seria salvo no servidor
        // Por enquanto, apenas no localStorage
        console.log('Favoritos salvos:', this.favoritos.length);
    }

    // Renderizar Cinema por Gênero (Vertical)
    renderCinemaByGenre() {
        const container = document.getElementById('content-container');
        
        // Categorias específicas definidas pelo usuário
        const categories = [
            'Lançamento 2026', 'Lançamento 2025', 'Ação', 'Aventura', 'Anime', 
            'Animação', 'Comédia', 'Drama', 'Dorama', 'Clássicos', 'Crime', 
            'Policial', 'Família', 'Musical', 'Documentário', 'Faroeste', 
            'Ficção', 'Nacional', 'Religioso', 'Romance', 'Terror', 'Suspense', 'Adulto'
        ];
        
        // Categorizar conteúdos de forma exclusiva
        const categorizedContent = this.categorizeContent(this.cinemaData);
        
        // Criar container principal
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'categories-container';
        
        // Criar sidebar de categorias
        const sidebar = document.createElement('div');
        sidebar.className = 'category-sidebar';
        sidebar.innerHTML = `
            <div class="category-title">🎬 Gêneros</div>
            <ul class="category-list">
                <li class="category-item active" data-genre="all">
                    Todos <span class="category-count">${this.cinemaData.length}</span>
                </li>
                ${categories.map(category => {
                    const count = categorizedContent[category] ? categorizedContent[category].length : 0;
                    return `
                        <li class="category-item" data-genre="${category}">
                            ${category} <span class="category-count">${count}</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        
        // Criar conteúdo principal
        const content = document.createElement('div');
        content.className = 'category-content';
        
        // Header do cinema
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <h2>🎬 Cinema</h2>
            <p>Explore nossa coleção de filmes por gênero</p>
        `;
        
        content.appendChild(header);
        
        // Container dos filmes
        const moviesContainer = document.createElement('div');
        moviesContainer.id = 'movies-container';
        moviesContainer.innerHTML = `
            <div class="cards-container">
                ${this.cinemaData.map(item => this.createCard(item)).join('')}
            </div>
        `;
        
        content.appendChild(moviesContainer);
        
        // Montar estrutura
        categoriesContainer.appendChild(sidebar);
        categoriesContainer.appendChild(content);
        container.appendChild(categoriesContainer);
        
        // Armazenar conteúdo categorizado para uso posterior
        this.categorizedCinema = categorizedContent;
        
        // Adicionar event listeners
        this.addCategoryListeners();
        this.addCardListeners();
    }

    // Sistema de categorização exclusiva
    categorizeContent(content) {
        const categories = {
            'Lançamento 2026': [],
            'Lançamento 2025': [],
            'Ação': [],
            'Aventura': [],
            'Anime': [],
            'Animação': [],
            'Comédia': [],
            'Drama': [],
            'Dorama': [],
            'Clássicos': [],
            'Crime': [],
            'Policial': [],
            'Família': [],
            'Musical': [],
            'Documentário': [],
            'Faroeste': [],
            'Ficção': [],
            'Nacional': [],
            'Religioso': [],
            'Romance': [],
            'Terror': [],
            'Suspense': [],
            'Adulto': []
        };

        const usedItems = new Set();
        let totalProcessados = 0;
        let totalNaoCategorizados = 0;

        content.forEach(item => {
            totalProcessados++;
            const itemKey = `${item.titulo || item.nome}_${item.year || 'semano'}`;
            
            // Se já foi categorizado, pular completamente
            if (usedItems.has(itemKey)) {
                console.log('Item já processado:', itemKey);
                return;
            }
            
            let assigned = false;
            
            // Prioridade 1: Lançamentos por ano
            if (item.year === '2026' && !assigned) {
                categories['Lançamento 2026'].push(item);
                usedItems.add(itemKey);
                assigned = true;
                console.log('Item categorizado como Lançamento 2026:', item.titulo);
                return; // Sair imediatamente após atribuir
            }
            
            if (item.year === '2025' && !assigned) {
                categories['Lançamento 2025'].push(item);
                usedItems.add(itemKey);
                assigned = true;
                console.log('Item categorizado como Lançamento 2025:', item.titulo);
                return; // Sair imediatamente após atribuir
            }
            
            // Prioridade 2: Gêneros exatos
            if (!assigned && item.genero) {
                const genre = item.genero.trim();
                
                // Verificar correspondência exata primeiro
                if (categories.hasOwnProperty(genre)) {
                    categories[genre].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado exatamente como', genre, ':', item.titulo);
                    return; // Sair imediatamente após atribuir
                }
                
                // Verificar correspondências parciais (apenas uma categoria por item)
                const genreLower = genre.toLowerCase();
                
                if (genreLower.includes('ação') && !assigned) {
                    categories['Ação'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Ação:', item.titulo);
                } else if (genreLower.includes('aventura') && !assigned) {
                    categories['Aventura'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Aventura:', item.titulo);
                } else if (genreLower.includes('anime') && !assigned) {
                    categories['Anime'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Anime:', item.titulo);
                } else if (genreLower.includes('animação') && !assigned) {
                    categories['Animação'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Animação:', item.titulo);
                } else if (genreLower.includes('comédia') && !assigned) {
                    categories['Comédia'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Comédia:', item.titulo);
                } else if (genreLower.includes('drama') && !assigned) {
                    categories['Drama'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Drama:', item.titulo);
                } else if (genreLower.includes('dorama') && !assigned) {
                    categories['Dorama'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Dorama:', item.titulo);
                } else if (genreLower.includes('clássico') && !assigned) {
                    categories['Clássicos'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Clássicos:', item.titulo);
                } else if (genreLower.includes('crime') && !assigned) {
                    categories['Crime'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Crime:', item.titulo);
                } else if (genreLower.includes('policial') && !assigned) {
                    categories['Policial'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Policial:', item.titulo);
                } else if (genreLower.includes('família') && !assigned) {
                    categories['Família'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Família:', item.titulo);
                } else if (genreLower.includes('musical') && !assigned) {
                    categories['Musical'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Musical:', item.titulo);
                } else if (genreLower.includes('documentário') && !assigned) {
                    categories['Documentário'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Documentário:', item.titulo);
                } else if (genreLower.includes('faroeste') && !assigned) {
                    categories['Faroeste'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Faroeste:', item.titulo);
                } else if (genreLower.includes('ficção') && !assigned) {
                    categories['Ficção'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Ficção:', item.titulo);
                } else if (genreLower.includes('nacional') && !assigned) {
                    categories['Nacional'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Nacional:', item.titulo);
                } else if (genreLower.includes('religioso') && !assigned) {
                    categories['Religioso'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Religioso:', item.titulo);
                } else if (genreLower.includes('romance') && !assigned) {
                    categories['Romance'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Romance:', item.titulo);
                } else if (genreLower.includes('terror') && !assigned) {
                    categories['Terror'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Terror:', item.titulo);
                } else if (genreLower.includes('suspense') && !assigned) {
                    categories['Suspense'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Suspense:', item.titulo);
                } else if (genreLower.includes('adulto') && !assigned) {
                    categories['Adulto'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                    console.log('Item categorizado como Adulto:', item.titulo);
                }
                
                if (assigned) {
                    usedItems.add(itemKey);
                } else {
                    totalNaoCategorizados++;
                    console.log('Item NÃO categorizado:', item.titulo, '| Gênero:', item.genero);
                }
            }
        });

        console.log('=== RESUMO DA CATEGORIZAÇÃO ===');
        console.log('Total processados:', totalProcessados);
        console.log('Total não categorizados:', totalNaoCategorizados);
        console.log('Total usados:', usedItems.size);
        
        // Mostrar totais por categoria
        Object.keys(categories).forEach(cat => {
            console.log(`${cat}: ${categories[cat].length} itens`);
        });

        return categories;
    }

    // Adicionar listeners às categorias
    addCategoryListeners() {
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Remover classe active de todos
                document.querySelectorAll('.category-item').forEach(cat => {
                    cat.classList.remove('active');
                });
                
                // Adicionar classe active ao item clicado
                e.target.classList.add('active');
                
                // Filtrar filmes por gênero
                const genre = e.target.dataset.genre;
                this.filterMoviesByGenre(genre);
            });
        });
    }

    // Renderizar Séries por Gênero (Vertical)
    renderSeriesByGenre() {
        const container = document.getElementById('content-container');
        
        // Categorias específicas definidas pelo usuário
        const categories = [
            'Lançamento 2026', 'Lançamento 2025', 'Ação', 'Aventura', 'Anime', 
            'Animação', 'Comédia', 'Drama', 'Dorama', 'Clássicos', 'Crime', 
            'Policial', 'Família', 'Musical', 'Documentário', 'Faroeste', 
            'Ficção', 'Nacional', 'Religioso', 'Romance', 'Terror', 'Suspense', 'Adulto'
        ];
        
        // Categorizar conteúdos de forma exclusiva
        const categorizedContent = this.categorizeContent(this.seriesData);
        
        // Criar container principal
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'categories-container';
        
        // Criar sidebar de categorias
        const sidebar = document.createElement('div');
        sidebar.className = 'category-sidebar';
        sidebar.innerHTML = `
            <div class="category-title">📺 Gêneros</div>
            <ul class="category-list">
                <li class="category-item active" data-genre="all">
                    Todos <span class="category-count">${this.seriesData.length}</span>
                </li>
                ${categories.map(category => {
                    const count = categorizedContent[category] ? categorizedContent[category].length : 0;
                    return `
                        <li class="category-item" data-genre="${category}">
                            ${category} <span class="category-count">${count}</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        
        // Criar conteúdo principal
        const content = document.createElement('div');
        content.className = 'category-content';
        
        // Header das séries
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <h2>📺 Séries</h2>
            <p>Explore nossa coleção de séries por gênero</p>
        `;
        
        content.appendChild(header);
        
        // Container das séries
        const seriesContainer = document.createElement('div');
        seriesContainer.id = 'series-container';
        seriesContainer.innerHTML = `
            <div class="cards-container">
                ${this.seriesData.map(item => this.createCard(item)).join('')}
            </div>
        `;
        
        content.appendChild(seriesContainer);
        
        // Montar estrutura
        categoriesContainer.appendChild(sidebar);
        categoriesContainer.appendChild(content);
        container.appendChild(categoriesContainer);
        
        // Armazenar conteúdo categorizado para uso posterior
        this.categorizedSeries = categorizedContent;
        
        // Adicionar event listeners
        this.addSeriesCategoryListeners();
        this.addCardListeners();
    }

    // Adicionar listeners às categorias de séries
    addSeriesCategoryListeners() {
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Remover classe active de todos
                document.querySelectorAll('.category-item').forEach(cat => {
                    cat.classList.remove('active');
                });
                
                // Adicionar classe active ao item clicado
                e.target.classList.add('active');
                
                // Filtrar séries por gênero
                const genre = e.target.dataset.genre;
                this.filterSeriesByGenre(genre);
            });
        });
    }

    // Filtrar séries por gênero
    filterSeriesByGenre(genre) {
        const seriesContainer = document.getElementById('series-container');
        
        let filteredSeries;
        if (genre === 'all') {
            filteredSeries = this.seriesData;
        } else {
            // Usar conteúdo categorizado para evitar duplicações
            filteredSeries = this.categorizedSeries[genre] || [];
        }
        
        seriesContainer.innerHTML = `
            <div class="cards-container">
                ${filteredSeries.map(item => this.createCard(item)).join('')}
            </div>
        `;
        
        // Adicionar listeners aos novos cards
        this.addCardListeners();
    }

    // Filtrar filmes por gênero
    filterMoviesByGenre(genre) {
        const moviesContainer = document.getElementById('movies-container');
        
        let filteredMovies;
        if (genre === 'all') {
            filteredMovies = this.cinemaData;
        } else {
            // Usar conteúdo categorizado para evitar duplicações
            filteredMovies = this.categorizedCinema[genre] || [];
        }
        
        moviesContainer.innerHTML = `
            <div class="cards-container">
                ${filteredMovies.map(item => this.createCard(item)).join('')}
            </div>
        `;
        
        // Adicionar listeners aos novos cards
        this.addCardListeners();
    }

    // Adicionar listeners aos cards
    addCardListeners() {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const mediaData = {
                    url: card.dataset.url,
                    titulo: card.dataset.id
                };
                
                // Buscar dados completos do media
                const fullMedia = this.findMediaByTitle(card.dataset.id);
                this.playMedia(fullMedia || mediaData);
            });
        });
    }

    findMediaByTitle(title) {
        const allData = [
            ...this.cinemaData,
            ...this.seriesData,
            ...this.kidsData,
            ...this.seriesKidsData,
            ...this.canaisAoVivo
        ];
        
        return allData.find(item => 
            (item.titulo || item.nome) === title
        );
    }

    playRandomMedia() {
        const allData = [
            ...this.cinemaData,
            ...this.seriesData
        ];
        
        if (allData.length > 0) {
            const randomMedia = allData[Math.floor(Math.random() * allData.length)];
            this.playMedia(randomMedia);
        }
    }
}

// Sistema de atualização automática do GitHub
}
