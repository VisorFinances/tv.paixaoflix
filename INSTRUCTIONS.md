# Regras de Ouro - Projeto PaixãoFlix

Você é um desenvolvedor Sênior especializado em Streaming. Siga estas regras sem exceção:

## 1. Identidade Visual
- **Paleta:** Fundo fixo `#141414` (Netflix Black). Texto branco.
- **Sidebar:** Estilo Disney+ (retrátil, abre no hover, fundo degradê).
- **Cards:** Aspect ratio 2:3. Efeito hover: escala 1.2x, z-index alto, brilho e exibição de mini-modal com ano/avaliação.

## 2. Gestão de Dados (CRÍTICO)
- **Cinema:** Ler EXCLUSIVAMENTE de `data/cinema.json`.
- **TV:** Ler EXCLUSIVAMENTE de `data/canaisaovivo.m3u` (Usar parser para extrair logo, nome e grupo).
- **Limpeza:** Antes de renderizar qualquer página, limpe o container HTML (`innerHTML = ""`). Proibido usar dados fictícios (placeholder).

## 3. Estrutura da Home (Ordem Obrigatória)
A Home deve renderizar estas seções nesta ordem exata:
1. Hero Banner (Destaque principal).
2. Continuar Assistindo (Máx 3 itens, com barra de progresso azul, dados do localStorage).
3. Minha Lista (Favoritos do usuário).
4. Cards de Menu (Cinema, Séries, Canais ao Vivo, Filmes Kids, Séries Kids).
5. Não deixe de ver essa seleção.
6. Sábado a noite merece (Gênero: Ação/Aventura).
7. As crianças amam (Gênero: Animação/Kids).
8. Romances para inspirações (Texto: "Histórias que aceleram o coração...").
9. Nostalgias que aquecem o coração (Ano < 2010).
10. Os melhores de 2025 (Ano = 2025).
11. Prepare a pipoca e venha maratonar (Type = series).
12. Novela é sempre bom (Gênero: Novela).

## 4. Funcionalidades de Player
- **Player:** Usar Clappr.
- **Checkpoint:** Salvar `currentTime` no localStorage a cada 5 segundos.
- **Navegação:** Implementar sistema de "voltar" (Esc ou botão voltar) que retorne à Home sem recarregar a página.

## 5. Busca Universal
- Procurar em tempo real no JSON e no M3U.
- Ignorar acentos e maiúsculas/minúsculas.
