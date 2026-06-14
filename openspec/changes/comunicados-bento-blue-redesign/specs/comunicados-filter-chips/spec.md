## ADDED Requirements

### Requirement: Chips de filtro por tipo com contagem
A barra de filtros SHALL exibir chips estilo Bento Blue para cada tipo de comunicado (Todas, Urgente, Importante, Geral), com contagem do número de comunicados por tipo, calculada sobre os comunicados já filtrados por busca de texto.

#### Scenario: Chip ativo
- **WHEN** o filtro "Urgente" está ativo
- **THEN** o chip "Urgente" exibe `border: 1.5px solid C.danger`, `background: rgba(danger, 0.12)` e `color: C.danger`

#### Scenario: Chip inativo com hover
- **WHEN** o usuário passa o mouse sobre um chip inativo
- **THEN** o chip exibe `background: C.surfaceSoft` com transição suave

#### Scenario: Contagem por tipo
- **WHEN** existem 3 comunicados Urgentes e 5 Gerais
- **THEN** o chip "Urgente" exibe o badge "3" e o chip "Geral" exibe "5"

#### Scenario: Contagem considera busca ativa
- **WHEN** o usuário digitou "sistema" na busca e existem 2 comunicados com essa palavra
- **THEN** os chips exibem a contagem somente dos 2 comunicados filtrados por busca

### Requirement: Select de ordenação Bento Blue
O select de ordenação SHALL usar `color: C.ink`, `border: 1px solid C.line`, `borderRadius: 10`, background `C.surface` e ícone de filtro em `C.accent`.

#### Scenario: Ordenação por mais recentes
- **WHEN** o usuário seleciona "Mais recentes primeiro"
- **THEN** os comunicados são ordenados decrescentemente por `criado_em`

#### Scenario: Ordenação por autor
- **WHEN** o usuário seleciona "Ordenar por Autor"
- **THEN** os comunicados são ordenados alfabeticamente por `departamento_autor`
