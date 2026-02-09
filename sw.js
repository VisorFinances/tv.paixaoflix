// Service Worker PaixãoFlix Pro Max
// Cache inteligente para performance e funcionamento offline

const CACHE_NAME = 'paixaoflix-v1.2.0';
const STATIC_CACHE = 'paixaoflix-static-v1.2.0';
const DYNAMIC_CACHE = 'paixaoflix-dynamic-v1.2.0';

// Arquivos essenciais para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/paixaoflix.js',
  '/performance-optimizations.js',
  '/manifest.json',
  'https://raw.githubusercontent.com/VisorFinances/lista-paixaoflix/refs/heads/main/logo192.png',
  'https://raw.githubusercontent.com/VisorFinances/lista-paixaoflix/refs/heads/main/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/clappr/0.3.122/clappr.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap'
];

// Arquivos de dados para cache dinâmico
const DATA_ASSETS = [
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/data/filmes.json',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/data/series.json',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/data/kids_filmes.json',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/data/kids_series.json',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/data/ativa_canais.m3u',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/data/kids_canais.m3u'
];

// Instalação - Cache estático
self.addEventListener('install', event => {
  console.log('🚀 SW: Instalando PaixãoFlix PWA...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 SW: Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ SW: Cache estático concluído!');
        return self.skipWaiting(); // Força ativação imediata
      })
      .catch(error => {
        console.error('❌ SW: Erro no cache estático:', error);
      })
  );
});

// Ativação - Limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('🔄 SW: Ativando nova versão...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ SW: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ SW: Ativação concluída!');
        return self.clients.claim(); // Assume controle imediato
      })
  );
});

// Interceptação de requisições - Estratégia inteligente
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições Chrome DevTools e extensões
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Estratégia para diferentes tipos de conteúdo
  if (STATIC_ASSETS.includes(url.pathname) || url.href.includes('paixaoflix')) {
    // Cache First para arquivos estáticos
    event.respondWith(cacheFirst(request));
  } else if (DATA_ASSETS.some(dataUrl => url.href.includes(dataUrl))) {
    // Stale While Revalidate para dados JSON
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.href.includes('tmdb.org') || url.href.includes('archive.org')) {
    // Network First para APIs externas
    event.respondWith(networkFirst(request));
  } else if (url.href.includes('.m3u8') || url.href.includes('.mp4')) {
    // Network Only para streams de vídeo
    event.respondWith(networkOnly(request));
  } else {
    // Cache First com fallback para outros recursos
    event.respondWith(cacheFirstWithFallback(request));
  }
});

// Estratégia: Cache First
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log('📦 SW: Servindo do cache:', request.url);
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('❌ SW: Erro no cacheFirst:', error);
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    // Buscar em background
    const fetchPromise = fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(error => {
        console.warn('⚠️ SW: Falha na atualização:', error);
      });
    
    // Retornar cache imediatamente se disponível
    if (cached) {
      console.log('📦 SW: Servindo dados do cache:', request.url);
      return cached;
    }
    
    // Esperar pela rede se não houver cache
    return await fetchPromise;
  } catch (error) {
    console.error('❌ SW: Erro no staleWhileRevalidate:', error);
    throw error;
  }
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('⚠️ SW: Falha na rede, tentando cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Estratégia: Network Only
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('❌ SW: Falha no stream:', error);
    throw error;
  }
}

// Estratégia: Cache First com Fallback
async function cacheFirstWithFallback(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('⚠️ SW: Servindo página offline:', request.url);
    
    // Página offline personalizada
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PaixãoFlix - Offline</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background: #0a0a0a;
              color: #fff;
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .offline-container {
              max-width: 400px;
              padding: 40px;
            }
            .offline-icon {
              font-size: 4rem;
              color: #ffc107;
              margin-bottom: 20px;
            }
            h1 {
              color: #ffc107;
              margin-bottom: 20px;
            }
            p {
              color: #b3b3b3;
              line-height: 1.6;
            }
            .retry-btn {
              background: #ffc107;
              color: #000;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
              transition: all 0.3s;
            }
            .retry-btn:hover {
              background: #ff6b6b;
              transform: scale(1.05);
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>PaixãoFlix Offline</h1>
            <p>Você está offline. Verifique sua conexão e tente novamente.</p>
            <p>Alguns conteúdos podem estar disponíveis no cache.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Tentar Novamente
            </button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Mensagens do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Background Sync para dados (opcional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('🔄 SW: Sincronizando dados em background...');
    
    // Atualizar cache dos arquivos de dados
    const cache = await caches.open(DYNAMIC_CACHE);
    for (const dataUrl of DATA_ASSETS) {
      try {
        const response = await fetch(dataUrl);
        if (response.ok) {
          await cache.put(dataUrl, response);
          console.log('✅ SW: Dado sincronizado:', dataUrl);
        }
      } catch (error) {
        console.warn('⚠️ SW: Falha na sincronização:', dataUrl, error);
      }
    }
    
    console.log('✅ SW: Sincronização concluída!');
  } catch (error) {
    console.error('❌ SW: Erro na sincronização:', error);
  }
}

console.log('🚀 Service Worker PaixãoFlix Pro Max carregado!');
