// ===== SERVICE WORKER PAIXÃOFLIX DISNEY+ =====
// Versão otimizada para interface Disney+ Premium

const CACHE_NAME = 'paixaoflix-disney-v1';
const STATIC_CACHE = 'paixaoflix-static-v1';

// Arquivos essenciais para cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/data/cinema.json',
    '/favicon.ico',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker PaixãoFlix Disney+ instalado!');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Cacheando arquivos estáticos...');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('❌ Erro ao cachear arquivos:', error);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker PaixãoFlix Disney+ ativado!');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Remover caches antigos
                        if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
                            console.log('🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
});

// Estratégia de Cache: Cache First para arquivos estáticos
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        console.log('📤 SW: Ignorando método não-GET:', request.method, request.url);
        return;
    }
    
    // Ignorar requisições para outros domínios (exceto fonts)
    if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Cache First para arquivos estáticos
                if (response) {
                    console.log('📦 SW: Servindo do cache:', request.url);
                    return response;
                }
                
                // Network First para dados dinâmicos
                if (url.pathname.includes('/data/')) {
                    return fetch(request)
                        .then((networkResponse) => {
                            // Cache de resposta de rede
                            if (networkResponse.ok) {
                                const responseClone = networkResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        console.log('💾 SW: Cacheando resposta:', request.url);
                                        cache.put(request, responseClone);
                                    });
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            console.log('❌ SW: Falha na rede, tentando cache...');
                            return caches.match(request);
                        });
                }
                
                // Fetch normal para outros recursos
                return fetch(request);
            })
            .catch((error) => {
                console.error('❌ SW: Erro no fetch:', error);
                
                // Página offline para navegação
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Sincronização em background (para futuro uso)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-watchlist') {
        console.log('🔄 SW: Sincronizando watchlist...');
        event.waitUntil(syncWatchlist());
    }
});

// Background fetch para pré-carregar conteúdo
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRELOAD_CONTENT') {
        console.log('🎬 SW: Pré-carregando conteúdo...');
        event.waitUntil(preloadContent());
    }
});

// Funções auxiliares
async function syncWatchlist() {
    // Lógica para sincronizar watchlist com servidor
    console.log('📝 Watchlist sincronizada');
}

async function preloadContent() {
    try {
        const response = await fetch('/data/cinema.json');
        const cache = await caches.open(CACHE_NAME);
        await cache.put('/data/cinema.json', response);
        console.log('🎬 Conteúdo pré-carregado');
    } catch (error) {
        console.error('❌ Erro no pré-carregamento:', error);
    }
}

// Limpeza de cache periódica
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cleanup-cache') {
        console.log('🧹 SW: Limpando cache...');
        event.waitUntil(cleanupCache());
    }
});

async function cleanupCache() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    
    for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
                const responseDate = new Date(dateHeader).getTime();
                // Remover itens com mais de 24 horas
                if (now - responseDate > 24 * 60 * 60 * 1000) {
                    await cache.delete(request);
                    console.log('🗑️ Item expirado removido:', request.url);
                }
            }
        }
    }
}

console.log('🎬 Service Worker PaixãoFlix Disney+ carregado!');
