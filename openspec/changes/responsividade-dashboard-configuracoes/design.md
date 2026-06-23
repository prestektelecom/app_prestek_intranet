## Context

A aplicação usa Tailwind CSS como base de estilos, mas vários componentes críticos misturam classes Tailwind com estilos inline fixos (`width`, `fontSize`, `padding`, `gridTemplateColumns`). O `App.jsx` já possui a estrutura responsiva de alto nível: sidebar oculta em mobile (`hidden lg:flex`), bottom navigation visível apenas em mobile (`flex lg:hidden`) e padding inferior para compensar a barra (`pb-[64px] lg:pb-0`).

Os problemas estão nos componentes internos:
- **Dashboard.jsx**: usa `react-grid-layout` com `layouts={{ lg: layout }}` apenas. Os widgets `SetorBento`, `HeroCard`, `OsBento` e `ComunicadosCard` possuem tamanhos/paddings/fontes fixas inline.
- **Configuracoes.jsx**: usa um grid de 12 colunas sem breakpoints; o card lateral ocupa `span 4` e o formulário `span 8`, ficando lado a lado em qualquer largura. Campos internos usam `grid-cols-2` fixo.
- **Header.jsx**: a busca e as ações ocupam espaço fixo; em telas muito estreitas os ícones de ação podem empurrar a busca.

## Goals / Non-Goals

**Goals:**
- Dashboard deve empilhar widgets verticalmente em telas < 768px e manter o layout em grid acima de 1024px.
- Hero e KPIs da Dashboard devem escalar fontes, paddings e grids internos em mobile.
- Configurações deve empilhar card lateral e formulário em telas < 1024px.
- Formulários de Configurações devem usar coluna única em mobile e duas colunas em desktop.
- Header deve manter busca e ações visíveis sem overflow em larguras a partir de 320px.

**Non-Goals:**
- Não refatorar o theming system (`useBentoTheme`).
- Não alterar funcionalidades ou lógica de dados.
- Não criar versões mobile totalmente diferentes das telas (manter a mesma estrutura, apenas adaptável).
- Não mexer em outras telas fora Dashboard, Configurações e ajustes mínimos no Header.

## Decisions

1. **Tailwind-first para breakpoints, inline styles apenas para tokens de cor**
   - Rationale: Tailwind já está no projeto e é a ferramenta padrão para responsividade. Estilos inline fixos serão convertidos em classes utilitárias responsivas sempre que possível; tokens de cor (`C.surface`, `C.line`) continuam inline porque vêm do `useBentoTheme`.

2. **Dashboard: definir layouts md/sm/xs no react-grid-layout**
   - Rationale: O componente já suporta breakpoints, mas só tem layout `lg`. Adicionar `md`, `sm`, `xs` e `xxs` permite que cada widget ocupe a largura total em mobile sem reescrever os cards.

3. **Configurações: mudar grid de 12 colunas para `grid-cols-1 lg:grid-cols-12`**
   - Rationale: É a mudança mínima necessária para empilhar sidebar e conteúdo em mobile. O card lateral vira uma seção superior em telas pequenas.

4. **Header: esconder a busca e ações em um botão "mais" apenas se necessário**
   - Rationale: A prioridade é não quebrar. Se bastar ajustar `flex-shrink`, `min-width` e gaps, não criamos novo menu. Se 320px ainda quebrar, escondemos notificações/admin/logout em um sheet/dropdown.

5. **Manter a experiência desktop inalterada**
   - Rationale: A maioria dos usuários acessa de desktop. As alterações devem afetar apenas breakpoints abaixo de `lg`/`md`.

## Risks / Trade-offs

- **[Risk] Regressão visual no desktop** → Mitigation: testar em 1920px, 1440px e 1024px; manter valores atuais como padrão para `lg`+.
- **[Risk] `react-grid-layout` ignora layouts menores se houver inconsistência de chaves** → Mitigation: garantir que todos os layouts (`lg`, `md`, `sm`, `xs`, `xxs`) contenham as mesmas chaves de widgets.
- **[Risk] Header em 320px ainda pode ficar apertado** → Mitigation: se ajustes simples não resolverem, esconder ações secundárias em menu compacto.
- **[Trade-off] Paddings menores em mobile** → A estética premium do design Bento pode parecer mais compacta, mas é necessário para caber na tela.
