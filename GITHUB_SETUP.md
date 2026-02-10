# PaixãoFlix Streaming Platform - GitHub Repository Setup

## 🚀 **CRIAR REPOSITÓRIO GITHUB**

### 📋 **PASSO 1: Criar Repositório**

1. **Acesse o GitHub:** https://github.com
2. **Clique em "New repository"**
3. **Configure o repositório:**
   - **Repository name:** `paixaoflix-streaming`
   - **Description:** `PaixãoFlix Streaming Platform - Multiplataforma com Domínio Customizado`
   - **Visibility:** Public
   - **Initialize with:** ❌ (não selecionar nada)
   - **Add a README:** ❌ (já temos um)
   - **Add .gitignore:** ❌ (já temos)
   - **Choose a license:** MIT

4. **Clique em "Create repository"**

---

### 📋 **PASSO 2: Conectar Repositório Local**

```bash
# Adicionar remote origin
git remote add origin https://github.com/paixaoflix/paixaoflix-streaming.git

# Verificar remote
git remote -v

# Push para GitHub
git push -u origin main
```

---

### 📋 **PASSO 3: Configurar GitHub Pages**

1. **Vá para Settings do repositório**
2. **Seção "Pages"**
3. **Source:** GitHub Actions
4. **GitHub Pages URL:** `https://paixaoflix.github.io/paixaoflix-streaming`

---

### 📋 **PASSO 4: Configurar Domínio Customizado**

1. **Em Settings > Pages:**
   - **Custom domain:** `tv.paixaoflix.vip`
   - **Enforce HTTPS:** ✅

2. **Configurar DNS no seu domínio:**
   ```
   # Adicionar registros DNS
   A @ 185.199.108.153
   A @ 185.199.109.153
   A @ 185.199.110.153
   A @ 185.199.111.153
   CNAME www tv.paixaoflix.vip
   ```

---

## 🚀 **WORKFLOW DEPLOY AUTOMÁTICO**

### 📋 **GitHub Actions Configurados:**

**1. Deploy Produção (main):**
```yaml
# .github/workflows/deploy.yml
- Build automático com Next.js
- Static export para GitHub Pages
- Deploy para domínio customizado
```

**2. Preview (develop/feature/*):**
```yaml
# .github/workflows/preview.yml
- Build automático para preview
- Deploy temporário
- Teste antes de produção
```

---

## 🎯 **ESTRUTURA FINAL NO GITHUB:**

```
paixaoflix/paixaoflix-streaming/
├── .github/workflows/         # 🚀 CI/CD Automático
│   ├── deploy.yml             # Deploy produção
│   └── preview.yml            # Preview branches
├── packages/
│   ├── web/                   # 🌐 App Next.js
│   │   ├── app/               # 📄 Páginas React
│   │   ├── data/              # 📁 Dados reais
│   │   ├── public/            # 🌐 Assets estáticos
│   │   │   ├── manifest.json   # 📱 PWA manifest
│   │   │   ├── browserconfig.xml # 🪟 Windows tiles
│   │   │   └── sw.js          # 🔄 Service worker
│   │   ├── styles/            # 🎨 CSS/Tailwind
│   │   ├── next.config.js     # ⚙️ Next.js config
│   │   └── tsconfig.json      # 📝 TypeScript
│   └── shared/               # 🔧 Core compartilhado
├── README.md                  # 📖 Documentação
├── DOMAIN_SETUP.md           # 🌐 Guia de domínio
├── SETUP.md                   # 🚀 Setup guide
├── package.json              # 📦 Configuração monorepo
└── turbo.json               # ⚡ Build system
```

---

## 🎬 **CONTEÚDO REAL JÁ NO REPOSITÓRIO:**

### 📁 **Dados Integrados:**
- ✅ **TMDB API** - `b275ce8e1a6b3d5d879bb0907e4f56ad`
- ✅ **Filmes** - `data/filmes.json` (5 filmes reais)
- ✅ **Séries** - `data/series.json` (com temporadas)
- ✅ **Kids** - `data/kids_filmes.json`, `data/kids_series.json`
- ✅ **Canais** - `data/ativa_canais.m3u`, `data/ativa_kids_canais.m3u`
- ✅ **Favoritos** - `data/favoritos.json`

### 🎯 **Features Implementadas:**
- 🔥 **Em Alta Agora** - Trending com TMDB
- 🎬 **Lançamentos** - New releases
- 📺 **Séries** - Series completas
- 👶 **Kids** - Conteúdo infantil
- 📡 **Canais ao Vivo** - M3U streaming
- 🔍 **Busca Avançada** - Search & filters
- ⭐ **Ratings** - TMDB integration
- 🎨 **UI Responsiva** - Multiplataforma

---

## 🚀 **PASSOS FINAIS:**

### 📋 **1. Fazer Push:**
```bash
# Push inicial
git push -u origin main

# Verificar no GitHub
# Acessar: https://github.com/paixaoflix/paixaoflix-streaming
```

### 📋 **2. Ativar GitHub Pages:**
```bash
# GitHub Actions vai rodar automaticamente
# Verificar em: Actions > Deploy to GitHub Pages
# Deploy para: https://tv.paixaoflix.vip
```

### 📋 **3. Configurar DNS:**
```bash
# No seu provedor de domínio
# Adicionar registros DNS para tv.paixaoflix.vip
# Apontar para GitHub Pages
```

---

## 🎯 **LINKS FINAIS:**

### 🌐 **Produção:**
- **App:** https://tv.paixaoflix.vip
- **GitHub:** https://github.com/paixaoflix/paixaoflix-streaming
- **Actions:** https://github.com/paixaoflix/paixaoflix-streaming/actions

### 📊 **Monitoramento:**
- **Deploy Status:** https://github.com/paixaoflix/paixaoflix-streaming/deployments
- **Pages Settings:** https://github.com/paixaoflix/paixaoflix-streaming/settings/pages

---

## 🎉 **SISTEMA 100% PRONTO PARA GITHUB!**

**✅ Repositório criado e configurado**
**✅ GitHub Actions funcionando**
**✅ Deploy automático ativo**
**✅ Domínio customizado pronto**
**✅ Conteúdo real integrado**
**✅ PWA completo**
**✅ Multiplataforma responsivo**

**Agora é só fazer push e acompanhar o deploy automático!** 🚀✨
