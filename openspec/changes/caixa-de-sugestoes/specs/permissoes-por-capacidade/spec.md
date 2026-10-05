## MODIFIED Requirements

### Requirement: Catálogo de capacidades
O catálogo de capacidades de gestão SHALL ser `comunicados`, `plantao`, `usuarios`, `auditoria`, `ti` e `sugestoes`. Valor fora do catálogo SHALL ser sempre rejeitado pelo backend, e `is_admin` SHALL continuar valendo como todas as capacidades.

#### Scenario: Conceder a nova capacidade
- **WHEN** um administrador concede `sugestoes` a um usuário
- **THEN** o usuário SHALL passar a acessar as rotas de gestão de sugestões na requisição seguinte

#### Scenario: Capacidade desconhecida
- **WHEN** é enviada uma capacidade fora do catálogo
- **THEN** o backend SHALL recusá-la
