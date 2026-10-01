## 1. Banco

- [x] 1.1 Criar `backend/migrations/023_usuarios_permissoes.sql`: `CREATE TABLE IF NOT EXISTS usuarios_permissoes` (`usuario_id VARCHAR(50)` com FK para `usuarios_perfil(usuario_id) ON DELETE CASCADE`, `permissao VARCHAR(50)`, `concedido_por VARCHAR(255)`, `concedido_em TIMESTAMPTZ DEFAULT NOW()`, PK `(usuario_id, permissao)`), sem seed e sem `CHECK`
- [x] 1.2 Reexecutar a migration duas vezes contra um banco descartável ou revisar linha a linha para confirmar que é idempotente (sem `INSERT`, só `IF NOT EXISTS`)
- [x] 1.3 Aplicar a 023 em produção só com `psql -f` e com autorização do Felix (nunca `run.js` inteiro); conferir com `\d usuarios_permissoes`

## 2. Backend — resolução e middleware

- [x] 2.1 Criar `backend/middleware/permissoes.js` com o catálogo `CAPACIDADES` (`comunicados`, `plantao`, `usuarios`, `auditoria`, `ti`) e o helper que devolve `{ isAdmin, permissoes }` por `usuario_id` numa só consulta (`LEFT JOIN` + `array_agg`), tratando perfil inexistente como sem acesso
- [x] 2.2 Implementar `requerPermissao(capacidade)` no mesmo módulo: admin ou capacidade → `next()` e `req.acesso` preenchido; senão 403 `Permissão negada.`; erro de banco → 503 igual ao `adminAuth`
- [x] 2.3 Refatorar `adminAuth` em `backend/server.js` para usar o helper (continua exigindo `isAdmin`, mesmas respostas 401/403/503) sem segunda consulta por rota
- [x] 2.4 Trocar `adminAuth` por `requerPermissao(...)` conforme a tabela da Decisão 4 do `design.md` (`comunicados`, `plantao`, `usuarios`, `auditoria`, `ti`); rodar `grep -n adminAuth backend/server.js` antes e depois e conferir que só as rotas "só `is_admin`" da tabela ficaram com `adminAuth`
- [x] 2.5 `GET /api/admin/usuarios`: incluir `permissoes` (lista ordenada) por usuário via subconsulta em `usuarios_permissoes`

## 3. Backend — atribuição, login e revalidação

- [x] 3.1 Criar `PUT /api/admin/usuarios/:id/permissoes` (`adminAuth`): valida array, deduplica, rejeita valor fora do catálogo (400) e usuário inexistente (404); em transação calcula o diff, apaga as removidas, insere as novas com `concedido_por = req.usuario.email`; diff vazio não grava nem audita; mensagens de erro genéricas, sem `e.message`
- [x] 3.2 Registrar auditoria por capacidade alterada (`grant_permissao`/`revoke_permissao`, entidade `usuario`, descrição no padrão de `grant_admin`) usando `registrarAuditoria`
- [x] 3.3 `POST /api/login`: incluir `permissoes` dentro do objeto `usuario` da resposta (`[]` se a sincronização de perfil falhar)
- [x] 3.4 Criar `GET /api/permissoes/minhas` (só `requireAuth`): devolve `{ sucesso, is_admin, permissoes }` do usuário do JWT, sem ler identificador de usuário da URL, do corpo ou da query
- [x] 3.5 `node --check backend/server.js` e `node --check backend/middleware/permissoes.js` limpos

## 4. Frontend

- [x] 4.1 Criar `src/constants/permissoes.js` com as 5 capacidades (id, rótulo, descrição curta), com comentário apontando para o catálogo do backend
- [x] 4.2 `src/App.jsx` e `src/services/auth.js`: garantir `permissoes` no estado do usuário (lista vazia quando ausente, inclusive ao restaurar sessão antiga de `@Stitch:user`)
- [x] 4.3 `src/components/admin/AdminUsuarios.jsx`: controle "Permissões" por linha de não administrador, abrindo um diálogo (`role="dialog"`, foco preso, Escape, `useDismissable`/`makeTrapTab`) com `fieldset`/`legend` e um checkbox rotulado por capacidade; botão de salvar só habilita com diferença
- [x] 4.4 Mesmo diálogo, etapa de confirmação nominal listando o que será concedido e revogado; só o botão de confirmar envia a requisição; erro dentro do diálogo com `role="alert"`, sem `alert()`; cancelar não altera nada e o estado anterior continua exibido
- [x] 4.5 Para administradores, a linha mostra "Todas as capacidades (administrador)" sem controle de edição
- [x] 4.6 Mostrar as capacidades atuais de cada usuário na lista (chips ou contagem) sem depender de cor para o significado
- [x] 4.7 `iconeAcao.js`: ícone e cor para `grant_permissao`/`revoke_permissao`, coerentes com `grant_admin`/`revoke_admin` e legíveis nos 5 temas

## 5. Verificação

- [x] 5.1 Confirmar com o Felix qual conta não-admin usar nos testes (Everton, usuário 467, ou outra) e obter autorização para conceder/revogar permissões nela em produção
- [x] 5.2 Com uma instância local (porta 3002) e JWT assinado para a conta de teste: sem permissões, uma rota de cada capacidade responde 403; depois de conceder `comunicados`, `POST /api/comunicados` funciona e `POST /api/plantoes` continua 403; revogar e repetir confirma 403 imediato sem novo login
- [x] 5.3 Confirmar que detentor de `usuarios` recebe 403 em `PUT /api/admin/usuarios/:id/privilegios` e em `PUT /api/admin/usuarios/:id/permissoes`
- [x] 5.4 Confirmar com token de admin que uma rota de cada grupo (comunicados, plantões, usuários, auditoria, TI, processos) segue 200 depois do refactor do `adminAuth`
- [x] 5.5 Confirmar valor inválido (`"root"`) → 400, usuário inexistente → 404, diff vazio → sem novo registro de auditoria, e `GET /api/permissoes/minhas` ignorando um `usuarioId` forjado
- [x] 5.6 Restaurar a conta de teste ao estado original (sem permissões), encerrar a instância de teste, apagar arquivos temporários e conferir `git status` sem sobra
- [x] 5.7 Na tela: abrir o diálogo, marcar e desmarcar, salvar → confirmação nominal → gravar; cancelar; forçar erro de rede e ver o alerta dentro do diálogo; conferir foco, Escape e Tab nos 5 temas

## 6. Impeccable e fechamento

- [x] 6.1 Rodar `/impeccable audit` em `AdminUsuarios.jsx` (acessibilidade, contraste nos 5 temas, alvos de toque de 44px, tipografia); `critique` se a lista/diálogo mudar de forma estrutural; corrigir P0/P1 e registrar nota e achados na change ou no `MEMORIA.md`
- [x] 6.2 `npx vite build` limpo
- [x] 6.3 Registrar em `MEMORIA.md` (relendo o arquivo antes de escrever): decisão do modelo por capacidade, o mapa rota → capacidade, e a observação de que o efeito de UI para não-admins só chega com a `gestao-no-shell`
- [x] 6.4 Rodar `openspec validate --strict` na change antes de `/opsx:archive`
