// PaixãoFlix - Sistema de Streaming
// CONFIGURAÇÃO CENTRALIZADA
const APP_NAME = "PaixãoFlix";
const PaixaoConfig = {
    username: "VisorFinances",
    repo: "tv.paixaoflix",
    branch: "main",
    
    getRawBase() {
        return `https://raw.githubusercontent.com/${this.username}/${this.repo}/${this.branch}/data/`;
    }
};

// URL BASE DO ARCHIVE
const ARCHIVE_BASE_URL = 'https://archive.org/download/';

// ORDEM DAS CATEGORIAS
const ORDER_LIST = [
    "Lançamento 2026", "2025", "Ação", "Aventura", "Anime", "Animação", 
    "Comédia", "Drama", "Dorama", "Clássicos", "Crime", "Policial", 
    "Família", "Musical", "Documentário", "Faroeste", "Ficção", 
    "Nacional", "Religioso", "Romance", "Terror", "Suspense", "Adulto"
];

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
        
        // Iniciar verificação automática de novelas a cada 1h
        this.startNovelaCheck();
    }

    // Sistema de verificação automática de novelas a cada 1h
    startNovelaCheck() {
        // Verificar imediatamente ao iniciar
        this.checkAndAddNovelaSection();
        
        // Configurar verificação a cada 1h (3600000ms)
        setInterval(() => {
            this.checkAndAddNovelaSection();
        }, 3600000);
    }

    // Verificar e adicionar seção de novelas
    checkAndAddNovelaSection() {
        // Procurar por novelas em todos os dados
        const allData = [...this.cinemaData, ...this.seriesData, ...this.kidsData, ...this.seriesKidsData];
        const novelas = allData.filter(item => 
            item.genero && item.genero.toLowerCase().includes('novela')
        );
        
        if (novelas.length > 0) {
            console.log(` Encontradas ${novelas.length} novelas. Adicionando seção...`);
            
            // Adicionar seção de novelas como última seção da Home
            this.addNovelaSectionToHome(novelas);
        } else {
            console.log(' Nenhuma novela encontrada nesta verificação.');
        }
    }

    // Adicionar seção de novelas à Home
    addNovelaSectionToHome(novelas) {
        const container = document.getElementById('content-container');
        
        // Verificar se a seção já existe
        let novelaSection = document.getElementById('novela-dinamica');
        
        if (novelaSection) {
            // Atualizar seção existente
            const cardsContainer = novelaSection.querySelector('.cards-container');
            cardsContainer.innerHTML = novelas.slice(0, 5).map(item => this.createCard(item)).join('');
        } else {
            // Criar nova seção
            novelaSection = document.createElement('section');
            novelaSection.id = 'novela-dinamica';
            novelaSection.className = 'section';
            novelaSection.innerHTML = `
                <h2 class="section-title"> Novelas Encontradas</h2>
                <div class="cards-container">
                    ${novelas.slice(0, 5).map(item => this.createCard(item)).join('')}
                </div>
            `;
            
            // Adicionar como última seção
            container.appendChild(novelaSection);
        }
        
        // Adicionar listeners aos novos cards
        this.addCardListeners();
        
        console.log(' Seção de novelas atualizada com sucesso!');
    }

    // Carregar dados EXCLUSIVAMENTE dos arquivos especificados
    async loadData() {
        try {
            // Cinema - Usar URL dinâmica
            const cinemaResponse = await fetch(`${PaixaoConfig.getRawBase()}cinema.json`);
            this.cinemaData = await cinemaResponse.json();
            
            // Séries
            const seriesResponse = await fetch(`${PaixaoConfig.getRawBase()}s%C3%A9ries.json`);
            this.seriesData = await seriesResponse.json();
            
            // Kids
            const kidsResponse = await fetch(`${PaixaoConfig.getRawBase()}filmeskids.json`);
            this.kidsData = await kidsResponse.json();
            
            // Séries Kids
            const seriesKidsResponse = await fetch(`${PaixaoConfig.getRawBase()}s%C3%A9rieskids.json`);
            this.seriesKidsData = await seriesKidsResponse.json();
            
            // Canais ao Vivo - Ler EXCLUSIVAMENTE de data/canaisaovivo.m3u8
            await this.loadM3U8Data();
            
            // Favoritos
            const favoritosResponse = await fetch(`${PaixaoConfig.getRawBase()}favoritos.json`);
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
                    const nomeMatch = line.match(/,([^,]*)$/);
                    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
                    const groupMatch = line.match(/group-title="([^"]*)"/);
                    
                    if (nomeMatch) {
                        currentCanal = {
                            nome: nomeMatch[1].trim(),
                            logo: logoMatch ? logoMatch[1] : '',
                            grupo: groupMatch ? groupMatch[1] : 'Sem Grupo',
                            url: ''
                        };
                    }
                } else if (line && !line.startsWith('#') && currentCanal.nome) {
                    // Próxima linha é a URL do canal
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

    // Carregar dados do localStorage
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

    // Setup de event listeners
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
        
        // 7. As crianças amam (Gênero: Animação/Kids) - 3 filmes + 2 séries
        const kidsFilmes = this.kidsData.slice(0, 3);
        const kidsSeries = this.seriesKidsData.slice(0, 2);
        const criancas = [...kidsFilmes, ...kidsSeries];
        this.renderSection('criancas-amam', 'As crianças amam', criancas);
        
        // 8. Romances para inspirações - 5 capas da categoria Romance
        const romances = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Romance'] || [];
        this.renderSection('romances', 'Histórias que aceleram o coração...', romances.slice(0, 5));
        
        // 9. Nostalgias que aquecem o coração (Categoria Clássicos) - Atualizar a cada reinício
        const nostalgias = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Clássicos'] || [];
        this.renderSection('nostalgias', 'Nostalgias que aquecem o coração', nostalgias.slice(0, 5));
        
        // 10. Os melhores de 2025 (Categoria Lançamento 2025) - Atualizar a cada reinício
        const lancamentos2025 = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Lançamento 2025'] || [];
        this.renderSection('melhores-2025', 'Os melhores de 2025', lancamentos2025.slice(0, 5));
        
        // 11. Prepare a pipoca e venha maratonar (Categoria Séries) - Atualizar a cada reinício
        const allSeries = [...this.seriesData, ...this.seriesKidsData];
        const uniqueSeries = this.removeDuplicateSeries(allSeries);
        this.renderSection('maratonar', 'Prepare a pipoca e venha maratonar', uniqueSeries.slice(0, 5));
        
        // 12. Novela é sempre bom (Gênero: Novela) - Atualizar a cada reinício
        const novelas = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Novela'] || [];
        this.renderSection('novelas', 'Novela é sempre bom', novelas.slice(0, 5));
        
        // 13. Ação - 5 capas da categoria Ação
        const acao = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Ação'] || [];
        this.renderSection('acao', 'Ação', acao.slice(0, 5));
        
        // 14. Aventura - 5 capas da categoria Aventura
        const aventura = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Aventura'] || [];
        this.renderSection('aventura', 'Aventura', aventura.slice(0, 5));
        
        // 15. Anime - 5 capas da categoria Anime
        const anime = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Anime'] || [];
        this.renderSection('anime', 'Anime', anime.slice(0, 5));
        
        // 16. Animação - 5 capas da categoria Animação
        const animacao = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Animação'] || [];
        this.renderSection('animacao', 'Animação', animacao.slice(0, 5));
        
        // 17. Comédia - 5 capas da categoria Comédia
        const comedia = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Comédia'] || [];
        this.renderSection('comedia', 'Comédia', comedia.slice(0, 5));
        
        // 18. Drama - 5 capas da categoria Drama
        const drama = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Drama'] || [];
        this.renderSection('drama', 'Drama', drama.slice(0, 5));
        
        // 19. Dorama - 5 capas da categoria Dorama
        const dorama = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Dorama'] || [];
        this.renderSection('dorama', 'Dorama', dorama.slice(0, 5));
        
        // 20. Crime - 5 capas da categoria Crime
        const crime = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Crime'] || [];
        this.renderSection('crime', 'Crime', crime.slice(0, 5));
        
        // 21. Policial - 5 capas da categoria Policial
        const policial = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Policial'] || [];
        this.renderSection('policial', 'Policial', policial.slice(0, 5));
        
        // 22. Família - 5 capas da categoria Família
        const familia = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Família'] || [];
        this.renderSection('familia', 'Família', familia.slice(0, 5));
        
        // 23. Musical - 5 capas da categoria Musical
        const musical = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Musical'] || [];
        this.renderSection('musical', 'Musical', musical.slice(0, 5));
        
        // 24. Documentário - 5 capas da categoria Documentário
        const documentario = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Documentário'] || [];
        this.renderSection('documentario', 'Documentário', documentario.slice(0, 5));
        
        // 25. Faroeste - 5 capas da categoria Faroeste
        const faroeste = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Faroeste'] || [];
        this.renderSection('faroeste', 'Faroeste', faroeste.slice(0, 5));
        
        // 26. Ficção - 5 capas da categoria Ficção
        const ficcao = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Ficção'] || [];
        this.renderSection('ficcao', 'Ficção', ficcao.slice(0, 5));
        
        // 27. Nacional - 5 capas da categoria Nacional
        const nacional = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Nacional'] || [];
        this.renderSection('nacional', 'Nacional', nacional.slice(0, 5));
        
        // 28. Religioso - 5 capas da categoria Religioso
        const religioso = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Religioso'] || [];
        this.renderSection('religioso', 'Religioso', religioso.slice(0, 5));
        
        // 29. Terror - 5 capas da categoria Terror
        const terror = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Terror'] || [];
        this.renderSection('terror', 'Terror', terror.slice(0, 5));
        
        // 30. Suspense - 5 capas da categoria Suspense
        const suspense = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Suspense'] || [];
        this.renderSection('suspense', 'Suspense', suspense.slice(0, 5));
        
        // 31. Adulto - 5 capas da categoria Adulto
        const adulto = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Adulto'] || [];
        this.renderSection('adulto', 'Adulto', adulto.slice(0, 5));
        
        // Atualizar outras seções para subir/descer e não deixar espaço vazio quando Sábado a Noite estiver ativo
        this.adjustSectionsForSabadoNoite();
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
        
        // Adicionar event listeners aos cards do menu
        menuSection.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    // Renderizar Sábado a Noite (com regras de horário)
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
                return; // Sair imediatamente após atribuir
            }
            
            if (item.year === '2025' && !assigned) {
                categories['Lançamento 2025'].push(item);
                usedItems.add(itemKey);
                assigned = true;
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
                    return; // Sair imediatamente após atribuir
                }
                
                // Verificar correspondências parciais (apenas uma categoria por item)
                const genreLower = genre.toLowerCase();
                
                if (genreLower.includes('ação') && !assigned) {
                    categories['Ação'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('aventura') && !assigned) {
                    categories['Aventura'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('anime') && !assigned) {
                    categories['Anime'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('animação') && !assigned) {
                    categories['Animação'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('comédia') && !assigned) {
                    categories['Comédia'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('drama') && !assigned) {
                    categories['Drama'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('dorama') && !assigned) {
                    categories['Dorama'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('clássico') && !assigned) {
                    categories['Clássicos'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('crime') && !assigned) {
                    categories['Crime'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('policial') && !assigned) {
                    categories['Policial'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('família') && !assigned) {
                    categories['Família'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('musical') && !assigned) {
                    categories['Musical'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('documentário') && !assigned) {
                    categories['Documentário'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('faroeste') && !assigned) {
                    categories['Faroeste'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('ficção') && !assigned) {
                    categories['Ficção'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('nacional') && !assigned) {
                    categories['Nacional'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('religioso') && !assigned) {
                    categories['Religioso'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('romance') && !assigned) {
                    categories['Romance'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('terror') && !assigned) {
                    categories['Terror'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('suspense') && !assigned) {
                    categories['Suspense'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
                } else if (genreLower.includes('adulto') && !assigned) {
                    categories['Adulto'].push(item);
                    usedItems.add(itemKey);
                    assigned = true;
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

    // Obter lançamentos aleatórios de 2026
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

    // Remover séries duplicadas (mesmo título, temporadas diferentes)
    removeDuplicateSeries(series) {
        const seen = new Set();
        return series.filter(item => {
            const title = (item.titulo || item.nome).toLowerCase().trim();
            if (seen.has(title)) {
                return false;
            }
            seen.add(title);
            return true;
        });
    }

    // Obter itens aleatórios
    getRandomItems(allData, count) {
        if (allData.length === 0) {
            return [];
        }
        
        const shuffled = [...allData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, allData.length));
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
            case 'acao':
                const acao = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Ação'] || [];
                this.renderSection('acao', 'Ação', acao.slice(0, 5));
                break;
            case 'aventura':
                const aventura = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Aventura'] || [];
                this.renderSection('aventura', 'Aventura', aventura.slice(0, 5));
                break;
            case 'anime':
                const anime = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Anime'] || [];
                this.renderSection('anime', 'Anime', anime.slice(0, 5));
                break;
            case 'animacao':
                const animacao = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Animação'] || [];
                this.renderSection('animacao', 'Animação', animacao.slice(0, 5));
                break;
            case 'comedia':
                const comedia = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Comédia'] || [];
                this.renderSection('comedia', 'Comédia', comedia.slice(0, 5));
                break;
            case 'drama':
                const drama = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Drama'] || [];
                this.renderSection('drama', 'Drama', drama.slice(0, 5));
                break;
            case 'dorama':
                const dorama = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Dorama'] || [];
                this.renderSection('dorama', 'Dorama', dorama.slice(0, 5));
                break;
            case 'classicos':
                const classicos = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Clássicos'] || [];
                this.renderSection('classicos', 'Clássicos', classicos.slice(0, 5));
                break;
            case 'crime':
                const crime = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Crime'] || [];
                this.renderSection('crime', 'Crime', crime.slice(0, 5));
                break;
            case 'policial':
                const policial = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Policial'] || [];
                this.renderSection('policial', 'Policial', policial.slice(0, 5));
                break;
            case 'familia':
                const familia = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Família'] || [];
                this.renderSection('familia', 'Família', familia.slice(0, 5));
                break;
            case 'musical':
                const musical = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Musical'] || [];
                this.renderSection('musical', 'Musical', musical.slice(0, 5));
                break;
            case 'documentario':
                const documentario = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Documentário'] || [];
                this.renderSection('documentario', 'Documentário', documentario.slice(0, 5));
                break;
            case 'faroeste':
                const faroeste = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Faroeste'] || [];
                this.renderSection('faroeste', 'Faroeste', faroeste.slice(0, 5));
                break;
            case 'ficcao':
                const ficcao = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Ficção'] || [];
                this.renderSection('ficcao', 'Ficção', ficcao.slice(0, 5));
                break;
            case 'nacional':
                const nacional = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Nacional'] || [];
                this.renderSection('nacional', 'Nacional', nacional.slice(0, 5));
                break;
            case 'religioso':
                const religioso = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Religioso'] || [];
                this.renderSection('religioso', 'Religioso', religioso.slice(0, 5));
                break;
            case 'romance':
                const romance = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Romance'] || [];
                this.renderSection('romance', 'Romance', romance.slice(0, 5));
                break;
            case 'terror':
                const terror = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Terror'] || [];
                this.renderSection('terror', 'Terror', terror.slice(0, 5));
                break;
            case 'suspense':
                const suspense = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Suspense'] || [];
                this.renderSection('suspense', 'Suspense', suspense.slice(0, 5));
                break;
            case 'adulto':
                const adulto = this.categorizeContent([...this.cinemaData, ...this.seriesData])['Adulto'] || [];
                this.renderSection('adulto', 'Adulto', adulto.slice(0, 5));
                break;
        }
        
        this.addCardListeners();
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
            return yearFilter(parseInt(item.year));
        });
    }

    // Criar cards
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

    // Salvar checkpoint no localStorage
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
            
            // Manter apenas os 3 mais recentes
            this.assistindo.sort((a, b) => 
                new Date(b.lastWatched) - new Date(a.lastWatched)
            );
            this.assistindo = this.assistindo.slice(0, 3);
            
            // Salvar no localStorage
            localStorage.setItem('paixaoflix-continuar', JSON.stringify(this.assistindo));
        }
    }

    // Adicionar aos "Continuar Assistindo"
    addToContinueWatching(media) {
        const mediaData = {
            ...media,
            currentTime: 0,
            duration: 0,
            lastWatched: new Date().toISOString()
        };
        
        // Obter último commit local
        const existingIndex = this.assistindo.findIndex(item => 
            (item.titulo || item.nome) === (media.titulo || media.nome)
            );
        
        if (existingIndex >= 0) {
            this.assistindo[existingIndex] = mediaData;
        } else {
            this.assistindo.push(mediaData);
        }
    }

    // Configurar segurança e bloqueios
    setupSecurity() {
        // 1. Bloqueio de botão direito
        document.addEventListener('contextmenu', event => event.preventDefault());
        
        // 2. Bloqueio de teclas de inspeção
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
        
        // 3. Auto-hide cursor (efeito Smart TV)
        let mouseTimer;
        document.addEventListener('mousemove', () => {
            document.body.style.cursor = 'default';
            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(() => {
                document.body.style.cursor = 'none';
            }, 3000);
        });
        
        // 4. Prevenção de drag
        document.addEventListener('dragstart', (e) => e.preventDefault());
        
        // 5. Bloqueio de seleção de texto
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.webkitTouchCallout = 'none';
    }

    // Configurar navegação por controle remoto/teclado
    setupNavigation() {
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
                    const currentSection = currentFocus.closest('.content-section');
                    const nextSection = currentSection?.nextElementSibling;
                    if (nextSection) nextFocus = nextSection.querySelector('.movie-card');
                    break;
                case 'ArrowUp':
                    const prevSection = currentFocus.closest('.content-section')?.previousElementSibling;
                    if (prevSection) nextFocus = prevSection.querySelector('.movie-card');
                    break;
                case 'Enter':
                    if (currentFocus) currentFocus.click();
                    break;
            }
            
            if (nextFocus && nextFocus.classList.contains('movie-card')) {
                nextFocus.focus();
                nextFocus.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        });
    }

    // Gerador de URL do Archive
    getArchiveFileUrl(id, filename) {
        return `${ARCHIVE_BASE_URL}${id}/${encodeURIComponent(filename)}`;
    }

    // Limpeza de gêneros
    cleanGenres(genreData) {
        if (Array.isArray(genreData)) return genreData.map(g => g.replace('[', '').trim());
        if (typeof genreData === 'string') return genreData.replace('[', '').split(',').map(g => g.trim());
        return [];
    }

    // Diferenciar filme de série
    playContent(item) {
        if (item.type === 'movie') {
            this.initPlayer(item.url);
        } else if (item.type === 'serie' || item.type === 'series') {
            const archiveID = item.identificador_archive;
            this.openEpisodesPage(archiveID, item.titulo);
        }
    }

    // Abrir página de episódios
    async openEpisodesPage(archiveID, title) {
        try {
            const response = await fetch(`https://archive.org/metadata/${archiveID}`);
            const data = await response.json();
            
            const episodes = data.files.filter(file => 
                file.name.endsWith('.mp4') || file.name.endsWith('.mkv')
            );

            this.renderSeriesDetails(title, episodes, archiveID);
        } catch (error) {
            console.error("Erro ao conectar com Archive.org", error);
            this.showError('Conteúdo em processamento no servidor');
        }
    }

    // Renderizar detalhes da série
    renderSeriesDetails(title, episodes, archiveID) {
        const mainContent = document.getElementById('content-container');
        mainContent.innerHTML = `
            <div class="series-details">
                <div class="series-header">
                    <h1>${title}</h1>
                    <div class="series-actions">
                        <button class="btn-primary" onclick="paixaoflix.playFirstEpisode('${archiveID}')">
                            ▶️ Assistir
                        </button>
                        <button class="btn-secondary" onclick="paixaoflix.playTrailer('${title}')">
                            🎬 Trailer
                        </button>
                        <button class="btn-secondary" onclick="paixaoflix.addToFavorites('${title}')">
                            ❤️ + Minha Lista
                        </button>
                    </div>
                </div>
                <div class="episodes-list">
                    ${episodes.map((ep, index) => `
                        <div class="episode-item" onclick="paixaoflix.playEpisode('${archiveID}', '${ep.name}')">
                            <div class="episode-number">Episódio ${index + 1}</div>
                            <div class="episode-thumbnail">
                                <img src="https://via.placeholder.com/200x112/333/fff?text=EP${index + 1}" alt="Episódio ${index + 1}">
                            </div>
                            <div class="episode-info">
                                <div class="episode-title">${this.extractEpisodeTitle(ep.name)}</div>
                                <div class="episode-description">Duração: ${this.formatDuration(ep.size || 0)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Extrair título do episódio
    extractEpisodeTitle(filename) {
        const match = filename.match(/S(\d+)E(\d+)/i);
        if (match) {
            return `Episódio ${parseInt(match[2])}`;
        }
        return `Episódio`;
    }

    // Formatar duração
    formatDuration(bytes) {
        // Estimativa baseada no tamanho (simplificada)
        const minutes = Math.round(bytes / (1024 * 1024 * 2)); // ~2MB por minuto
        return `${minutes} min`;
    }

    // Salvar progresso
    salvarProgresso(videoID, tempoAtual, total) {
        let progresso = JSON.parse(localStorage.getItem('paixaoflix_progress')) || [];
        
        progresso = progresso.filter(item => item.id !== videoID);
        
        const percent = (tempoAtual / total) * 100;
        
    loadAllSections() {
        // Dados de exemplo para cada seção
        const sectionsData = {
            'prepare-a-pipoca': [
                { title: 'Avatar - Fogo e Cinzas', year: 2025, rating: 9.1, type: 'movie' },
                { title: 'Capitão América', year: 2025, rating: 8.7, type: 'movie' },
                { title: 'Mundo Jurássico', year: 2025, rating: 8.4, type: 'movie' },
                { title: 'Bob Esponja', year: 2025, rating: 8.9, type: 'movie' }
            ],
            'os-melhores-de-2025': [
                { title: 'Davi - Nasce Um Rei', year: 2025, rating: 8.6, type: 'movie' },
                { title: 'O Falsário', year: 2025, rating: 8.2, type: 'movie' },
                { title: 'Nossa Vizinhança', year: 2025, rating: 8.5, type: 'movie' },
                { title: 'Lupin - Série', year: 2025, rating: 8.8, type: 'series' }
            ],
            'lancamentos-2026': [
                { title: 'Novo Filme 2026', year: 2026, rating: 9.0, type: 'movie' },
                { title: 'Série Inédita', year: 2026, rating: 8.9, type: 'series' },
                { title: 'Animção 2026', year: 2026, rating: 8.7, type: 'kids' }
            ],
            'animacao': [
                { title: 'Bob Esponja', year: 2025, rating: 8.9, type: 'kids' },
                { title: 'Patrulha Canina', year: 2025, rating: 8.2, type: 'kids' },
                { title: 'Homem-Aranha', year: 2025, rating: 9.2, type: 'movie' }
            ],
            'acao': [
                { title: 'Capitão América', year: 2025, rating: 8.7, type: 'movie' },
                { title: 'Vingadores', year: 2025, rating: 9.0, type: 'movie' },
                { title: 'Missão Impossível', year: 2025, rating: 8.8, type: 'movie' }
            ],
            'comedia': [
                { title: 'Comédia 2025', year: 2025, rating: 8.3, type: 'movie' },
                { title: 'Série de Comédia', year: 2025, rating: 8.5, type: 'series' }
            ],
            'drama': [
                { title: 'Drama Intenso', year: 2025, rating: 8.7, type: 'movie' },
                { title: 'Série Dramática', year: 2025, rating: 8.9, type: 'series' }
            ],
            'terror': [
                { title: 'Terror 2025', year: 2025, rating: 7.8, type: 'movie' },
                { title: 'Série de Terror', year: 2025, rating: 8.1, type: 'series' }
            ],
            'ficcao': [
                { title: 'Ficção Científica', year: 2025, rating: 8.6, type: 'movie' },
                { title: 'Série de Ficção', year: 2025, rating: 8.8, type: 'series' }
            ],
            'nacional': [
                { title: 'Filme Brasileiro', year: 2025, rating: 8.4, type: 'movie' },
                { title: 'Série Nacional', year: 2025, rating: 8.6, type: 'series' }
            ],
            'documentario': [
                { title: 'Documentário 2025', year: 2025, rating: 8.5, type: 'documentary' },
                { title: 'Doc Série', year: 2025, rating: 8.7, type: 'documentary' }
            ],
            'kids': [
                { title: 'Desenho Infantil', year: 2025, rating: 8.8, type: 'kids' },
                { title: 'Série Kids', year: 2025, rating: 8.9, type: 'kids' },
                { title: 'Educativo', year: 2025, rating: 8.6, type: 'kids' }
            ]
        };

        // Renderizar cada seção com cards Tailwind
        Object.keys(sectionsData).forEach(sectionKey => {
            this.renderTailwindSection(sectionKey, sectionsData[sectionKey]);
        });
    }

    // Renderizar seção específica com Tailwind
    renderTailwindSection(sectionKey, movies) {
        const row = document.getElementById(`${sectionKey}-row`);
        if (!row) return;

        row.innerHTML = movies.map(movie => `
            <div class="movie-card flex-shrink-0 w-48 cursor-pointer" onclick="paixaoflix.playMedia('${movie.title}')">
                <div class="aspect-video bg-muted rounded-md overflow-hidden relative">
                    <img src="https://via.placeholder.com/300x450/hsl(var(--muted))/000?text=${encodeURIComponent(movie.title.substring(0, 10))}" 
                         alt="${movie.title}" 
                         class="w-full h-full object-cover">
                    <div class="movie-card-info">
                        <div class="text-white font-semibold">${movie.title}</div>
                        <div class="text-white/80 text-sm flex gap-2">
                            ${movie.rating ? `<span>⭐ ${movie.rating}</span>` : ''}
                            ${movie.year ? `<span>${movie.year}</span>` : ''}
                            ${movie.type ? `<span>${this.getTypeLabel(movie.type)}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Renderizar seção específica
    renderSection(sectionKey, movies) {
        const grid = document.getElementById(`${sectionKey}-grid`);
        if (!grid) return;

        grid.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="paixaoflix.playMedia('${movie.title}')">
                <div class="movie-thumbnail">
                    <div class="movie-overlay">
                        <div class="play-btn">▶️</div>
                    </div>
                </div>
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-meta">
                        ${movie.rating ? `<span>⭐ ${movie.rating}</span>` : ''}
                        ${movie.year ? `<span>${movie.year}</span>` : ''}
                        ${movie.type ? `<span>${this.getTypeLabel(movie.type)}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Obter label do tipo
    getTypeLabel(type) {
        const labels = {
            'movie': 'Filme',
            'series': 'Série',
            'kids': 'Kids',
            'documentary': 'Doc'
        };
        return labels[type] || type;
    }

    // Fechar player
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
        
        // Voltar para home sem recarregar a página
        this.renderHome();
    }

    // Buscar mídia por título
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

    // Tocar mídia aleatória
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

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    new PaixaoFlix();
});
