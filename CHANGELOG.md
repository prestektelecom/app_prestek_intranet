# Changelog

Todas as alterações notáveis deste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Unreleased]

### Adicionado
- Aba **TI** (admin), com hub extensível por registry (`src/components/ti/registry.js`) e a primeira ferramenta, **Cadastro de Colaborador**: upload de ficha de registro em PDF (camada de texto ou OCR via `tesseract.js`, com confiança por campo), formulário completo por seções, checagem de duplicidade e dry-run contra o IXC (monta os 1-3 payloads de criação sem gravar nada). `POST /api/ti/colaborador/criar` existe como stub `501` — a gravação real é uma fase futura separada.
- Rotas de apoio ao Cadastro de Colaborador: `GET /api/funcoes`, `GET /api/ti/colaborador/taxonomias`, `GET /api/ti/colaborador/cidades`, `GET /api/ti/colaborador/duplicado`, `POST /api/ti/colaborador/extrair-pdf`, `POST /api/ti/colaborador/dry-run`.
- Componentes responsivos reutilizáveis em `src/components/responsive/`:
  - `ResponsiveBreadcrumb`, `ResponsiveTable`, `FilterBar`, `MobileDrawer`, `PageShell`, `TouchFriendlyActions`
- Hook `useTouchOnly` para detectar dispositivos touchscreen.
- Configuração `future.hoverOnlyWhenSupported` no `tailwind.config.js` para evitar estados de hover presos em telas de toque.

### Alterado
- `Header.jsx` e `Sidebar.jsx` refatorados para usar Tailwind com breakpoints responsivos.
- `App.jsx` ajustado com padding inferior para `MobileBottomNav` e altura de viewport dinâmica (`h-dvh`).
- Páginas adaptadas para mobile/tablet/desktop:
  - `Dashboard.jsx` — KPIs empilhados e `react-grid-layout` com layouts por breakpoint.
  - `Coverage.jsx` — filtros fluidos, mapa adaptável e lista de cidades em drawer mobile.
  - `Directory.jsx` — grid responsivo de cards (1/2/3/4 colunas) e ações visíveis por toque.
  - `Schedule.jsx` — tabela com scroll controlado em tablet e cards em mobile.
  - `TicketsList.jsx` — convertido para `ResponsiveTable`.
  - `Offices.jsx` — layout mobile com lista/mapa empilhados e ações de admin visíveis.
  - `Processos.jsx` e `AdminUsuarios.jsx` — tabelas responsivas.
  - `Comunicados.jsx` — hero, filtros e grid de cards responsivos.
  - `ServicesDirectory.jsx` — grids responsivos e ações de admin com área de toque 44×44px.
  - `Configuracoes.jsx` — formulários empilhados em mobile e correção de padding inválido.

### Corrigido
- Áreas de toque de botões de ação em cards aumentadas para no mínimo 44×44px.
- Carregamento da fonte Material Symbols com preload/fallback para evitar ícones como texto.

## [1.0.0] - 2025-05-01

- Lançamento inicial da intranet Prestek.
