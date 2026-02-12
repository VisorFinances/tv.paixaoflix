# PaixãoFlix - Streaming Premium

Interface de streaming inspirada no Disney+ com funcionalidades premium desenvolvida em HTML5, CSS3 e JavaScript puro.

## 🚀 Funcionalidades Implementadas

### 🎨 Design Disney+ Premium
- **Tema Dark**: Gradiente profundo (Deep Blue/Black) igual ao Disney+
- **Hero Banner Dinâmico**: Transições suaves com destaque para conteúdo em destaque
- **Cards com Efeito Zoom**: Borda brilhante ao focar (TV Friendly)
- **Efeito de Reflexo**: Reflexo brilhante nos cards quando em foco
- **Navegação por Marcas**: Disney, Pixar, Marvel, Star Wars, National Geographic

### 🎮 Sistema de Navegação Premium
- **Controle Total por Teclado**: Navegação completa com setas direcionais
- **Suporte a Controle Remoto**: Otimizado para Smart TVs
- **Foco Geográfico**: Sistema avançado de foco visual
- **Atalhos de Teclado**: ESC para fechar modais, Enter para selecionar

### 🎬 Player de Vídeo Profissional
- **Clappr Player**: Player HTML5 com suporte HLS
- **Buffer Inteligente**: Prevenção de travamentos
- **Auto-Play**: Reprodução automática do próximo conteúdo
- **Progresso Salvo**: Sistema "Continue Assistindo" com LocalStorage

### 📺 Sistema de Trailers
- **Modal Flutuante**: Player do YouTube em modal overlay
- **Conversão Automática**: URL do YouTube → Embed
- **Controle Total**: Play, pause, fullscreen

### 🏷️ Badges e Metadados
- **Badge de Gênero**: Etiqueta estilizada "Animação" acima do título
- **Integração TMDB**: Suporte para buscar backdrops e elenco
- **Rating Estrelas**: Sistema de avaliação visual com estrelas amarelas

### 📚 Gestão de Conteúdo
- **Minha Lista**: Adicionar/remover filmes da watchlist
- **Continue Assistindo**: Salvar progresso de visualização
- **LocalStorage**: Persistência de dados localmente

## 📁 Estrutura do Projeto

```
paixaoflix/
├── index.html          # Página principal (SPA)
├── css/
│   └── styles.css      # Estilos com tema Disney+
├── js/
│   └── app.js          # Lógica principal da aplicação
├── data/
│   └── cinema.json     # Dados dos filmes
├── assets/             # Imagens e recursos
└── README.md           # Documentação
```

## 🎯 Como Usar

### 1. Configuração dos Dados
Edite `data/cinema.json` para adicionar seus filmes:

```json
{
    "titulo": "Nome do Filme",
    "tmdb_id": "12345",
    "url": "URL direta do vídeo",
    "trailer": "URL do trailer no YouTube",
    "genero": ["Animação", "Aventura"],
    "year": "2023",
    "rating": "8.5",
    "desc": "Sinopse do filme",
    "poster": "URL do poster",
    "type": "movie"
}
```

### 2. Navegação por Teclado
- **Setas Direcionais**: Navegar entre cards
- **Enter/Space**: Selecionar item
- **ESC**: Fechar modais
- **Tab**: Navegação padrão

### 3. Funcionalidades Principais
- **Clique no Card**: Abrir detalhes do filme
- **Botão Trailer**: Abrir modal com trailer do YouTube
- **Botão Assistir**: Iniciar reprodução com Clappr
- **Botão + Lista**: Adicionar à watchlist

## 🔧 Tecnologias Utilizadas

- **HTML5**: Semântica moderna e acessibilidade
- **CSS3**: Variáveis CSS, Grid, Flexbox, Animações
- **JavaScript ES6+**: Módulos, async/await, LocalStorage
- **Clappr**: Player de vídeo profissional
- **YouTube API**: Integração para trailers

## 🚀 Deploy no GitHub Pages

1. **Fork** este repositório
2. **Suba** seus arquivos para o repositório
3. **Ative** GitHub Pages em Settings > Pages
4. **Selecione** branch `main` e pasta `/root`
5. **Acesse**: `https://[seu-usuario].github.io/paixaoflix`

## 🎨 Personalização

### Cores e Tema
Edite as variáveis CSS em `css/styles.css`:

```css
:root {
    --primary-bg: #0c111b;      /* Fundo principal */
    --accent-color: #0063e5;    /* Cor de destaque */
    --text-primary: #f9f9f9;    /* Texto principal */
}
```

### Marcas e Filtros
Modifique a lógica de filtragem em `js/app.js`:

```javascript
const brandFilters = {
    'disney': (movie) => /* sua lógica */,
    'pixar': (movie) => /* sua lógica */,
    // ...
};
```

## 📱 Responsividade

- **Desktop**: Experiência completa com navegação avançada
- **Tablet**: Layout adaptado com touch-friendly
- **Mobile**: Interface otimizada para telas pequenas

## 🎯 Features Futuras

- [ ] Sistema de busca avançada
- [ ] Perfil de usuário múltiplo
- [ ] Download offline
- [ ] Legendas e áudio múltiplo
- [ ] Recomendações baseadas em IA

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch: `git checkout -b feature/nova-feature`
3. **Commit** suas mudanças: `git commit -m 'Add nova feature'`
4. **Push**: `git push origin feature/nova-feature`
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para a comunidade PaixãoFlix**
