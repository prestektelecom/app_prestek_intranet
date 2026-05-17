# Migração para Dashboard v2 (Bento Layout)

O objetivo é atualizar a tela inicial do sistema para o novo design de Dashboard ("Bento layout"), melhorando a apresentação hierárquica das informações com o uso de gráficos compactos (Sparklines), novos ícones e uma identidade visual modernizada. O arquivo de referência aponta também para mudanças no menu lateral e cabeçalho.

## User Review Required

A atualização do layout impacta não apenas o conteúdo principal do Dashboard, mas também a `Sidebar` e o `Header` de **toda a aplicação**, já que o design de referência traz componentes integrados (`SideRail` e `TopBar`) que seguem a mesma estética de glassmorphism e espaçamento.

1. **Adoção Global:** Devemos aplicar o novo menu lateral e header para **todo o sistema**? (Recomendado para manter consistência visual ao trocar de tela).
2. **Sistema de Cores:** O arquivo de referência utiliza cores hexadecimais injetadas via style inline (ex: `accent: '#4A9EF5'`). O ideal é convertermos essas cores em variáveis do Tailwind (`tailwind.config.js` e `index.css`) para garantir padronização. Você aprova a integração destas variáveis no tema Tailwind do projeto?

## Open Questions

- **Dados de Histórico (Sparklines):** O novo layout introduz pequenos gráficos de linha (Sparklines) nos KPIs do setor (ex: histórico dos últimos 7 dias/meses). O backend atual (`/api/eficiencia`) e outros endpoints retornam esse histórico numérico (arrays) ou deveremos criar dados simulados (mocks) até que o backend seja adaptado para retornar séries temporais?
- **Fontes Modernas:** O documento sugere o uso de `Plus Jakarta Sans` para textos e `JetBrains Mono` para detalhes numéricos e código. Deseja que eu adicione as importações dessas fontes no Google Fonts (`index.css`) ou mantemos a fonte global existente no projeto?
- **Integração do TeamAvailability:** O `TeamBento` deve reutilizar completamente o endpoint e lógica do atual `TeamAvailability.jsx` (que consome `/api/colaboradores/online` e avatares Lottie), apenas aplicando a nova "casca" de CSS, certo?

## Proposed Changes

### 1. Sistema de Design e Tematização (CSS/Tailwind)
A primeira etapa é injetar o novo esquema de cores e padrões no projeto para facilitar a criação do layout sem precisar de CSS inline pesado.

#### [MODIFY] `tailwind.config.js` / `src/index.css`
- Mapear as variáveis globais sugeridas (ex: `accent`, `accentDeep`, `surfaceSoft`, `dangerSoft`) no tema do Tailwind.
- Opcionalmente importar as fontes *Plus Jakarta Sans* e *JetBrains Mono*.

### 2. Navegação Global
#### [MODIFY] `src/components/Sidebar.jsx`
- Refatorar do formato atual para o `SideRail` contido na referência.
- Adicionar o menu dividido por seções ("Menu" e "Sistema") e rótulos para cada item (`GroupLabel`).
- Incluir o card flutuante na parte inferior ("Precisa de Ajuda?").
#### [MODIFY] `src/components/Header.jsx`
- Refatorar para o formato do `TopBar`.
- Mudar o cabeçalho para `backdrop-blur` (glassmorphism) e aplicar a caixa de busca moderna com atalho `⌘K`.
- Refinar a renderização do perfil à direita, mostrando Avatar e nome + setor empilhados.

### 3. Tela de Dashboard (O Novo Bento Layout)
#### [MODIFY] `src/components/Dashboard.jsx`
- Remover os importes antigos (`StatCard`, layouts básicos) e adotar uma estruturação via CSS Grid (ex: `grid-cols-12` no Tailwind).
- Substituir a mensagem atual "Bem-vindo de volta" pelo componente **`HeroCard`** com data dinâmica, mensagem integrada ao setor e botões de ação ("Assistente", "Novo Chamado").
- Substituir os `stats.map` pelo conjunto de Bento Cards:
  - **`SetorBento`**: KPIs triplos usando componente com mini-gráficos (`Sparklines`).
  - **`PlantaoBento`**: Conectado à variável `proximoPlantao` atual.
  - **`OsBento`**: Conectado à variável `osCount` e exibindo as OS pendentes.
- Substituir a listagem antiga de comunicados pelo **`ComunicadosCard`** com feed visual de tags.
- Substituir a interface `QuickShortcuts` pelo **`AtalhosCard`** moderno.
- Substituir a visualização de presença `TeamAvailability` pelo formato em lista do **`TeamBento`**.

### 4. Componentes Compartilhados
Para deixar o código limpo, vamos extrair utilitários e micro-componentes presentes no JSX de referência.

#### [NEW] `src/components/common/Icons.jsx`
- Extrair todos os ícones inline do arquivo (`Dashboard`, `Tools`, `Shield`, `Sparkline`, etc.) exportando-os de forma centralizada.
#### [NEW] `src/components/common/Sparkline.jsx`
- Isolar o componente SVG de gráfico de linhas para ser reutilizável dentro e fora do Dashboard.
#### [NEW] `src/components/common/Avatar.jsx`
- Extrair o gerador de avatar baseado em iniciais com fallback para cores personalizadas, unificando a exibição nos cards.

## Verification Plan

### Manual Verification
1. **Verificação Visual Global:** Rodar o app e verificar as mudanças em `Sidebar` e `Header` – garantindo que elas se ajustam corretamente sem quebrar as outras páginas (ex: `ServicesDirectory`, `Coverage`).
2. **Testes do Bento Grid:** Validar o CSS Grid em monitores grandes (desktop) e o redimensionamento em janelas menores para que os blocos colapsem em colunas simples de forma graciosa.
3. **Data Fetching:** Avaliar se o Loading State (enquanto carrega `osCount`, `plantao` e `eficiencia`) não "quebra" as dimensões do Bento Layout.
4. **Análise de Perfomance Visual:** Observar animações (microinterações em hover e "pulse" nas bolinhas online do TeamBento).
