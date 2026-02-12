# 🚀 Deploy GitHub Pages - PaixãoFlix

## 📋 Passos para Deploy

### 1. Criar Repositório GitHub
1. Acesse: https://github.com/VisorFinances
2. Clique em "New repository"
3. **Repository name**: `paixaoflix`
4. **Description**: "Interface Disney+ completa com streaming premium"
5. **Public**: ✅
6. **Add README**: ❌ (já existe)
7. Clique em "Create repository"

### 2. Conectar e Push
```bash
# Se já criou o repositório, execute:
git push -u origin main
```

### 3. Ativar GitHub Pages
1. No repositório, vá em **Settings > Pages**
2. **Source**: Selecione "Deploy from a branch"
3. **Branch**: `main`
4. **Folder**: `/root`
5. Clique em **Save**

### 4. Acessar Site
- URL: https://visorfinances.github.io/paixaoflix

## 🔄 Fluxo de Trabalho Futuro

### Para fazer alterações:
```bash
# 1. Fazer alterações nos arquivos
# 2. Adicionar mudanças
git add .

# 3. Commit com descrição clara
git commit -m "feat: descrição da alteração"

# 4. Push automático para GitHub
git push
```

### Monitoramento em tempo real:
- Cada `git push` atualiza automaticamente o site
- GitHub Pages faz deploy automático
- Demora ~1-2 minutos para refletir mudanças

## 📁 Estrutura Publicada
```
paixaoflix/
├── index.html          # Página principal
├── css/styles.css      # Estilos Disney+
├── js/app.js          # Lógica principal
├── data/cinema.json   # Dados dos filmes
└── README.md          # Documentação
```

## 🎯 Features Deployadas
✅ Interface Disney+ completa  
✅ Navegação por teclado/controle  
✅ Player Clappr com HLS  
✅ Modal de trailer YouTube  
✅ Sistema de watchlist  
✅ Continue assistindo  
✅ Badges de gênero  
✅ Efeito reflexo cards  
✅ Responsivo TV-friendly  

---

**Após criar o repositório, toda alteração será publicada automaticamente!**
