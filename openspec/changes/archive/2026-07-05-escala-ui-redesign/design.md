## Context

A Visão Geral da Escala (`Schedule.jsx`) é uma das páginas mais funcionalmente complexas do sistema, com mini calendário, filtros laterais, tabela detalhada de plantões, tabs de escala/histórico e modais de gestão. Apesar da boa estrutura de UX, a página usa o tema base do projeto (warm/âmbar), que contrasta fortemente com o estilo "Bento Blue" adotado nas páginas de Dashboard, Serviços, Colaboradores e Cobertura. O objetivo é revestir a página com o mesmo padrão visual sem redesenhar o fluxo.

## Goals / Non-Goals

**Goals:**
- Alinhar cores, tipografia, espaçamentos e componentes da Escala ao padrão Bento Blue.
- Adicionar um hero banner gradiente azul com KPIs no topo da página.
- Refazer cards para branco `#FFFFFF` com borda `#E4ECF5` e radius 18–24px.
- Migrar botões CTA primários para gradiente `from-[#1F5BA8] to-[#4A9EF5]`.
- Reestilizar tabela, mini calendário, filtros e badges para o tom azul Prestek.
- Garantir que o dark mode fique consistente com as páginas de referência.

**Non-Goals:**
- Redesenhar o layout de 2 colunas ou o fluxo de filtros.
- Adicionar novas funcionalidades (ex: novos tipos de filtro, novos modais).
- Extrair um design system global compartilhado nesse momento.
- Alterar `tailwind.config.js` ou `index.css` (mudanças serão locais).

## Decisions

- **Paleta:** Usar o mesmo objeto de cores hardcoded das páginas de referência: fundo `#F5F9FF`, superfície `#FFFFFF`, accent `#4A9EF5`, accentDeep `#1F5BA8`, accentSoft `#EAF4FF`, ink `#0B1B2E`, ink2 `#475467`, muted `#8896A8`, line `#E4ECF5`, cyan `#7FD4E8`.
  - *Rationale:* Mantém consistência visual direta com Dashboard, Serviços, Colaboradores e Cobertura. Como essas páginas já usam hardcode, copiar o padrão é o caminho mais rápido e seguro.
  - *Alternative considered:* Criar tokens semânticos globais. Rejeitado porque fugiría do escopo e poderia impactar outras páginas que ainda usam o tema warm.

- **Hero Banner:** Criar um banner full-width gradiente `120deg #1F5BA8 → #2D7BD4 → #4A9EF5` contendo título, subtítulo e KPI pills glassmorphism.
  - *Rationale:* O padrão de hero já estabelecido em Colaboradores e Serviços cria hierarquia visual e aproveita o espaço superior para informações de alto valor.
  - *KPIs sugeridos:* Total de plantões no mês, colaboradores escalados, dias com cobertura, alterações no mês.

- **Cards:** Fundo branco sólido, borda `#E4ECF5`, `border-radius: 20px`, sombra suave azul (`0 4px 24px rgba(74,158,245,0.08)`).
  - *Rationale:* Substituir o glassmorphism/surface warm pelo padrão de cards brancos das páginas de referência.

- **Tabela:** Header com fundo `#F5F9FF` ou `#EAF4FF`, texto `#475467` em labels uppercase mono; linhas com hover `#EAF4FF`; bordas `#E4ECF5`.
  - *Rationale:* Manter legibilidade e hierarquia, mas no tom azul.

- **Mini Calendário:** Dias selecionados em azul `#4A9EF5` com texto branco; dias com plantão com dot azul; hover em `#EAF4FF`.
  - *Rationale:* Alinhar o calendário ao restante da página sem mudar sua lógica.

- **Fonte:** Forçar `font-family: "Plus Jakarta Sans"` no container da página, mantendo o padrão das referências.
  - *Rationale:* Tipografia é um dos elementos que mais contribuem para a sensação de que a Escala "não pertence" ao mesmo sistema.

## Risks / Trade-offs

- **Risco de regressão no tema warm:** A `Schedule.jsx` usa tokens Tailwind como `bg-primary` e `surface-container-*`. Trocar para hardcode azul pode fazer com que futuras mudanças no tema global não se reflitam aqui.
  - *Mitigation:* Documentar explicitamente que essa página usa o tema Bento Blue localmente. Considerar, no futuro, uma refatoração para tokens compartilhados.

- **Risco de inconsistência nos componentes filhos:** `CalendarDay`, `ScheduleRow` e os modais podem ter cores espalhadas em múltiplos lugares.
  - *Mitigation:* Fazer uma varredura por tokens warm/âmbar (`#ff8c00`, `surface-container`, `bg-primary` sem contexto) dentro dos arquivos da escala e ajustar todos de uma vez.

- **Risco de confusão entre cor primária e cor semântica:** O âmbar pode estar sendo usado como status/alerta (ex: plantão pendente).
  - *Mitigation:* Manter âmbar/vermelho/verde apenas para semáforos de status. Azul deve ser a cor primária da interface, não a única cor.

- **Custo visual em telas pequenas:** O hero banner adiciona altura vertical.
  - *Mitigation:* Tornar o hero responsivo, reduzindo padding e reorganizando KPI pills em telas menores.
