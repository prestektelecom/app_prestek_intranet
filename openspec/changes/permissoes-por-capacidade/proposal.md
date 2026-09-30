## Why

O acesso administrativo é binário: `usuarios_perfil.is_admin` libera tudo (Comunicados, Plantões, Usuários, Auditoria, TI) ou nada. Não dá para deixar a RH só publicar comunicados, nem o supervisor de TI só ver o histórico de plantões, sem torná-los administradores plenos. E o backend só conhece `is_admin` (`adminAuth`), então qualquer regra por grupo feita só na interface seria cosmética.

Esta é a primeira de duas changes. Ela cria o modelo de permissões e o faz valer **na API**, que é a fronteira de segurança. A segunda (`gestao-no-shell`) muda a navegação do Painel Admin para usar essas permissões.

## What Changes

- Nova tabela `usuarios_permissoes` (migration idempotente) guardando permissões por **capacidade** para cada usuário. `is_admin = true` continua valendo como "todas", sem migração de dados.
- Catálogo fixo de capacidades no backend: `comunicados`, `plantao`, `usuarios`, `auditoria`, `ti`.
- Novo middleware `requerPermissao(capacidade)` que libera quem é admin **ou** tem a capacidade, consultando o banco a cada requisição (revogar tem efeito imediato, sem depender de novo login).
- Rotas administrativas trocam `adminAuth` por `requerPermissao(...)` conforme a capacidade que protegem. As rotas de administração pura (privilégio de admin, configurações globais, cobertura, processos, categorias) continuam só para `is_admin`.
- Conceder e revogar permissões é ação **exclusiva de `is_admin`**, nunca de quem tem só uma capacidade (evita auto-promoção).
- `POST /api/login` passa a devolver `permissoes` no objeto do usuário; novo `GET /api/permissoes/minhas` revalida sem novo login.
- `AdminUsuarios` ganha a atribuição de permissões (multisseleção por capacidade) com confirmação nominal, botão que descreve a ação e registro em Auditoria, seguindo o padrão já adotado para conceder admin.
- **Sem mudança de navegação nesta change**: `navigation.js`/`App.jsx` continuam com gate por `is_admin`. Um não-admin com permissões só alcança as rotas via API até a `gestao-no-shell` ser entregue.

## Capabilities

### New Capabilities
- `permissoes-por-capacidade`: modelo de permissões por capacidade (tabela, catálogo, resolução por requisição, middleware, proteção das rotas, payload de login e endpoint de revalidação).

### Modified Capabilities
- `admin-usuarios-seguranca`: passa a cobrir também a atribuição de permissões por capacidade (confirmação nominal, rótulo da ação, registro em Auditoria, erro anunciável).
- `sessao-permissao-admin`: o estado do usuário no front-end passa a incluir `permissoes` além de `is_admin`.

## Impact

- **Backend** (`backend/server.js`): novo middleware e helper de resolução; ~10 rotas trocam de `adminAuth` para `requerPermissao`; rotas novas `PUT /api/admin/usuarios/:id/permissoes` e `GET /api/permissoes/minhas`; `GET /api/admin/usuarios` passa a devolver `permissoes` por usuário; `POST /api/login` devolve `permissoes`.
- **Banco**: migration `023_usuarios_permissoes.sql`. O banco é o mesmo de dev e produção e não há staging; `run.js` reexecuta todas as migrations, então a nova precisa ser idempotente e aplicada só com `psql -f` (ver Pendências do `MEMORIA.md`).
- **Frontend**: `src/components/admin/AdminUsuarios.jsx` (atribuição e diálogo), `src/App.jsx` e `src/services/auth.js` (`permissoes` no estado), `iconeAcao.js` (ícones das ações novas de Auditoria). Como toca interface, exige `/impeccable audit` antes de concluir (CLAUDE.md).
- **Segurança**: sem cache de permissão no servidor e sem confiar em nada vindo do cliente. Testar exige uma conta não-admin real e escrita em produção, que só rodam com autorização explícita do Felix.
- **Dependência da change seguinte**: `gestao-no-shell` lê `permissoes` do estado do usuário e assume estas rotas.
