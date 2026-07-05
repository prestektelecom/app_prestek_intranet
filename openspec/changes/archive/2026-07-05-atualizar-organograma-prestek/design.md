## Context

A página de Setores (`src/components/Sectors.jsx`) já possui um componente `OrgChart` estilizado no padrão Bento Blue (cards arredondados, gradiente roxo, sombras suaves, tipografia JetBrains Mono). No entanto, esse componente está hardcoded com uma hierarquia genérica: CEO Jonathan Prestek → 4 diretorias (TI, Operações, Vendas & MKT, Suporte), sem subníveis.

A direção definiu que o organograma deve refletir a estrutura real da Prestek Telecom, conforme imagem de referência. A implementação continuará hardcoded no frontend, sem alterações no banco PostgreSQL.

## Goals / Non-Goals

**Goals:**
- Atualizar o componente `OrgChart` para exibir a hierarquia real da Prestek.
- Representar corretamente os 6 braços abaixo do CEO, incluindo sub-setores.
- Diferenciar visualmente as áreas de staff (RH e TI) com linhas tracejadas.
- Manter 100% do estilo visual Bento Blue atual.
- Garantir que o layout continue responsivo e com scroll horizontal em telas pequenas.

**Non-Goals:**
- Criar ou alterar tabelas no PostgreSQL.
- Tornar o organograma dinâmico a partir de `/api/setores`.
- Alterar o "Diretório de Setores" abaixo do organograma.
- Adicionar animações complexas ou interatividade nos nós (clique, drag, etc.).

## Decisions

### 1. Modelo de dados: árvore hardcoded em vez de flat array
**Decisão:** Substituir o array `directors` por uma estrutura de árvore aninhada, onde cada nó pode ter `children`.
**Rationale:** A estrutura alvo possui 2 níveis (CEO → áreas → sub-setores). Um array flat não representa isso sem lógica extra. Uma árvore torna o layout recursivo mais simples e legível.
**Alternativa considerada:** Manter array flat com campo `parentId` e montar a árvore em runtime. Rejeitada porque, como os dados são hardcoded, aninhar diretamente é mais claro e menos propenso a erros.

### 2. Layout: colunas por área, com subnós empilhados verticalmente
**Decisão:** Cada área de primeiro nível será uma coluna. Os sub-setores serão empilhados verticalmente dentro da coluna, conectados por uma linha vertical contínua.
**Rationale:** O espaço horizontal é limitado; empilhar filhos verticalmente economiza largura e espelha o desenho da imagem alvo. As 6 colunas de primeiro nível podem exigir scroll horizontal, que já existe no componente (`overflowX: auto`).
**Alternativa considerada:** Layout em árvore horizontal. Rejeitada porque ocuparia muito espaço horizontal com nomes longos como "Supervisor Relacionamento com Cliente".

### 3. Staff: linha tracejada e posicionamento separado
**Decisão:** RH/Cultura Performance e TI/Sistemas/BI serão renderizados em uma segunda fileira, abaixo da fileira operacional, conectados ao CEO por linhas tracejadas.
**Rationale:** A imagem alvo mostra essas áreas como staff, separadas da linha de comando operacional. A linha tracejada é a convenção visual padrão para staff em organogramas.

### 4. Reutilizar `OrgNode` com variantes
**Decisão:** Evoluir o componente `OrgNode` para aceitar props como `size` (lg/sm), `isStaff`, e opcionalmente renderizar filhos.
**Rationale:** Mantém o código DRY. O nó raiz (CEO) continua grande, os nós de primeiro nível médios e os sub-setores menores.

### 5. Foto do CEO
**Decisão:** Substituir a URL hardcoded do Jonathan Prestek por uma URL/foto do Severino Júnior. Se não houver URL definida no momento da implementação, usar avatar genérico com ícone `person`.
**Rationale:** O nome do CEO mudou na estrutura; a foto deve refletir isso.

## Risks / Trade-offs

- **Risco:** Nomes longos podem quebrar layout em telas pequenas.
  - **Mitigação:** Manter `min-width` adequado no container, `overflowX: auto`, e ajustar `font-size` dos nós filhos. Testar em larguras a partir de 360px.
- **Risco:** A árvore com 6 colunas + filhos pode ficar alta demais.
  - **Mitigação:** Limitar altura do organograma com scroll interno ou manter compactação nos nós filhos (menor padding/fonte).
- **Trade-off:** Hardcoded significa que mudanças organizacionais exigirão novo PR.
  - **Mitigação:** Documentar claramente a estrutura no código para facilitar edições futuras.

## Migration Plan

Não há migração de dados ou deploy complexo. A mudança é puramente frontend:
1. Atualizar `src/components/Sectors.jsx`.
2. Verificar visualmente na página de Setores.
3. Validar responsividade em mobile.

## Open Questions

- Qual foto/avatar usar para o CEO Severino Júnior?
- O nome do responsável comercial deve ficar como "?", "À definir" ou omitido?
