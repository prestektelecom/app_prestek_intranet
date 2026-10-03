## Context

O `Dashboard.jsx` atual tem ~760 linhas onde quase toda a lógica de estilo é controlada via objeto `C` do hook `useBentoTheme`. Esse hook mapeia variáveis de tema (dark/light) para valores CSS em tempo de execução, resultando em dezenas de inline styles por componente. O restante da intranet usa classes Tailwind com o design system MD3 configurado em `tailwind.config.js` (paleta teal/indigo, tipografia Hanken Grotesk, breakpoints padrão).

A mudança é puramente visual: a estrutura de grid (`react-grid-layout`), a lógica de carregamento de dados e a persistência de layout no backend não mudam.

## Goals / Non-Goals

**Goals:**
- Substituir todos os inline styles e `useBentoTheme` por classes Tailwind no `Dashboard.jsx`
- Adicionar header de boas-vindas com saudação personalizada + widget de clima/hora (mock estático de localidade)
- Redesenhar o card de Comunicados com placeholder visual de featured announcement
- Expandir os Atalhos Rápidos de 4 para 7 itens em layout de lista vertical (ícone + label + hint)
- Criar card de Aniversariantes consumindo `data_nascimento` via `/api/colaboradores`
- Expor `data_nascimento` no response de `/api/colaboradores` no backend
- Manter drag-and-drop, persistência de layout e todos os KPIs operacionais existentes

**Non-Goals:**
- Alterar qualquer outra página além da Dashboard
- Remover ou refatorar o hook `useBentoTheme` (pode ser usado por outros componentes)
- Conectar dado real de clima a uma API externa (fica como mock estático por ora)
- Implementar imagem real no featured announcement (apenas placeholder visual)
- Alterar o schema do banco de dados (campo `data_nascimento` já existe no IXC)

## Decisions

### D1: Tailwind puro em vez de migrar para sistema de tokens runtime

**Escolha:** usar classes Tailwind diretamente nos componentes do Dashboard, sem criar um novo hook de tema.

**Alternativas consideradas:**
- Manter `useBentoTheme` e só ajustar as cores — rejeitado: manteria a dívida de inline styles e não resolveria a divergência visual
- Criar um novo hook `useDashboardTheme` com variáveis CSS — rejeitado: over-engineering para uma mudança principalmente visual; Tailwind + `dark:` já cobre dark mode

**Rationale:** A paleta MD3 já está em `tailwind.config.js`. Usar classes diretas é consistente com todas as outras páginas do projeto e elimina a camada extra de abstração.

---

### D2: Layout de Atalhos em lista vertical (não grid 2×N)

**Escolha:** lista vertical com `flex` items — ícone à esquerda, label + hint à direita — para acomodar 7 itens sem scroll e sem comprometer a altura do card no grid.

**Alternativas consideradas:**
- Grid 2×4 — ocupa muita altura vertical no bento, empurra os KPIs
- Grid 3 colunas horizontal — ícones ficam pequenos demais nos cards compactos
- Scroll interno — anti-padrão para atalhos (usuário não sabe que tem mais)

**Rationale:** A lista vertical é mais legível em alturas variadas e compatível com resize do react-grid-layout. Cada item tem 44px de área de toque (conforme `AGENTS.md`).

---

### D3: Widget de clima como mock estático

**Escolha:** exibir cidade fixa ("São Paulo") e temperatura estática ou hora do cliente por ora.

**Alternativas consideradas:**
- Conectar à OpenWeatherMap agora — abre dependência de API key e CORS; fora do escopo deste change
- Usar geolocalização do browser — requer permissão do usuário; adiciona complexidade

**Rationale:** O valor visual do widget (humanizar a saudação) é entregue com a hora real do cliente. A temperatura pode ser deixada em branco ou como "—°C" até uma feature futura conectar a API real.

---

### D4: `data_nascimento` adicionado diretamente ao `/api/colaboradores`

**Escolha:** adicionar o campo no `.map()` da resposta existente da rota, lendo `f.data_nascimento` do dado bruto do IXC.

**Alternativas consideradas:**
- Criar rota separada `/api/aniversariantes` — duplicaria lógica de fetch ao IXC
- Criar endpoint específico `/api/colaboradores/aniversariantes` — mais semântico mas adiciona rota desnecessária para este caso

**Rationale:** O campo já existe nos dados brutos (`f.data_nascimento`). Incluí-lo no mapeamento existente é a mudança menos invasiva. O frontend filtra localmente pelos aniversários do mês/semana.

---

### D5: Filtragem de aniversariantes no frontend

**Escolha:** o card de Aniversariantes faz `GET /api/colaboradores`, recebe todos os colaboradores ativos e filtra no cliente por aniversários hoje + próximos 7 dias.

**Alternativas consideradas:**
- Filtrar no backend — mais eficiente para grandes volumes, mas a lista de colaboradores já é cacheada pelo browser e o número de funcionários é pequeno (< 500)

**Rationale:** Simplicidade. Evita nova rota de backend. O payload já é carregado por outros componentes da intranet.

## Risks / Trade-offs

- **Campo `data_nascimento` pode ser `null` em registros legados do IXC** → Mitigação: o card ignora entradas sem data de nascimento; exibe "Nenhum aniversariante" se lista vazia
- **Drag-and-drop pode perder compatibilidade visual com os novos cards** → Mitigação: os cards novos usam `h-full` para preencher qualquer dimensão do grid cell
- **`useBentoTheme` removido do Dashboard pode ser importado indiretamente por outros componentes** → Mitigação: o hook não é removido, apenas não importado pelo Dashboard; risco zero de quebra
- **Widget de clima estático pode confundir usuários que esperam dado real** → Mitigação: exibir apenas a hora real do cliente (dinâmica) e deixar temperatura como "—" até conectar API real
