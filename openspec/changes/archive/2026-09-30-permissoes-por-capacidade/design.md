## Context

Hoje todo acesso administrativo passa por `adminAuth` (`backend/server.js:4422`), que lê `usuarios_perfil.is_admin` pelo e-mail do JWT. São ~30 rotas com esse gate, de áreas sem relação entre si (comunicados, plantões, TI, cobertura, processos). O JWT carrega só `{ id, email, nome }` e expira em 12 h (`backend/middleware/auth.js`); `is_admin` nunca vai no token, vem do banco a cada chamada. O frontend guarda o usuário em `@Stitch:user` e o gate de UI (`navigation.js`) é só `is_admin`. Não há staging: o banco local é o de produção e `migrations/run.js` reexecuta todos os `.sql`.

Motivação e escopo: ver `proposal.md`. Requisitos observáveis: `specs/`.

## Goals / Non-Goals

**Goals:**
- Uma fonte única de verdade de autorização (banco), consultada por requisição, que a API e a UI leem da mesma forma.
- Trocar `adminAuth` por um gate por capacidade só onde há capacidade correspondente, sem reabrir rotas de administração pura.
- Conceder permissão ser ação de `is_admin` apenas, auditada e com confirmação nominal.

**Non-Goals:**
- Não muda navegação, layout nem o gate de `App.jsx`/`navigation.js` (é a change `gestao-no-shell`).
- Sem permissões por ação (ler vs. editar), por setor, nem múltiplos grupos do IXC. `nome_grupo` não entra na autorização.
- Não reescreve `run.js` nem cria `schema_migrations` (pendência separada do `MEMORIA.md`).

## Decisions

### 1. Permissão por capacidade em tabela local, não `nome_grupo` do IXC
`usuarios_permissoes(usuario_id, permissao, concedido_por, concedido_em)` com PK `(usuario_id, permissao)`, FK para `usuarios_perfil(usuario_id)` com `ON DELETE CASCADE`. Sem `CHECK` de valores: o catálogo mora no código, então acrescentar uma capacidade é uma mudança de código, não de migration.
- *Alternativa descartada: `nome_grupo`.* É texto livre de `grupos_nomes`, editável no Painel Admin (renomear desliga a permissão sem aviso), é o grupo de permissão do IXC (outro propósito) e só admite um grupo por usuário.
- *Alternativa descartada: coluna JSONB em `usuarios_perfil`.* Não permite `concedido_por`/`concedido_em` por permissão nem consulta indexada.

### 2. Resolver a permissão a cada requisição, não no JWT
Um helper faz uma única consulta por `usuario_id` do JWT (não por e-mail: `usuario_id` é `UNIQUE`, o e-mail não) e devolve `{ isAdmin, permissoes[] }`:

```
SELECT p.is_admin,
       COALESCE(array_agg(u.permissao) FILTER (WHERE u.permissao IS NOT NULL), '{}') AS permissoes
FROM usuarios_perfil p
LEFT JOIN usuarios_permissoes u ON u.usuario_id = p.usuario_id
WHERE p.usuario_id = $1
GROUP BY p.usuario_id
```

`adminAuth` passa a usar o mesmo helper (continua exigindo `isAdmin`), então não há segunda consulta por rota. O resultado fica em `req.acesso` para os handlers.
- *Alternativa descartada: permissões como claims no JWT.* Revogar só teria efeito ao expirar (até 12 h) ou exigiria lista de revogação. O spec exige efeito imediato.
- Sem cache no servidor: a consulta é indexada e substitui a que o `adminAuth` já fazia.

### 3. Middleware `requerPermissao(capacidade)` em módulo próprio
Novo `backend/middleware/permissoes.js` com o catálogo (`CAPACIDADES`), o helper e o middleware, recebendo o `pool` por parâmetro (mesmo padrão de injeção usado em `server.js`, sem importar o `server.js`, que é enorme). Comportamento: `isAdmin` ou capacidade presente → `next()`; senão 403 (`Permissão negada.`); perfil inexistente → 403; erro de banco → 503, igual ao `adminAuth`.

### 4. Mapa rota → capacidade

| Capacidade | Rotas |
|---|---|
| `comunicados` | `POST/PUT/DELETE /api/comunicados` |
| `plantao` | `POST/DELETE /api/plantoes`, `GET /api/plantoes/historico/export` |
| `usuarios` | `GET /api/admin/usuarios`, `POST /api/admin/grupos-nomes`, `grupos-supervisores`, `responsaveis-manuais`, `setores-descricoes` |
| `auditoria` | `GET /api/admin/auditoria` |
| `ti` | `GET/POST /api/ti/colaborador/*` (taxonomias, cidades, duplicado, dry-run, criar) |
| só `is_admin` | `PUT /api/admin/usuarios/:id/privilegios`, `PUT /api/admin/usuarios/:id/permissoes`, `/api/admin/configuracoes*`, `/api/admin/dashboard-stats`, `/api/cobertura-ixc/override`, `/api/processos*`, `/api/categorias-processos*` |

`dashboard-stats` fica só para `is_admin` porque a aba "Visão Geral" será cortada na `gestao-no-shell`; a decisão do que fazer com o endpoint é dela. Ao implementar, conferir com `grep adminAuth` que nenhuma rota da tabela ficou de fora.

### 5. `usuarios` cobre Responsáveis, grupos e descrições de setor
"Responsáveis" (rotas `grupos-nomes`, `grupos-supervisores`, `responsaveis-manuais`, `setores-descricoes`) edita estrutura organizacional e vive hoje na mesma área de gestão de pessoas. Em vez de inflar o catálogo com uma sexta capacidade, entra em `usuarios`. Consequência aceita: quem tem `usuarios` também lê a lista completa de usuários (nome, e-mail, situação, permissões). Se a operação pedir separar depois, é acrescentar uma capacidade e mover 4 rotas.

### 6. Atribuir permissões: `PUT /api/admin/usuarios/:id/permissoes`, só `adminAuth`
Corpo `{ permissoes: string[] }` substitui o conjunto. Valida array, remove duplicatas, rejeita qualquer valor fora do catálogo (400) e usuário inexistente (404). Numa transação calcula o diff contra o estado atual, apaga as removidas e insere as novas com `concedido_por = req.usuario.email`. Para cada capacidade alterada chama `registrarAuditoria` com `grant_permissao`/`revoke_permissao` e descrição no padrão de `grant_admin`. Diff vazio → não grava nem audita. Nunca lê `is_admin` do corpo nem aceita `usuario_id` fora da URL. Só `is_admin` chama: quem tem `usuarios` não consegue se promover.
- A auditoria segue o comportamento atual de `registrarAuditoria`, que engole falhas (`console.warn`). Não é mudado aqui.

### 7. Login e revalidação
`POST /api/login` acrescenta `permissoes` dentro do objeto `usuario` (assim `App.jsx` já o espalha para o estado via `...resultado.usuario` e `services/auth.js` repassa sem mudança). Se a sincronização de perfil falhar, `permissoes = []`. Novo `GET /api/permissoes/minhas` (só `requireAuth`) devolve `{ is_admin, permissoes }` do usuário do JWT; não lê nenhum parâmetro de identidade. O frontend usa esse endpoint na `gestao-no-shell` para revalidar ao abrir a área.

### 8. UI de atribuição em `AdminUsuarios`
Por linha de usuário não administrador, um controle "Permissões" abre um diálogo (`role="dialog"`, foco preso, Escape, mesmo hook `useDismissable`/`makeTrapTab` já usado no diálogo de conceder admin). Dentro, um `fieldset` com `legend` e um checkbox por capacidade, com rótulo e descrição curta. O botão de salvar só habilita com diferença; ao acionar, o mesmo diálogo passa para uma etapa de confirmação nominal ("Dar a Fulano acesso a Comunicados e retirar Plantões?"), e só o botão de confirmar dispara a requisição. Erro fica dentro do diálogo com `role="alert"`. Para administradores a linha mostra "Todas as capacidades (administrador)", sem controle. Rótulos e descrições vivem em `src/constants/permissoes.js`; o backend é a autoridade e o frontend ignora valores que não conhece.
- *Alternativa descartada: dropdown único de grupo.* Só serve ao modelo de um grupo por usuário.

## Risks / Trade-offs

- **Refatorar `adminAuth` mexe em ~30 rotas** → mantém a mesma resposta (401/403/503) e o mesmo critério (`is_admin`); mudam só a chave da consulta (id em vez de e-mail) e o reuso do helper. Verificar por amostragem em rotas de cada grupo com um token de admin e um de não-admin.
- **Migration em banco único sem staging** → `023` é `CREATE TABLE IF NOT EXISTS`, sem seed, e deve ser aplicada só com `psql -f` (nunca pelo `run.js` inteiro, ver Pendências do `MEMORIA.md`).
- **Testar exige escrita em produção** (conceder e revogar numa conta real) → só com autorização explícita do Felix e sobre uma conta de teste, revertendo ao estado original; o acesso 403/200 pode ser verificado com JWT assinado localmente para a mesma conta, como já feito em 2026-09-18/19.
- **Sem efeito de UI para não-admins até a `gestao-no-shell`** → intencional; nesta change o ganho é a fronteira de segurança na API. Documentar no `MEMORIA.md` para ninguém concluir que o recurso "não funciona".
- **Catálogo duplicado (backend e `src/constants/permissoes.js`)** → o backend valida; se o frontend estiver defasado, uma capacidade nova aparece sem rótulo e não é atribuível pela UI, mas nada quebra. Comentário nos dois lados.
- **Amplitude de `usuarios`** (lista completa de usuários visível a quem a tem, ver Decisão 5) → aceita e registrada; quem concede a capacidade decide.
- **Permissão concedida a alguém que depois vira admin ou é desativado** → as linhas ficam, mas são irrelevantes para admin; para usuário inativo o login já é bloqueado pelo IXC. Nada a limpar agora.

## Migration Plan

1. Aplicar `023_usuarios_permissoes.sql` no banco com `psql -f` (com autorização do Felix); conferir com `\d usuarios_permissoes`.
2. Publicar o backend (middleware, rotas, login). Sem linhas na tabela, o comportamento de todos é idêntico ao de hoje: só `is_admin` acessa.
3. Publicar o frontend (`AdminUsuarios`, `permissoes` no estado).
4. Rollback: reverter o deploy do backend/frontend; a tabela vazia ou preenchida é inofensiva e pode ficar. `DROP TABLE usuarios_permissoes` só se a change for abandonada.

## Open Questions

- Qual conta não-admin real usar nos testes (Everton, usuário 467, já usado em outras verificações, ou outra)? Definir antes da tarefa de verificação.
