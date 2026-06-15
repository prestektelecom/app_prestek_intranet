## ADDED Requirements

### Requirement: Botão de filtro da Auditoria usa hex Bento Blue
O botão de filtro em `src/components/admin/AdminAuditoria.jsx` SHALL usar cores hex Bento Blue em vez de classes semânticas `bg-primary`/`hover:bg-primary/90`.

#### Scenario: Estado normal
- **WHEN** o botão "Filtrar" é renderizado
- **THEN** o background SHALL ser `#4A9EF5` e o texto `#FFFFFF`

#### Scenario: Estado hover
- **WHEN** o usuário passa o mouse sobre o botão "Filtrar"
- **THEN** o background SHALL mudar para `#2D7BD4`
