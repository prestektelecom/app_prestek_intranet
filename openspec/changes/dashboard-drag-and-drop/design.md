## Context

A Dashboard atual (`Dashboard.jsx`) é composta por componentes estáticos organizados através de classes do Tailwind CSS e CSS Grid. Apesar de funcional, essa abordagem não permite personalização, limitando a usabilidade para diferentes perfis de usuário. O objetivo é introduzir um sistema de Drag and Drop que permita reordenar e redimensionar os widgets. O layout escolhido deve persistir entre sessões usando o banco de dados PostgreSQL existente.

## Goals / Non-Goals

**Goals:**
- Implementar um grid interativo que suporte arrastar (drag) e redimensionar (resize).
- Criar um estado de "Modo de Edição" global na Dashboard para evitar modificações acidentais pelo usuário.
- Persistir as coordenadas e tamanhos dos widgets em um banco de dados PostgreSQL para manter o estado entre logins.
- Garantir que o grid seja responsivo e funcione de forma consistente (graceful degradation) em telas menores.

**Non-Goals:**
- Criação de novos widgets de visualização de dados (escopo focado apenas na reorganização dos existentes).
- Compartilhamento de layouts entre diferentes usuários.
- Edição do conteúdo interno dos widgets (apenas o contêiner será redimensionável).

## Decisions

- **Biblioteca de Grid (Frontend):** Utilizaremos `react-grid-layout`.
  - *Rationale:* É a biblioteca mais consolidada no ecossistema React para dashboards arrastáveis e redimensionáveis. Suporta breakpoints responsivos de forma nativa e facilita o carregamento e salvamento de layouts complexos através de um array de objetos JSON simples `{i, x, y, w, h}`.
  - *Alternatives considered:* `@dnd-kit/core` (requereria construir a lógica 2D e de colisão do zero, sendo muito low-level), `react-beautiful-dnd` (focado em listas verticais/horizontais, não em grids de duas dimensões com redimensionamento).
- **Armazenamento (Backend):** Adição de uma nova tabela `user_dashboard_layouts` no PostgreSQL.
  - *Rationale:* Separar os layouts da tabela de usuários principal evita poluir a tabela base e permite escalar para suportar múltiplos layouts por usuário no futuro, além de utilizar o poder do campo tipo `JSONB` do Postgres.
  - *Estrutura sugerida:* `user_id (varchar/int)`, `layout (jsonb)`, `updated_at (timestamp)`.
- **Estratégia do "Modo de Edição":**
  - *Rationale:* Um botão flutuante ou no Header (ex: "Personalizar Dashboard") alternará uma variável de estado `isEditing`. Quando `false`, a propriedade `isDraggable` e `isResizable` do `react-grid-layout` estarão desabilitadas e os widgets agirão como cards estáticos normais.

## Risks / Trade-offs

- **Conflitos de Responsividade:** O React Grid Layout exige que o desenvolvedor defina layouts específicos para diferentes breakpoints (ex: 'lg', 'md', 'sm').
  - *Mitigation:* Definir um layout default de fallback que enfileira os widgets em telas de celular, ignorando o layout personalizado apenas nessas resoluções, já que redimensionar cards complexos em telas touch é difícil.
- **Risco de Performance na API:** Salvar a cada pixel movido geraria overload na API.
  - *Mitigation:* Só enviaremos o layout para o backend via debounce ou quando o usuário clicar em "Salvar / Sair do modo de edição".
