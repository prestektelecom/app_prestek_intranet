# Changelog

Todas as alterações notáveis deste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Unreleased]

### Adicionado
- **Caixa de sugestões** (change `caixa-de-sugestoes`): botão flutuante "Sugerir" em toda tela logada abre um popup onde o colaborador envia melhoria, ideia ou problema (limite de 5 por 24 h). Nova capacidade `sugestoes` para as rotas de gestão (sem interface por ora), tabela `sugestoes` (migration `025_sugestoes.sql`) e Auditoria `sugestao_status`/`sugestao_resposta`. Rotas `POST/GET /api/sugestoes`, `GET /api/sugestoes/minhas`, `PATCH /api/sugestoes/:id`. Cada sugestão nova também é enviada por e-mail para `ti@prestek.com.br` e `felixskmarcio2@gmail.com` (via `nodemailer`; precisa de `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` no `.env`, e sem `SMTP_HOST` o envio fica desligado).
- Aba **TI** (admin), com hub extensível por registry (`src/components/ti/registry.js`) e a primeira ferramenta, **Cadastro de Colaborador**: upload de ficha de registro em PDF (camada de texto ou OCR via `tesseract.js`, com confiança por campo), formulário completo por seções, checagem de duplicidade e dry-run contra o IXC (monta os 1-3 payloads de criação sem gravar nada). `POST /api/ti/colaborador/criar` existe como stub `501` — a gravação real é uma fase futura separada.
- Rotas de apoio ao Cadastro de Colaborador: `GET /api/funcoes`, `GET /api/ti/colaborador/taxonomias`, `GET /api/ti/colaborador/cidades`, `GET /api/ti/colaborador/duplicado`, `POST /api/ti/colaborador/extrair-pdf`, `POST /api/ti/colaborador/dry-run`.
- Componentes responsivos reutilizáveis em `src/components/responsive/`:
  - `ResponsiveBreadcrumb`, `ResponsiveTable`, `FilterBar`, `MobileDrawer`, `PageShell`, `TouchFriendlyActions`
- Hook `useTouchOnly` para detectar dispositivos touchscreen.
- Configuração `future.hoverOnlyWhenSupported` no `tailwind.config.js` para evitar estados de hover presos em telas de toque.

### Alterado
- **Início** (`Dashboard.jsx`): a grade de widgets deixou de ser `react-grid-layout` (altura fixa por widget, breakpoint pela largura do contêiner) e passou a ser grade CSS de altura automática: 1 coluna no celular, 2 em `md` e 12 em `xl`. A fileira de KPIs não é mais espremida a ~150px por card em 1366px (o "+3%" saía cortado) e nenhum card corta conteúdo. Comunicados, Aniversariantes e Disponibilidade rolam dentro de um teto de altura. Atalhos Rápidos virou uma faixa de tiles na largura toda, no fim da tela. Removidos `react-grid-layout`, `react-resizable`, os dois CSS importados no `main.jsx` e o CSS do modo de edição já arquivado. Sem migration e sem variável nova no `.env`; precisa de `npm ci` e novo build.
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
- **Próximo plantão no Início** (`GET /api/plantoes/meu-proximo`): a consulta comparava o id do funcionário por substring (`LIKE '%1%'`), então o funcionário 1 casava com 12, 21 etc. e podia ver o plantão de outra pessoa; agora compara o id inteiro de cada item da lista. Sem funcionário vinculado, devolve `proximo: null` em vez do plantão de qualquer um. No front, a data é formatada em UTC, como o `Schedule.jsx`, para não aparecer um dia antes quando a API envia meia-noite UTC. Sem migration e sem variável nova no `.env`; basta reiniciar o backend e refazer o build.
- **Contraste no Início** (`Dashboard.jsx`): chips de tipo da lista de comunicados, rótulos "Encaminhadas" e "Agendadas", "Online" e o selo de versão usavam tokens de preenchimento como texto e ficavam entre 2,8:1 e 4,1:1; agora usam `-strong` (≥ 4,5:1). Chips do banner passam a ter fundo sólido com par de contraste (verde, azul, laranja e vermelho estavam entre 2,5:1 e 4,1:1). Novo token `--info-strong` nos cinco temas e `--success-strong` do Default Dark ajustado para #33BC88. Medido nos cinco temas: 122 textos, 0 abaixo de 4,5:1.
- **Carrossel de comunicados do Início** (`Dashboard.jsx`): deixou de ser um `role="button"` com botões dentro (controle aninhado, WCAG 4.1.2). Agora é uma seção `carousel` em que o título é o botão de abrir (esticado sobre o card) e os controles são irmãos dele. Pontos de 8×8px viram alvos de 32×44px, ganha botão de pausa/retomar (WCAG 2.2.2) e a rotação já começa parada para quem usa movimento reduzido. Região viva muda para `polite` só quando a rotação está parada. Novos ícones `Pause` e `Play`. Sem migration e sem variável nova no `.env`; só novo build.
- Áreas de toque de botões de ação em cards aumentadas para no mínimo 44×44px.
- Carregamento da fonte Material Symbols com preload/fallback para evitar ícones como texto.

## [1.0.0] - 2025-05-01

- Lançamento inicial da intranet Prestek.
