---
name: Prestek Intranet
description: Portal interno da Prestek Telecom. Laranja da marca como sinal raro sobre superfícies azul-gelo, com quatro temas escuros.
colors:
  laranja-prestek: "#EC7D23"
  laranja-prestek-hover: "#C2410C"
  laranja-prestek-profundo: "#7C2D12"
  laranja-prestek-suave: "#FFF7ED"
  laranja-prestek-pessego: "#FDBA74"
  azul-gelo: "#F5F9FF"
  branco-superficie: "#FFFFFF"
  azul-gelo-elevado: "#F7FAFD"
  borda-gelo: "#E4ECF5"
  borda-sutil: "#EFF4FA"
  azul-profundo: "#0B1B2E"
  azul-mesclado: "#475467"
  azul-neblina: "#8896A8"
  azul-informativo: "#2563EB"
  violeta-auditoria: "#8B5CF6"
  verde-ok: "#1F8A5B"
  verde-ok-texto: "#10603E"
  verde-ok-suave: "#E6F4EC"
  amarelo-aviso: "#CA8A04"
  amarelo-aviso-texto: "#7A5300"
  amarelo-aviso-suave: "#FEFCE8"
  vermelho-alerta: "#E84545"
  vermelho-alerta-texto: "#B02121"
  vermelho-alerta-suave: "#FDEDED"
  anel-foco: "rgba(236, 125, 35, 0.35)"
  laranja-brasa: "#F97316"
  laranja-aurora: "#FB923C"
  noite-bento: "#070B13"
  noite-aurora: "#0F0C20"
  noite-amoled: "#000000"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
  overline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  card: "20px"
  hero: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.laranja-prestek}"
    textColor: "{colors.branco-superficie}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.laranja-prestek-hover}"
    textColor: "{colors.branco-superficie}"
  button-secondary:
    backgroundColor: "{colors.branco-superficie}"
    textColor: "{colors.azul-mesclado}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.azul-gelo-elevado}"
    textColor: "{colors.azul-profundo}"
  chip-filter:
    backgroundColor: "{colors.branco-superficie}"
    textColor: "{colors.azul-mesclado}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  chip-filter-active:
    backgroundColor: "{colors.laranja-prestek-suave}"
    textColor: "{colors.laranja-prestek}"
  card-bento:
    backgroundColor: "{colors.branco-superficie}"
    textColor: "{colors.azul-profundo}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  input-field:
    backgroundColor: "{colors.branco-superficie}"
    textColor: "{colors.azul-profundo}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  nav-item:
    backgroundColor: "{colors.branco-superficie}"
    textColor: "{colors.azul-neblina}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  nav-item-active:
    backgroundColor: "{colors.laranja-prestek-suave}"
    textColor: "{colors.laranja-prestek}"
  badge-count:
    backgroundColor: "{colors.laranja-prestek}"
    textColor: "{colors.branco-superficie}"
    typography: "{typography.overline}"
    rounded: "{rounded.pill}"
    padding: "0 6px"
    height: "18px"
---

# Design System: Prestek Intranet

## Overview

**Creative North Star: "Sinal Quente sobre Gelo"**

O portal é a superfície fria e limpa por onde o sinal da Prestek corre. O azul-gelo (#F5F9FF) e o branco são o fundo de quase tudo; o laranja da marca é o sinal, e sinal é raro por definição: aparece onde há ação, estado ativo, contagem ou foco, e em nenhum outro lugar. Os anéis concêntricos que saem do canto dos heroes de Cobertura e Serviços são a expressão literal disso, propagação de sinal como decoração que significa alguma coisa. O calor da marca vem desse contraste, não de fundos quentes: o antigo bege foi retirado do sistema e não volta.

É um produto do modo Operar. Colaboradores da empresa inteira o abrem várias vezes por dia para conferir plantão, ler um comunicado, achar um colega, abrir um chamado. Escaneabilidade, consistência entre páginas e previsibilidade valem mais do que expressão. A personalidade mora nos detalhes: nomes brasileiros tratados com cuidado, vocabulário do IXC, o pódio de vendas, o carrossel de comunicados. Densidade balanceada: cards com respiro interno de 24px, mas grids que aproveitam a largura.

O sistema tem cinco temas e trata isso como capacidade permanente, não como casca. O claro é o canônico; Default Dark, Cyber-Obsidian, Deep-Space Aurora e AMOLED trocam a temperatura da superfície e a intensidade do laranja, mas nunca a hierarquia nem a posição das coisas.

**Key Characteristics:**
- Um único accent, usado com parcimônia, sobre superfícies azul-gelo e brancas.
- Plano por padrão; sombra, brilho e borda animada só como resposta a hover, foco ou elevação.
- Duas famílias tipográficas com papéis fixos: Manrope para títulos, Plus Jakarta Sans para todo o resto, JetBrains Mono para números que se comparam.
- Cinco temas com os mesmos tokens semânticos; a cor muda, a estrutura não.
- Português do Brasil em toda a interface, sem internacionalização.

## Colors

Uma paleta de um só accent: laranja quente e raro sobre uma escala de azuis frios que vai do gelo ao navy.

### Primary
- **Laranja Prestek** (#EC7D23): o sinal. Botões primários, item ativo da navegação, badges de contagem, links e ícones de estado ativo, anel de foco a 35% de opacidade. Extraído dos pixels do `Logo.webp` renderizado na Sidebar. Sobre fundo branco rende 2,8:1, por isso é preenchimento e ícone, nunca texto pequeno.
- **Laranja Prestek Hover** (#C2410C): hover do botão primário, e o único laranja permitido como texto sobre branco (5,2:1). Também é a parada central fixa do gradiente dos heroes nos cinco temas.
- **Laranja Prestek Profundo** (#7C2D12): início do gradiente dos heroes e base das sombras tingidas dos cards bento.
- **Laranja Prestek Suave** (#FFF7ED): fundo de estado ativo (chip selecionado, item de navegação ativo) e de destaques discretos.
- **Laranja Prestek Pêssego** (#FDBA74): topo da rampa, usado como brilho no gradiente da borda animada e como hover do accent nos temas escuros.

### Secondary
- **Azul Informativo** (#2563EB): categoria secundária para dados organizacionais vindos do IXC, somente leitura. Existe porque a rampa laranja não tem um segundo matiz distinguível para "informação".
- **Violeta Auditoria** (#8B5CF6): terceira categoria, reservada a logs e auditoria no Painel Admin.

### Tertiary
- **Verde OK** (#1F8A5B), **Amarelo Aviso** (#CA8A04) e **Vermelho Alerta** (#E84545): estados semânticos. Cada um tem uma variante `-suave` para fundo (#E6F4EC, #FEFCE8, #FDEDED) e uma variante `-texto` mais escura (#10603E, #7A5300, #B02121) porque o tom base passa nos 3:1 de componente gráfico mas reprova nos 4,5:1 de texto sobre o fundo suave. O aviso é amarelo e não âmbar de propósito: com accent laranja, um aviso âmbar viraria a mesma coisa que um destaque.

### Neutral
- **Azul-gelo** (#F5F9FF): fundo da aplicação.
- **Branco Superfície** (#FFFFFF): cards, header, sidebar, inputs.
- **Azul-gelo Elevado** (#F7FAFD): superfícies levemente elevadas e fundos suaves de chips inativos.
- **Borda Gelo** (#E4ECF5) e **Borda Sutil** (#EFF4FA): divisórias e bordas de card. Nunca cinza puro.
- **Azul Profundo** (#0B1B2E): texto primário e títulos. É a tinta do sistema.
- **Azul Mesclado** (#475467): texto secundário e labels.
- **Azul Neblina** (#8896A8): texto terciário, placeholders, ícones inativos.

### Temas escuros

Os quatro temas escuros redefinem as mesmas variáveis CSS (`.dark`, `.dark-cyber`, `.dark-aurora`, `.dark-amoled` no `index.css`) e os quatro objetos de `useBentoTheme.js`. A estrutura e os papéis não mudam; mudam a temperatura e a intensidade.

| Tema | Fundo | Superfície | Accent | Sucesso | Caráter |
|---|---|---|---|---|---|
| Default Dark | #070B13 | #111C2C | Laranja Brasa #F97316 | #2DB37F | Sóbrio, é o Cyber sem vidro |
| Cyber-Obsidian | #070B13 | rgba(17,28,44,.85) | Laranja Brasa #F97316 | #00F5D4 | Vidro e néon, o sucesso é ciano |
| Deep-Space Aurora | #0F0C20 | #1D1742 | Laranja Aurora #FB923C | #00FF87 | Índigo cósmico, sombras violeta |
| AMOLED | #000000 | #121212 | Laranja Brasa #F97316 | #00C853 | Preto verdadeiro, sem sombra, anéis de 1px |

Nos temas escuros o `accentDark` (#FDBA74) fica mais claro que o `accent`, o inverso do claro. Por isso o gradiente dos heroes usa a constante `#C2410C` no meio e não o token: a rampa precisa ser monotônica nos cinco temas.

### Named Rules
**The Rare Signal Rule.** O laranja ocupa no máximo um elemento por grupo visual: um botão primário por card, um item ativo por lista, um badge por ícone. Se dois laranjas competem no mesmo bloco, um deles vira azul mesclado.

**The Orange Is Fill Rule.** #EC7D23 nunca é cor de texto sobre branco. Texto laranja usa #C2410C; texto sobre laranja é branco.

**The Manual Divergence Rule.** O manual de identidade visual registra #D97738 como laranja institucional e #384C9C como azul. O sistema adota o laranja extraído do asset do logo (#EC7D23) para que accent e logo renderizado coincidam na tela, e não adota o azul institucional. Decisão registrada em `.impeccable/critique/ignore.md`, revisão prevista para o encerramento do programa Impeccable ou quando houver logo em SVG.

## Typography

**Display Font:** Manrope (com sans-serif do sistema)
**Body Font:** Plus Jakarta Sans (com sans-serif do sistema)
**Label/Mono Font:** JetBrains Mono, só para números

**Character:** duas geométricas humanistas que se parecem de longe e se distinguem de perto. Manrope, em extra bold e tracking negativo, dá peso aos títulos de página; Plus Jakarta Sans, mais aberta, carrega o texto de trabalho sem cansar. JetBrains Mono entra onde números precisam se alinhar em coluna: contadores de chip, KPIs, protocolos. As três são auto-hospedadas via `@fontsource` e importadas em `main.jsx`.

### Hierarchy
- **Display** (800, 30px / text-3xl, 1.1, -0.02em): título de página, um por tela, dentro do hero ou no topo do conteúdo. Sempre Manrope via `font-display`.
- **Headline** (700, 20px / text-xl, 1.25): título de seção e de painel lateral. Manrope.
- **Title** (700, 18px / text-lg, 1.3): título de card e de modal. Plus Jakarta Sans.
- **Body** (400, 14px / text-sm, 1.5): texto corrido, resumos, descrições. Medida confortável até 70ch.
- **Label** (600, 13px, 1.2): botões, chips, itens de navegação, rótulos de formulário. Passa a 700 quando ativo.
- **Overline** (700, 11px, 0.08em, caixa alta): eyebrows de seção, badges, "MENU" e "SISTEMA" na sidebar. Use com moderação; três por tela já é muito.
- **Mono** (600, 13px): contadores, KPIs, protocolos e qualquer número que o olho compara com o vizinho.

### Named Rules
**The Two Voices Rule.** Manrope só em display e headline. Se um `h3` de card está em Manrope, está errado.

**The Numbers Align Rule.** Número que aparece em lista ou coluna vai em JetBrains Mono. Número dentro de frase corrida fica em Plus Jakarta Sans.

## Layout

Shell fixo: header de 64px no topo e, abaixo, sidebar à esquerda com conteúdo rolável à direita. A sidebar tem dois estados, expandida (248px) e recolhida (72px), e some abaixo de `lg` (1024px), quando a navegação passa para a `MobileBottomNav` com cinco itens por frequência de uso (Início, Plantão, Comunicados, Chamados, Mais) e o sheet "Mais" com o restante. Os itens, rótulos e a restrição de admin vivem em um só lugar, `src/navigation.js`; o header mostra o título da view atual e, no celular, o avatar abre o sheet de perfil (tema e sair). Breakpoints são os do Tailwind (640, 768, 1024, 1280).

Cada página monta o mesmo esqueleto (não há componente compartilhado para isso; o `PageShell` de `responsive/` nunca foi usado e foi removido): hero em gradiente laranja (título display em branco, subtítulo, busca ou KPIs), uma barra de filtros em chips com scroll horizontal no celular, e o conteúdo em grid de cards bento. O grid vai de 1 coluna no celular a 3 ou 4 em `lg`, com gap de 16 a 24px. O Dashboard usa `react-grid-layout` com widgets de altura fixa por linha.

Ritmo de espaçamento em múltiplos de 4: 4, 8, 12, 16, 24, 32. Padding interno de card é 24px, gap entre elementos de um card é 14px, gap entre cards é 16 ou 24px. Chips têm 8px vertical e 14px horizontal; botões, 10px vertical e 20px horizontal.

### Camadas (z-index)

Convenção documentada; nunca use um número arbitrário. Novo overlay escalona a partir da camada mais próxima abaixo, e quem inventa um degrau novo atualiza esta tabela e o comentário no fim do `index.css`.

| Camada | Valor | Uso |
|---|---|---|
| Base | 0 | Padrão |
| Elevado | 10 | Badges e chips que sobem sobre cards |
| Flutuante leve | 20 a 99 | Tooltips, dropdowns, controles flutuantes |
| Sticky interno | 100 | Headers e abas sticky dentro de páginas |
| Mapa | 500 | `MapLegend` e overlays do Leaflet |
| Chrome global | 1000 | Header, Sidebar, MobileBottomNav, CoverageMap |
| Chrome +1 | 1001 a 1050 | MobileMoreSheet, DirectoryToolbar |
| Drawers e modais | 1100 | MobileDrawer, OverrideModal, TiSupportModal, ModalShell |
| Toast crítico | 9999 | Alertas acima de tudo |

O tema escuro não altera z-index. Chrome global nunca fica acima de um modal.

## Elevation & Depth

Híbrido que muda por tema, com uma regra única: superfícies são planas em repouso. No tema claro os cards têm borda de 1px em Borda Gelo e uma sombra quase invisível tingida de navy (`0 1px 3px rgba(11,27,46,.06)`); a profundidade aparece como resposta, no hover (sombra média mais a borda aurora girando) e nos modais (sombra extra-grande sobre backdrop escurecido com blur). Nos temas escuros a profundidade vem de camadas tonais: fundo, card, superfície e superfície elevada são quatro azuis progressivamente mais claros, e as sombras pretas só reforçam. No AMOLED não existe sombra: a elevação é um anel de 1px em cinza (#222, #333, #444) porque preto sobre preto não projeta nada.

### Shadow Vocabulary
- **Sussurro** (`--shadow-sm`, `0 1px 3px rgba(11,27,46,.06), 0 1px 2px rgba(11,27,46,.04)`): card em repouso.
- **Resposta** (`--shadow-md`, `0 4px 16px rgba(11,27,46,.08), 0 2px 6px rgba(11,27,46,.04)`): card em hover, dropdown aberto.
- **Elevado** (`--shadow-lg`, `0 12px 32px rgba(11,27,46,.10), 0 4px 12px rgba(11,27,46,.06)`): popover, painel lateral, popup do mapa.
- **Modal** (`--shadow-xl`, `0 24px 48px rgba(11,27,46,.12), 0 8px 20px rgba(11,27,46,.06)`): diálogos e drawers.
- **Brilho de sinal** (`0 0 28px 4px rgba(236,125,35,.40)`): só no hover de card com `bento-hover-border`, junto da borda cônica animada de 1,5px. É o gesto mais alto do sistema e por isso é raro: uma vez por card, nunca em repouso, nunca em toque.

### Named Rules
**The Flat At Rest Rule.** Nenhuma superfície tem brilho, borda animada ou sombra acima de Sussurro em repouso. Profundidade é resposta a hover, foco ou elevação de camada.

**The Tonal Dark Rule.** No escuro, elevar é clarear a superfície um degrau, não adicionar sombra. No AMOLED, elevar é adicionar um anel de 1px.

## Shapes

Cantos arredondados em uma escala curta e fixa: 8px para botões pequenos e itens de navegação (`rounded-lg`), 12px para botões, inputs e chips retangulares (`rounded-xl`), 16px para modais e painéis (`rounded-2xl`), 20px para cards bento (`BentoCard`), 24px para heroes e seções grandes, e pílula (999px) para chips de filtro, badges e avatares. Bordas são sempre de 1px em Borda Gelo, nunca mais grossas, exceto o chip ativo (1,5px em laranja) e o anel de foco (2px). Não há cantos vivos em lugar nenhum; não há formas orgânicas além dos anéis dos heroes. Ícones são Material Symbols Outlined com peso e preenchimento variáveis, e o conjunto SVG próprio em `common/Icons.jsx` para a navegação.

## Components

### Buttons
- **Shape:** cantos de 12px (`rounded-xl`), altura de 40px, padding 10px 20px, label em 600.
- **Primary:** dois idiomas coexistem hoje. O sólido usa Laranja Prestek com texto branco e hover em Laranja Prestek Hover. O gradiente, dominante em modais e formulários (25 ocorrências), vai de `#9A3412` a `#EC7D23` com sombra laranja a 25%. O gradiente hardcoda o profundo do tema Aurora no tema claro; ao tocar em um deles, migrar para os tokens.
- **Hover / Focus:** hover escurece (sólido) ou reduz opacidade a 90% (gradiente); foco visível é `ring-2` em `--accent` com offset de 2px. Disabled a 70% de opacidade com cursor `not-allowed`.
- **Secondary:** fundo branco, borda Borda Gelo, texto Azul Mesclado; hover troca o fundo para Azul-gelo Elevado.
- **Ghost / icon:** sem fundo, ícone em Azul Neblina, hover em laranja. Todo ícone-botão leva `aria-label`.

### Chips
- **Style:** pílula, padding 8px 14px, 13px em 600, borda 1,5px em Borda Gelo, fundo branco, texto Azul Mesclado. O contador ao lado vai em JetBrains Mono dentro de uma pílula menor.
- **State:** ativo vira borda e texto laranja, fundo laranja a 12%, halo de 3px laranja a 12%, peso 700 e `aria-pressed="true"`. Componente compartilhado: `ui/ChipButton.jsx`.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** Branco Superfície; nos temas escuros, `--surface`.
- **Shadow Strategy:** Sussurro em repouso, Resposta mais brilho de sinal no hover (ver Elevation & Depth). O `GlowingEffect` de proximidade do mouse é desligado em dispositivos de toque.
- **Border:** 1px em Borda Gelo.
- **Internal Padding:** 24px, gap interno de 14px. Componente compartilhado: `common/BentoCard.jsx`.

### Inputs / Fields
- **Style:** fundo branco, borda 1px em Borda Gelo, cantos de 12px, padding 8px 16px, texto Azul Profundo, placeholder Azul Neblina. Label acima em 14px 600, hint abaixo em 12px Azul Neblina. Constantes compartilhadas em `services/modals/ModalShell.jsx`.
- **Focus:** borda transparente e `ring-2` em `--accent`.
- **Hero search:** variante de vidro para dentro dos heroes, fundo branco a 15% com blur de 8px, borda branca a 30%, cantos de 14px, foco com outline branco sólido de 2px. Componente compartilhado: `ui/HeroSearchInput.jsx`.
- **Error / Disabled:** erro em Vermelho Alerta com texto em `-texto`; disabled a 70% de opacidade.

### Navigation
- **Sidebar:** itens de 13,5px em 500, ícone e texto em Azul Neblina, cantos de 8px; hover leva ícone e texto para laranja; ativo tem fundo Laranja Prestek Suave, texto laranja em 600 e badge de contagem laranja. Badges de urgência em itens inativos usam Vermelho Alerta suave. Seções "MENU" e "SISTEMA" em overline.
- **Mobile:** `MobileBottomNav` com cinco itens e o sheet "Mais"; item ativo em laranja, inativo em Azul Neblina.
- **Modais:** `ModalShell` com cabeçalho, corpo e rodapé separados por Borda Gelo, cantos de 16px, backdrop preto a 60% com blur, entrada com fade e zoom de 200ms.

### Hero de página
Faixa de 24px de raio com gradiente de 120° de Laranja Prestek Profundo a Laranja Prestek passando por #C2410C fixo, anéis concêntricos brancos a 4 a 7,5% saindo do canto inferior esquerdo (`ui/heroGradiente.js`), título display em branco, subtítulo, e busca de vidro ou KPIs. É o único lugar onde o laranja é fundo grande, e por isso o resto da página fica em azul-gelo.

## Do's and Don'ts

### Do:
- **Do** use os tokens semânticos (`C.*` de `useBentoTheme` ou as variáveis CSS) para toda cor. Um hex literal em componente só é aceitável quando os cinco temas o compartilham de propósito, como o `#C2410C` do meio do hero, e vem com comentário explicando.
- **Do** mantenha o laranja raro: um por grupo, sempre como preenchimento ou ícone, nunca como texto pequeno sobre branco.
- **Do** escolha o raio pela escala (8, 12, 16, 20, 24, pílula) e nada entre eles.
- **Do** dê a todo controle os estados default, hover, focus-visible, active, disabled e loading, com foco visível em `ring-2` laranja.
- **Do** verifique todo componente novo nos cinco temas antes de considerar pronto; AMOLED é onde hex fixo quebra primeiro.
- **Do** desligue efeitos de proximidade do mouse em toque e respeite `prefers-reduced-motion`, que o `index.css` já cobre globalmente.
- **Do** escreva em português do Brasil, com vocabulário do IXC onde o dado vem de lá.

### Don't:
- **Don't** reintroduza bege, âmbar ou qualquer fundo quente: o calor do sistema vem do laranja sobre gelo, não de superfícies quentes.
- **Don't** use `#EC7D23` como cor de texto sobre fundo claro; o texto laranja é `#C2410C`.
- **Don't** coloque brilho, borda animada ou sombra acima de Sussurro em um card em repouso.
- **Don't** invente um raio (10px, 18px) ou um z-index (`z-[1137]`) fora das tabelas.
- **Don't** use Manrope abaixo de headline, nem número alinhado em coluna fora de JetBrains Mono.
- **Don't** aplique o gradiente do hero em botões ou cards; ele é a assinatura da faixa de topo.
- **Don't** hardcode `#9A3412` ou qualquer valor de um tema específico em código que roda nos cinco temas.
