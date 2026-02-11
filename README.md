# 🎬 PaixãoFlix - Plataforma de Streaming

Uma plataforma de streaming completa desenvolvida com HTML5, CSS3 e JavaScript puro, inspirada nos melhores serviços de streaming como Netflix e Disney+.

## ✨ Funcionalidades

### 🎥 **Player de Vídeo Avançado**
- Suporte a múltiplos formatos de vídeo
- Dual áudio e legendas
- Controles premium estilo streaming
- Reprodução adaptativa
- Tela cheia imersiva

### 📺 **Canais ao Vivo**
- Lista M3U integrada
- Canais abertos e premium
- Canais infantis dedicados
- Indicador AO VIVO

### 🎬 **Catálogo Completo**
- Filmes e séries organizados
- Conteúdo infantil separado
- Sistema de favoritos
- Metadados completos

### 🔍 **Busca Inteligente**
- Busca em tempo real
- Filtros por gênero
- Sugestões personalizadas
- Histórico de visualização

### 🎨 **Interface Premium**
- Design escuro moderno
- Animações suaves
- Totalmente responsiva
- Navegação por teclado

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **API**: TMDB (The Movie Database)
- **Streaming**: Archive.org
- **Hospedagem**: GitHub Pages
- **Domínio**: tv.paixaoflix.vip

## 📁 Estrutura do Projeto

```
tv.paixaoflix/
├── index.html              # Aplicação principal
├── data/                   # Dados do conteúdo
│   ├── cinema.json         # Catálogo de filmes
│   ├── séries.json         # Catálogo de séries
│   ├── filmeskids.json     # Filmes infantis
│   ├── sérieskids.json     # Séries infantis
│   ├── canaisaovivo.m3u    # Canais ao vivo
│   ├── canaiskids.m3u      # Canais infantis
│   └── minha_lista.json   # Favoritos do usuário
├── assets/                 # Recursos estáticos
│   ├── images/            # Posters e imagens
│   └── icons/             # Ícones da interface
└── README.md              # Documentação
```

## 🎮 Como Usar

### **Acesso Local**
1. Clone o repositório
2. Abra `index.html` no navegador
3. Aproveite o conteúdo!

### **Navegação**
- **Menu Lateral**: Acesso rápido às categorias
- **Barra de Busca**: Pesquise filmes, séries e canais
- **Teclado**: 
  - `Enter` - Buscar
  - `Esc` - Sair do player
  - `Ctrl+F` - Foco na busca

### **Player**
- **Clique no poster** para iniciar reprodução
- **Controles nativos** do navegador
- **Tela cheia** com botão dedicado
- **Qualidade adaptativa** automática

## 🔧 Configuração

### **API TMDB**
```javascript
const CONFIG = {
  TMDB_API_KEY: 'b275ce8e1a6b3d5d879bb0907e4f56ad',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3'
};
```

### **Archive.org**
O sistema busca automaticamente conteúdo no Archive.org usando os identificadores:
```json
{
  "identificador_archive": "nome-do-item-paixaoflix"
}
```

### **URLs Diretas**
Para vídeos diretos:
```json
{
  "url": "https://exemplo.com/video.mp4"
}
```

## 📱 Compatibilidade

### **Navegadores Suportados**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### **Dispositivos**
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablets (iPad, Android)
- ✅ Smartphones (iOS, Android)
- ✅ Smart TVs (navegadores modernos)

## 🌐 Deploy

### **GitHub Pages**
1. Faça upload para o repositório GitHub
2. Ative GitHub Pages em Settings
3. Configure domínio personalizado
4. Pronto! 🎉

### **Domínio Personalizado**
- CNAME configurado: `tv.paixaoflix.vip`
- SSL automático via GitHub Pages
- CDN global para performance

## 🎨 Personalização

### **Cores e Tema**
```css
:root{
  --bg-primary:#0a0a0f;
  --accent:#007bff;
  --gold:#ffcc00;
  /* ... */
}
```

### **Adicionar Conteúdo**
1. Edite os arquivos JSON em `/data/`
2. Siga o modelo existente
3. Mantenha a estrutura consistente

### **Novas Categorias**
1. Adicione entrada no menu lateral
2. Crie função `loadNovaCategoria()`
3. Adicione arquivo JSON correspondente

## 🚀 Recursos Futuros

- [ ] Sistema de usuários e perfis
- [ ] Recomendações baseadas em IA
- [ ] Download offline
- [ ] Controle parental
- [ ] Legendas personalizadas
- [ ] Qualidade 4K/HD
- [ ] Multi-idiomas
- [ ] Aplicativo mobile

## 📝 Licença

Este projeto é para fins educacionais e demonstração. Respeite os direitos autorais e use apenas conteúdo com permissão adequada.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Faça um fork
2. Crie uma branch
3. Faça commit das mudanças
4. Abra um Pull Request

## 📞 Suporte

- **Issues**: GitHub Issues
- **Email**: contato@paixaoflix.vip
- **Discord**: [Link do servidor]

---

**Desenvolvido com ❤️ para a comunidade streaming**

*PaixãoFlix - Sua plataforma de streaming personalizada*
