## Why

Usuários com `is_admin = true` no banco (confirmado para `marciofelix@prestek.com.br`, e confirmado de forma independente pelo middleware `adminAuth` do backend) não veem os elementos de UI restritos a admin (menu "TI" no Sidebar, botão "Gerenciar Categorias" em Processos Operacionais) mesmo após um logout completo e novo login. O banco e o backend concordam que o usuário é admin; o front-end não reflete isso. Sem corrigir essa propagação, nenhuma funcionalidade admin-only da interface (incluindo a de gerenciar categorias de processos, já corrigida em `fix-categorias-processos-500`) é utilizável, mesmo por quem tem permissão.

## What Changes

- Instrumentar temporariamente o fluxo de login/estado (`src/services/auth.js` → `src/hooks/useLogin.js` → `src/App.jsx`) com um indicador visível na própria UI (sem depender de DevTools) do valor de `is_admin` em cada etapa, para localizar exatamente onde o valor se perde entre a resposta do backend e o estado `user`.
- Corrigir a causa raiz identificada, garantindo que `user.is_admin` no front-end reflita fielmente o valor retornado por `POST /api/login`.
- Remover a instrumentação temporária após a correção ser confirmada.

## Capabilities

### New Capabilities
- `sessao-permissao-admin`: garante que o status de administrador do usuário autenticado seja propagado corretamente do backend até o estado da aplicação no front-end, e reflita corretamente nos elementos de UI condicionados a ele.

### Modified Capabilities
(nenhuma — não há spec existente cobrindo login ou permissões de admin)

## Impact

- **Frontend**: `src/services/auth.js` (`loginUsuario`), `src/hooks/useLogin.js` (`handleSubmit`), `src/App.jsx` (`onLogin`, estado `user`), `src/components/Sidebar.jsx` (gate `somenteAdmin`), `src/components/Processos.jsx` (gate do botão "Gerenciar Categorias").
- **Backend**: nenhuma mudança esperada — `POST /api/login` e `adminAuth` (`backend/server.js`) já foram confirmados corretos nesta investigação; qualquer achado que contradiga isso deve ser revalidado antes de alterar o backend.
- **Usuários afetados**: todo usuário com `is_admin = true` no banco, não só `marciofelix@prestek.com.br`.
