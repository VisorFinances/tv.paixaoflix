# PaixãoFlix Streaming Platform - Custom Domain Setup

## 🌐 **CONFIGURAÇÃO DOMÍNIO CUSTOMIZADO**

### 🎯 **Domínio Configurado:**
- **URL Principal:** `https://tv.paixaoflix.vip`
- **API URL:** `https://api.tv.paixaoflix.vip`
- **Site URL:** `https://tv.paixaoflix.vip`

---

## 🚀 **ALTERAÇÕES REALIZADAS:**

### 📝 **Next.js Config:**
```javascript
// Base path para domínio customizado
basePath: process.env.NODE_ENV === 'production' ? '' : '',
assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

// Environment variables
env: {
  NEXT_PUBLIC_API_URL: 'https://api.tv.paixaoflix.vip',
  NEXT_PUBLIC_SITE_URL: 'https://tv.paixaoflix.vip',
}
```

### 📱 **PWA Manifest:**
```json
{
  "start_url": "/",
  "scope": "/",
  "shortcuts": [
    {"name": "Assistir Filmes", "url": "/filmes"},
    {"name": "Assistir Séries", "url": "/series"},
    {"name": "Kids", "url": "/kids"}
  ]
}
```

### 🔄 **Service Worker:**
```javascript
const urlsToCache = [
  "/",
  "/manifest.json",
  "/data/filmes.json",
  "/data/series.json",
  // ... outros arquivos
];
```

---

## 🌐 **CONFIGURAÇÃO DEPLOY:**

### 📋 **1. Configurar DNS:**
```bash
# Adicionar registro A no domínio tv.paixaoflix.vip
A @ 104.21.144.1
www @ 104.21.144.1
```

### 📋 **2. Configurar Hosting:**
- **Servidor:** Vercel, Netlify, ou similar
- **SSL:** Certificado Let's Encrypt
- **Build:** Static export do Next.js

### 📋 **3. Deploy Commands:**
```bash
# Build para produção
npm run web:build
npm run web:export

# Deploy para servidor
# Copiar conteúdo do /out para servidor web
```

---

## 🎯 **ESTRUTURA DE ARQUIVOS:**

```
paixaoflix-streaming/
├── packages/web/
│   ├── out/                    # 📁 Build estático
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── sw.js
│   │   └── data/           # 📁 Dados reais
│   └── .env.local         # 🔧 Variáveis de ambiente
├── .github/workflows/         # 🚀 CI/CD
└── README.md               # 📖 Documentação
```

---

## 🚀 **PASSOS PARA DEPLOY:**

### 📋 **1. Preparar Ambiente:**
```bash
# Instalar dependências
npm install

# Build para produção
npm run web:build
npm run web:export
```

### 📋 **2. Configurar Servidor:**
```bash
# Copiar arquivos para servidor
rsync -av packages/web/out/* /var/www/tv.paixaoflix.vip/

# Configurar nginx/Apache para servir arquivos estáticos
# Redirecionar todas as rotas para index.html
```

### 📋 **3. Testar Localmente:**
```bash
# Iniciar servidor de desenvolvimento
npm run web:dev

# Acessar em http://localhost:3000
# Verificar se tudo funciona corretamente
```

---

## 🎨 **CONFIGURAÇÕES ADICIONAIS:**

### 🔒 **Nginx Config:**
```nginx
server {
    listen 443 ssl;
    server_name tv.paixaoflix.vip;
    root /var/www/tv.paixaoflix.vip;
    
    # SSL Certificate
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Forçar HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
    
    # Servir arquivos estáticos
    location / {
        try_files $uri $uri/ /index.html =404;
    }
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 📱 **PWA Enhancements:**
```javascript
// Adicionar ao manifest.json
{
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#ffc107",
  "orientation": "portrait-primary"
}
```

---

## 🎯 **BENEFÍCIOS DO DOMÍNIO CUSTOMIZADO:**

### ✅ **Vantagens:**
- 🎯 **URL Profissional:** `tv.paixaoflix.vip`
- 🚀 **Performance:** Servidor dedicado
- 🔒 **SEO Total:** Controle completo
- 📱 **SSL Custom:** Certificado próprio
- 🎨 **Branding:** Identidade única

### 📊 **Analytics:**
- Google Analytics com domínio próprio
- Search Console com URL personalizada
- Métricas de performance específicas

---

## 🎬 **PRÓXIMOS PASSOS:**

1. **Configurar DNS** do domínio
2. **Preparar servidor** web
3. **Build e deploy** da aplicação
4. **Testar** todas as funcionalidades
5. **Monitorar** performance e analytics

---

## 🚀 **SISTEMA PRONTO PARA tv.paixaoflix.vip!**

**✅ Domínio customizado configurado**
**✅ Build estático otimizado**
**✅ PWA completo**
**✅ Conteúdo real integrado**
**✅ Multiplataforma responsivo**

**Agora é só fazer o deploy e aproveitar o domínio profissional!** 🎬✨
