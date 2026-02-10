# PaixãoFlix Streaming Platform

🎬 **Sistema de Streaming Multiplataforma com Domínio Customizado**

## 🌐 **DOMÍNIO OFICIAL**

- **🎬 App Principal:** https://tv.paixaoflix.vip
- **🔗 API Backend:** https://api.tv.paixaoflix.vip
- **📱 PWA Instalável:** https://tv.paixaoflix.vip/manifest.json

---

## 🚀 **Deploy em Tempo Real**

Este projeto está configurado para **deploy automático** com desenvolvimento em tempo real:

### 📋 **Branches e Ambientes:**

- **`main`** → Produção: `https://tv.paixaoflix.vip`
- **`develop`** → Preview: `https://tv.paixaoflix.vip` (preview)
- **`feature/*`** → Preview automático para cada feature

### ⚡ **Como Funciona:**

1. **Faça um push** para qualquer branch
2. **GitHub Actions** build automaticamente
3. **Deploy instantâneo** no servidor
4. **Acompanhe em tempo real** no link do preview

---

## 🛠️ **Estrutura do Projeto**

```
paixaoflix-streaming/
├── packages/
│   ├── web/                   # 🌐 App Next.js
│   │   ├── app/               # 📄 Páginas
│   │   ├── data/              # 📁 Dados reais
│   │   ├── public/            # 🌐 Assets estáticos
│   │   │   ├── manifest.json   # 📱 PWA manifest
│   │   │   ├── browserconfig.xml # 🪟 Windows tiles
│   │   │   └── sw.js          # 🔄 Service worker
│   │   ├── styles/            # 🎨 CSS/Tailwind
│   │   ├── next.config.js     # ⚙️ Next.js config
│   │   └── tsconfig.json      # 📝 TypeScript
│   └── shared/               # 🔧 Core compartilhado
├── .github/workflows/         # 🚀 CI/CD
├── README.md                  # 📖 Documentação
├── DOMAIN_SETUP.md           # 🌐 Guia de domínio
└── package.json              # 📦 Configuração monorepo
```

---

## 📺 **Plataformas Suportadas**

- ✅ **Web/PWA** - Domínio customizado
- ✅ **Mobile** - Responsive Design
- ✅ **Android TV** - Otimizado para controle remoto
- ✅ **Samsung TV** - Tizen compatibility
- ✅ **LG TV** - webOS support
- ✅ **Roku** - Channel ready
- ✅ **Apple TV** - tvOS compatible
- ✅ **Fire TV** - Amazon ready

---

## � **Conteúdo Real Integrado**

### 📁 **Fontes de Dados:**
- **TMDB API** - `b275ce8e1a6b3d5d879bb0907e4f56ad`
- **Filmes** - `data/filmes.json`
- **Séries** - `data/series.json`
- **Kids** - `data/kids_filmes.json`, `data/kids_series.json`
- **Canais** - `data/ativa_canais.m3u`, `data/ativa_kids_canais.m3u`
- **Favoritos** - `data/favoritos.json`

### 🎯 **Features Implementadas:**
- 🔥 **Em Alta Agora** - Trending content
- 🎬 **Lançamentos** - New releases
- 📺 **Séries** - Series com temporadas
- 👶 **Kids** - Conteúdo infantil
- 📡 **Canais ao Vivo** - M3U streaming
- 🔍 **Busca Avançada** - Search & filters
- ⭐ **Ratings** - TMDB integration
- 🎨 **UI Responsiva** - Multiplataforma

---

## 🚀 **Desenvolvimento Local**

### 📋 **Pré-requisitos:**
- Node.js 18+
- npm ou yarn

### ⚡ **Setup:**
```bash
# Clonar repositório
git clone https://github.com/paixaoflix/paixaoflix-streaming.git
cd paixaoflix-streaming

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run web:dev
```

### 🌐 **Acessar Local:**
```
http://localhost:3000
```

---

## 🔄 **Workflow de Desenvolvimento**

### 📝 **1. Criar Nova Feature:**
```bash
# Criar branch de feature
git checkout -b feature/nova-funcionalidade

# Fazer as alterações
# ... codificar ...

# Commit e push
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 🚀 **2. Deploy Automático:**
- GitHub Actions build automaticamente
- Preview disponível em segundos
- Teste no ambiente de preview

### ✅ **3. Merge para Produção:**
```bash
# Se tudo estiver ok, merge para main
git checkout main
git merge feature/nova-funcionalidade
git push origin main
```

---

## 🎯 **Links Importantes**

### 🌐 **Produção:**
- **App:** https://tv.paixaoflix.vip
- **API:** https://api.tv.paixaoflix.vip
- **GitHub:** https://github.com/paixaoflix/paixaoflix-streaming

### 📊 **Monitoramento:**
- **GitHub Actions:** https://github.com/paixaoflix/paixaoflix-streaming/actions
- **Deploy Status:** https://github.com/paixaoflix/paixaoflix-streaming/deployments

---

## 🛠️ **Tecnologias Utilizadas**

### 🎨 **Frontend:**
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Zustand** - State management

### 🚀 **Deploy:**
- **Static Export** - Servidor dedicado
- **GitHub Actions** - CI/CD
- **Custom Domain** - tv.paixaoflix.vip

### 📺 **Streaming:**
- **HLS.js** - Adaptive streaming
- **Video.js** - Video player
- **TMDB API** - Movie database
- **M3U Parser** - Live channels

---

## 🎬 **Próximos Passos**

1. **Acompanhar o desenvolvimento** em tempo real
2. **Testar features** no ambiente de preview
3. **Fazer merge** para produção quando pronto
4. **Expandir para outras plataformas** (mobile, TV apps)

---

## 📞 **Suporte**

- 📧 **Issues:** https://github.com/paixaoflix/paixaoflix-streaming/issues
- 💬 **Discussions:** https://github.com/paixaoflix/paixaoflix-streaming/discussions
- 📱 **Contato:** [seu-contato]

---

**🎬 PaixãoFlix Pro Max - Sua central de entretenimento definitiva em tv.paixaoflix.vip!**
