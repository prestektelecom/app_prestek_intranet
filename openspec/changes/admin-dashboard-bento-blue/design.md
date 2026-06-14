## Context

O `AdminDashboard.jsx` é o shell completo do painel administrativo: contém o header, a sidebar e o roteamento entre as 6 abas (Painel, Usuários, Responsáveis, Comunicados, Auditoria, Plantão). A "Visão Geral" é renderizada quando `abaAtiva === 'painel'`.

O design system Bento Blue já está aplicado em todas as outras páginas da intranet usando um padrão consistente:
- Constante `C` com tokens inline (igual ao `Dashboard.jsx`)
- Função `tone(hex, a)` para rgba com transparência
- Accent stripes coloridas no topo de cards
- Fundo `#F5F9FF`, superfícies `#FFFFFF`, bordas `#E4ECF5`
- Accent primário `#4A9EF5`, ink `#0B1B2E`, muted `#8896A8`

## Goals / Non-Goals

**Goals:**
- Migrar o bloco `abaAtiva === 'painel'` para Bento Blue (KPIs, Atividades Recentes, cards de atalho)
- Atualizar o objeto `ICONE_ACAO` para usar cores bento (remover `bg-primary/10 text-primary` âmbar)
- Mudar o `<main>` de `bg-background` (warm stone) para `#F5F9FF`
- Usar a constante `C` com tokens Bento Blue inline (padrão do Dashboard.jsx)

**Non-Goals:**
- Não alterar header do painel admin (âmbar mantido — escopo A)
- Não alterar sidebar do painel admin (âmbar mantido — escopo A)
- Não alterar sub-componentes: AdminUsuarios, AdminComunicados, AdminAuditoria, PlantaoHistorico
- Não alterar lógica de negócio, APIs ou estado

## Decisions

### D1 — Constante `C` inline no componente
**Decisão:** Declarar a paleta Bento Blue como constante `C` no topo do componente, igual ao `Dashboard.jsx` e `Configuracoes.jsx`.

**Alternativa considerada:** Importar tokens de um arquivo compartilhado. Rejeitada por adicionar acoplamento desnecessário — o padrão do projeto é inline.

### D2 — Stripes de cores por KPI
**Decisão:** Cada KPI terá uma stripe de 4px no topo com cor distinta:
- Usuários Ativos → azul `#4A9EF5`
- Comunicados → ciano `#7FD4E8`
- Ações Admin → verde `#1F8A5B`

**Rationale:** Diferencia visualmente os KPIs mantendo coesão com o design system.

### D3 — Card destaque "Gerenciar Usuários"
**Decisão:** Gradiente azul `#1F5BA8 → #2D7BD4 → #4A9EF5` substituindo `from-primary to-orange-600`.

**Alternativa:** Manter gradiente e só trocar a cor. Aceita — é exatamente isso que faremos, só trocando a paleta.

### D4 — `ICONE_ACAO` cores
**Decisão:** `create_comunicado` muda de `bg-primary/10 text-primary` para `bg-[#EAF4FF] text-[#4A9EF5]`. As demais ações (green, red, blue, purple) já são neutras e compatíveis com Bento Blue.

## Risks / Trade-offs

- **[Risco] Header/sidebar continuam âmbar** → Aceitado conscientemente (escopo A). A inconsistência visual entre shell âmbar e conteúdo azul é temporária até um redesign futuro do escopo B.
- **[Risco] Nenhum** — mudança puramente estética em um único bloco condicional, sem impacto funcional.
