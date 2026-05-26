# user-layout-persistence Specification

## Purpose
TBD - created by archiving change dashboard-drag-and-drop. Update Purpose after archive.
## Requirements
### Requirement: Salvar Layout do Usuário
O sistema SHALL disponibilizar um endpoint (ex: `POST /api/user/dashboard-layout`) para salvar as configurações JSON de posição e tamanho de cada widget para o usuário logado.

#### Scenario: Salvar novo layout
- **WHEN** o usuário altera o layout e sai do modo de edição
- **THEN** o frontend dispara uma requisição de salvamento, e o backend sobrescreve ou cria o JSONB na tabela `user_dashboard_layouts` para aquele usuário.

### Requirement: Carregar Layout do Usuário
O sistema SHALL carregar o layout preferido do usuário ao iniciar a sessão através do endpoint `GET /api/user/dashboard-layout`.

#### Scenario: Usuário com layout salvo
- **WHEN** o usuário entra na Dashboard e existe configuração salva
- **THEN** o sistema carrega os dados e posiciona os widgets de acordo com o último salvamento.

#### Scenario: Usuário sem layout salvo (novo acesso)
- **WHEN** o usuário entra pela primeira vez e não há configuração de layout
- **THEN** o sistema aplica e exibe um layout padrão "default" (fixado via código no front).

