## ADDED Requirements

### Requirement: KPIs e Bento cards empilham em telas estreitas
O layout responsivo do Dashboard SHALL garantir que widgets internos com múltiplas colunas empilhem seus elementos em telas pequenas.

#### Scenario: KPI em mobile
- **WHEN** um widget de KPI é renderizado em uma viewport menor que `md` (768px)
- **THEN** os indicadores internos do KPI são empilhados verticalmente em vez de forçar 3 colunas fixas

#### Scenario: Bento card interno em mobile
- **WHEN** um Bento card contém um grid interno de 3 colunas
- **THEN** abaixo de `md` o grid interno se torna 1 coluna e abaixo de `lg` pode se tornar 2 colunas

#### Scenario: Layout salvo respeita breakpoints
- **WHEN** o `react-grid-layout` salva o layout do usuário
- **THEN** o sistema salva layouts para múltiplos breakpoints (`lg`, `md`, `sm`, `xs`) e não apenas para `lg`
