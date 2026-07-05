## Context

A página de Meus Chamados (`TicketsList.jsx`) exibe a lista de tickets de suporte do colaborador, consumindo a rota `/api/ixc/su-ticket/list`. Apesar da estrutura simples e funcional, a página usa o tema base do projeto (warm/âmbar), que contrasta fortemente com o estilo "Bento Blue" adotado nas páginas de referência. O objetivo é revestir a página com o mesmo padrão visual sem redesenhar o fluxo.

## Goals / Non-Goals

**Goals:**
- Alinhar cores, tipografia, espaçamentos e componentes de Meus Chamados ao padrão Bento Blue.
- Adicionar um hero banner gradiente azul com KPIs no topo da página.
- Refazer card da tabela para branco `#FFFFFF` com borda `#E4ECF5` e radius 20px.
- Migrar botão de ação primário para gradiente `from-[#1F5BA8] to-[#4A9EF5]`.
- Reestilizar header da tabela, linhas, IDs e badges de status para o tom azul Prestek.
- Reestilizar estados de loading, erro e empty.
- Garantir que o dark mode fique consistente com as páginas de referência.

**Non-Goals:**
- Adicionar filtros, busca, paginação ou modal de detalhes.
- Alterar a rota de backend ou a estrutura dos dados.
- Extrair um design system global compartilhado nesse momento.
- Alterar `tailwind.config.js` ou `index.css` (mudanças serão locais).

## Decisions

- **Paleta:** Usar o mesmo objeto de cores hardcoded das páginas de referência: fundo `#F5F9FF`, superfície `#FFFFFF`, accent `#4A9EF5`, accentDark `#2D7BD4`, accentDeep `#1F5BA8`, accentSoft `#EAF4FF`, ink `#0B1B2E`, ink2 `#475467`, muted `#8896A8`, line `#E4ECF5`, cyan `#7FD4E8`.
  - *Rationale:* Mantém consistência visual direta com Processos, Escala e Escritórios. Como essas páginas já usam hardcode, copiar o padrão é o caminho mais rápido e seguro.

- **Hero Banner:** Criar um banner full-width gradiente `120deg #1F5BA8 → #2D7BD4 → #4A9EF5` contendo título, subtítulo e KPI pills glassmorphism.
  - *Rationale:* O padrão de hero já estabelecido nas páginas de referência cria hierarquia visual.
  - *KPIs:* Total de chamados, abertos, finalizados, pendentes.

- **Tabela:** Header com fundo `#F7FAFD`, labels uppercase com cor `#475467`; linhas com hover `#EAF4FF`; bordas `#E4ECF5`; IDs em azul `#4A9EF5`.
  - *Rationale:* Manter legibilidade e hierarquia, mas no tom azul.

- **Status:** Preservar semântica visual — verde para finalizado, azul para aberto, laranja para pendente.
  - *Rationale:* Essas cores transmitem significado e não devem ser substituídas pela cor primária de marca.

- **Estados:** Loading com spinner azul `#4A9EF5`; erro com ícone vermelho e botão retry gradiente azul; empty com ícone cinza `#8896A8`.
  - *Rationale:* Alinhar todos os estados ao novo padrão sem perder clareza.

- **Fonte:** Forçar `font-family: "Plus Jakarta Sans"` no container da página.
  - *Rationale:* Tipografia é um dos elementos que mais contribuem para a sensação de que a página "não pertence" ao mesmo sistema.

## Risks / Trade-offs

- **Risco de regressão no tema warm:** A `TicketsList.jsx` usa tokens Tailwind como `bg-primary` e `bg-background-light`. Trocar para hardcode azul pode fazer com que futuras mudanças no tema global não se reflitam aqui.
  - *Mitigation:* Documentar explicitamente que essa página usa o tema Bento Blue localmente.

- **Risco de confusão entre cor primária e cor semântica:** o laranja de "Pendente" pode ser confundido com a cor primária antiga.
  - *Mitigation:* Manter laranja apenas no badge de status pendente; todos os demais elementos primários usam azul.
