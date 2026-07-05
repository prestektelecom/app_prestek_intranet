## Context

A página de Processos Operacionais (`Processos.jsx`) é a central de gerenciamento de POPs, fluxos de trabalho e procedimentos internos da Prestek. Ela contém busca textual, filtros por categoria em pills, uma tabela desktop, cards mobile, paginação, modal CRUD e cards de resumo por categoria. Apesar da boa estrutura de UX, a página usa o tema base do projeto (warm/âmbar), que contrasta fortemente com o estilo "Bento Blue" adotado nas páginas de referência. O objetivo é revestir a página com o mesmo padrão visual sem redesenhar o fluxo.

## Goals / Non-Goals

**Goals:**
- Alinhar cores, tipografia, espaçamentos e componentes de Processos ao padrão Bento Blue.
- Adicionar um hero banner gradiente azul com KPIs no topo da página.
- Refazer cards para branco `#FFFFFF` com borda `#E4ECF5` e radius 18–24px.
- Migrar botões CTA primários para gradiente `from-[#1F5BA8] to-[#4A9EF5]`.
- Reestilizar tabela desktop, cards mobile, paginação e badges para o tom azul Prestek.
- Reestilizar o modal CRUD de processos com inputs `#F7FAFD`, bordas `#E4ECF5` e botão salvar gradiente azul.
- Garantir que o dark mode fique consistente com as páginas de referência.

**Non-Goals:**
- Redesenhar o layout ou o fluxo de busca/filtros.
- Adicionar novas funcionalidades (ex: novos campos no modal, novos status).
- Extrair um design system global compartilhado nesse momento.
- Alterar `tailwind.config.js` ou `index.css` (mudanças serão locais).

## Decisions

- **Paleta:** Usar o mesmo objeto de cores hardcoded das páginas de referência: fundo `#F5F9FF`, superfície `#FFFFFF`, accent `#4A9EF5`, accentDark `#2D7BD4`, accentDeep `#1F5BA8`, accentSoft `#EAF4FF`, ink `#0B1B2E`, ink2 `#475467`, muted `#8896A8`, line `#E4ECF5`, cyan `#7FD4E8`.
  - *Rationale:* Mantém consistência visual direta com Dashboard, Serviços, Colaboradores, Cobertura, Escala e Escritórios. Como essas páginas já usam hardcode, copiar o padrão é o caminho mais rápido e seguro.
  - *Alternative considered:* Criar tokens semânticos globais. Rejeitado porque fugiría do escopo e poderia impactar outras páginas que ainda usam o tema warm.

- **Hero Banner:** Criar um banner full-width gradiente `120deg #1F5BA8 → #2D7BD4 → #4A9EF5` contendo título, subtítulo e KPI pills glassmorphism.
  - *Rationale:* O padrão de hero já estabelecido em Colaboradores, Serviços, Escala e Escritórios cria hierarquia visual e aproveita o espaço superior para informações de alto valor.
  - *KPIs sugeridos:* Total de processos, processos ativos, processos em revisão, total de categorias.

- **Cards:** Fundo branco sólido, borda `#E4ECF5`, `border-radius: 20px`, sombra suave azul.
  - *Rationale:* Substituir o surface warm pelo padrão de cards brancos das páginas de referência.

- **Tabela:** Header com fundo `#F7FAFD`, texto `#475467` em labels uppercase; linhas com hover `#EAF4FF`; bordas `#E4ECF5`.
  - *Rationale:* Manter legibilidade e hierarquia, mas no tom azul.

- **Cards Mobile:** Manter a lista de cards como alternativa mobile, aplicando os mesmos padrões de cor, hover e borda da tabela.
  - *Rationale:* Garantir consistência visual em todas as resoluções.

- **Paginação:** Fundo `#F7FAFD`, borda `#E4ECF5`, botões com hover `#EAF4FF` e texto `#475467`/`#0B1B2E`.
  - *Rationale:* Integrar a paginação ao novo padrão visual sem alterar seu comportamento.

- **Modal CRUD:** Header com fundo branco, corpo com inputs em `#F7FAFD` e borda `#E4ECF5`, botão primário salvar com gradiente azul, botão cancelar branco com borda azul.
  - *Rationale:* Alinhar o modal ao padrão Bento Blue já usado nos modais de Escala e Escritórios.

- **Fonte:** Forçar `font-family: "Plus Jakarta Sans"` no container da página, mantendo o padrão das referências.
  - *Rationale:* Tipografia é um dos elementos que mais contribuem para a sensação de que a página "não pertence" ao mesmo sistema.

## Risks / Trade-offs

- **Risco de regressão no tema warm:** A `Processos.jsx` usa tokens Tailwind como `bg-primary` e `surface-container-*`. Trocar para hardcode azul pode fazer com que futuras mudanças no tema global não se reflitam aqui.
  - *Mitigation:* Documentar explicitamente que essa página usa o tema Bento Blue localmente. Considerar, no futuro, uma refatoração para tokens compartilhados.

- **Risco de inconsistência nos componentes internos:** Modal, tabela, cards mobile e paginação possuem cores espalhadas em múltiplos lugares.
  - *Mitigation:* Fazer uma varredura por tokens warm/âmbar (`#ff8c00`, `#a17745`, `#eaddcd`, `surface-container`, `bg-primary` sem contexto) dentro do arquivo e ajustar todos de uma vez.

- **Risco de confusão entre cor primária e cor semântica:** O âmbar pode estar sendo usado como status/alerta.
  - *Mitigation:* Manter âmbar/vermelho/verde/amarelo apenas para semáforos de status. Azul deve ser a cor primária da interface, não a única cor.

- **Custo visual em telas pequenas:** O hero banner adiciona altura vertical.
  - *Mitigation:* Tornar o hero responsivo, reduzindo padding e reorganizando KPI pills em telas menores.
