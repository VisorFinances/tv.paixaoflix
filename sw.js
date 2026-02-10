// Service Worker - PaixãoFlix Pro Max V4
const CACHE_VERSION = '1.2.0';
const STATIC_CACHE = `paixaoflix-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `paixaoflix-dynamic-v${CACHE_VERSION}`;

// Arquivos essenciais para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/paixaoflix.js',
  '/manifest.json',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/logoof512.png',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/icon-192.png',
  'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('🚀 SW: Instalando Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 SW: Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ SW: Instalação concluída');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ SW: Erro na instalação:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('🔄 SW: Ativando Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('paixaoflix-') && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => {
              console.log('🗑️ SW: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ SW: Ativação concluída');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('❌ SW: Erro na ativação:', error);
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Estratégias baseadas no tipo de requisição
  if (url.origin === self.location.origin) {
    // Recursos do próprio site
    if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
      // Cache First para recursos estáticos
      event.respondWith(cacheFirst(request));
    } else {
      // Cache First com fallback para outros recursos
      event.respondWith(cacheFirstWithFallback(request));
    }
  } else if (url.hostname.includes('raw.githubusercontent.com')) {
    // Stale While Revalidate para dados externos
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.hostname.includes('themoviedb.org')) {
    // Network First para API
    event.respondWith(networkFirst(request));
  } else {
    // Stream para vídeos e outros
    event.respondWith(streamHandler(request));
  }
});

// Estratégia: Cache First
async function cacheFirst(request) {
  try {
    // Verificação adicional de segurança
    if (!request || !request.method) {
      console.error('❌ SW: Requisição inválida em cacheFirst');
      return new Response('Invalid Request', { status: 400 });
    }
    
    // Não cachear requisições POST/PUT/DELETE
    if (request.method !== 'GET') {
      console.log('📤 SW: Ignorando método não-GET em cacheFirst:', request.method, request.url);
      return await fetch(request);
    }
    
    console.log('🔍 SW: cacheFirst - Verificando cache para:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      console.log('📦 SW: Servindo do cache:', request.url);
      return cached;
    }
    
    console.log('🌐 SW: Buscando da rede:', request.url);
    const response = await fetch(request);
    
    if (response.ok && response.status === 200) {
      console.log('💾 SW: Adicionando ao cache:', request.url);
      const cache = await caches.open(STATIC_CACHE);
      // Verificar se a requisição é válida para cache
      try {
        await cache.put(request, response.clone());
        console.log('✅ SW: Cache adicionado com sucesso:', request.url);
      } catch (cacheError) {
        console.warn('⚠️ SW: Erro ao adicionar ao cache:', cacheError.message);
        // Continuar mesmo se o cache falhar
      }
    } else {
      console.warn('⚠️ SW: Resposta não OK para cache:', response.status, request.url);
    }
    
    return response;
  } catch (error) {
    console.error('❌ SW: Erro no cacheFirst:', error);
    console.error('❌ SW: Detalhes do erro:', {
      url: request?.url,
      method: request?.method,
      error: error.message
    });
    throw error;
  }
}

// Estratégia: Cache First com Fallback
async function cacheFirstWithFallback(request) {
  try {
    // Verificação adicional de segurança
    if (!request || !request.method) {
      console.error('❌ SW: Requisição inválida em cacheFirstWithFallback');
      return new Response('Invalid Request', { status: 400 });
    }
    
    // Não cachear requisições POST/PUT/DELETE
    if (request.method !== 'GET') {
      console.log('📤 SW: Ignorando método não-GET (fallback):', request.method, request.url);
      return await fetch(request);
    }
    
    console.log('🔍 SW: cacheFirstWithFallback - Verificando cache para:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      console.log('📦 SW: Servindo do cache (fallback):', request.url);
      return cached;
    }
    
    console.log('🌐 SW: Buscando da rede (fallback):', request.url);
    const response = await fetch(request);
    
    if (response.ok && response.status === 200) {
      console.log('💾 SW: Adicionando ao cache (fallback):', request.url);
      const cache = await caches.open(DYNAMIC_CACHE);
      try {
        await cache.put(request, response.clone());
        console.log('✅ SW: Cache adicionado com sucesso (fallback):', request.url);
      } catch (cacheError) {
        console.warn('⚠️ SW: Erro ao adicionar ao cache (fallback):', cacheError.message);
        // Continuar mesmo se o cache falhar
      }
    } else {
      console.warn('⚠️ SW: Resposta não OK para cache (fallback):', response.status, request.url);
    }
    
    return response;
  } catch (error) {
    console.warn('⚠️ SW: Servindo página offline (fallback):', request.url);
    
    // Página offline personalizada
    return new Response(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - PaixãoFlix</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #0a0a0a;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
          }
          .offline-container {
            max-width: 400px;
            padding: 40px;
            background: #1a1a1a;
            border-radius: 12px;
            border: 2px solid #ffc107;
          }
          .offline-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #ffc107;
            margin-bottom: 20px;
          }
          p {
            color: #999;
            margin-bottom: 30px;
            line-height: 1.6;
          }
          .retry-btn {
            background: #ffc107;
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
          .retry-btn:hover {
            background: #ff6b6b;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1>PaixãoFlix Offline</h1>
          <p>Você está offline. Verifique sua conexão com a internet e tente novamente.</p>
          <button class="retry-btn" onclick="window.location.reload()">
            🔄 Tentar Novamente
          </button>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  try {
    // Verificação adicional de segurança
    if (!request || !request.method) {
      console.error('❌ SW: Requisição inválida em staleWhileRevalidate');
      return new Response('Invalid Request', { status: 400 });
    }
    
    // Não cachear requisições POST/PUT/DELETE
    if (request.method !== 'GET') {
      console.log('📤 SW: Ignorando método não-GET (stale):', request.method, request.url);
      return await fetch(request);
    }
    
    console.log('🔍 SW: staleWhileRevalidate - Verificando cache para:', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    // Buscar em background
    const fetchPromise = fetch(request)
      .then(response => {
        if (response.ok && response.status === 200) {
          console.log('💾 SW: Atualizando cache (stale):', request.url);
          try {
            cache.put(request, response.clone());
            console.log('✅ SW: Cache atualizado com sucesso (stale):', request.url);
          } catch (cacheError) {
            console.warn('⚠️ SW: Erro ao atualizar cache (stale):', cacheError.message);
          }
        }
        return response;
      })
      .catch(error => {
        console.warn('⚠️ SW: Falha na atualização (stale):', error);
        throw error;
      });
    
    // Retornar cache imediatamente se disponível
    if (cached) {
      console.log('📦 SW: Stale-While-Revalidate (cache):', request.url);
      // Atualizar em background
      fetchPromise.catch(() => {}); // Ignorar erros de background
      return cached;
    }
    
    // Se não tem cache, esperar a resposta
    console.log('🌐 SW: Stale-While-Revalidate (network):', request.url);
    return await fetchPromise;
  } catch (error) {
    console.error('❌ SW: Erro no staleWhileRevalidate:', error);
    console.error('❌ SW: Detalhes do erro (stale):', {
      url: request?.url,
      method: request?.method,
      error: error.message
    });
    throw error;
  }
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    // Verificação adicional de segurança
    if (!request || !request.method) {
      console.error('❌ SW: Requisição inválida em networkFirst');
      return new Response('Invalid Request', { status: 400 });
    }
    
    // Não cachear requisições POST/PUT/DELETE
    if (request.method !== 'GET') {
      console.log('📤 SW: Ignorando método não-GET (network):', request.method, request.url);
      return await fetch(request);
    }
    
    console.log('🔍 SW: networkFirst - Buscando da rede:', request.url);
    
    const response = await fetch(request);
    
    if (response.ok && response.status === 200) {
      console.log('💾 SW: Adicionando ao cache (network):', request.url);
      const cache = await caches.open(DYNAMIC_CACHE);
      try {
        await cache.put(request, response.clone());
        console.log('✅ SW: Cache adicionado com sucesso (network):', request.url);
      } catch (cacheError) {
        console.warn('⚠️ SW: Erro ao adicionar ao cache (network):', cacheError.message);
        // Continuar mesmo se o cache falhar
      }
    } else {
      console.warn('⚠️ SW: Resposta não OK para cache (network):', response.status, request.url);
    }
    
    return response;
  } catch (error) {
    console.warn('⚠️ SW: Falha na rede, tentando cache (network):', request.url);
    
    // Tentar servir do cache se a rede falhar
    try {
      const cached = await caches.match(request);
      if (cached) {
        console.log('📦 SW: Servindo do cache (fallback network):', request.url);
        return cached;
      }
    } catch (cacheError) {
      console.warn('⚠️ SW: Erro ao acessar cache (network):', cacheError.message);
    }
    
    console.error('❌ SW: Erro no networkFirst:', error);
    console.error('❌ SW: Detalhes do erro (network):', {
      url: request?.url,
      method: request?.method,
      error: error.message
    });
    
    throw error;
  }
}

// Estratégia: Stream Handler
async function streamHandler(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('❌ SW: Falha no stream:', error);
    throw error;
  }
}

// Background Sync para atualização de dados
self.addEventListener('sync', event => {
  if (event.tag === 'data-sync') {
    console.log('🔄 SW: Background sync iniciado');
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados
      Promise.resolve()
    );
  }
});

// Push Notifications
self.addEventListener('push', event => {
  console.log('📬 SW: Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: 'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/icon-192.png',
    badge: 'https://raw.githubusercontent.com/paixaoflix-mobile/paixaoflix-mobile/main/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('PaixãoFlix', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  console.log('🖱️ SW: Notification clicada');
  
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

console.log('🚀 Service Worker PaixãoFlix Pro Max V4 carregado!');
