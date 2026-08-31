## Why

Em "Processos Operacionais", o carregamento das categorias falha silenciosamente: a API `/api/categorias-processos` responde 500 (a migração `019_categorias_processos.sql` que cria a tabela `categorias_processos` não foi aplicada no banco em uso) e o front-end, que não trata esse erro, acaba setando o corpo de erro da resposta como se fosse a lista de categorias. O resultado visível para o usuário: nenhuma categoria aparece nos filtros/select, e ao clicar em "Novo Processo" a tela inteira quebra (fica preta), porque `categorias.map()` é chamado sobre um valor que não é array.

## What Changes

- Aplicar a migração `019_categorias_processos.sql` no banco usado pelo backend, para que a tabela `categorias_processos` exista e esteja populada.
- Corrigir o `fetch` de categorias em `Processos.jsx` para verificar `res.ok`/formato da resposta antes de atualizar o estado, evitando que um payload de erro (`{erro: "..."}`) seja tratado como lista de categorias.
- Garantir que uma falha ao carregar categorias não derrube a página: a UI deve degradar (lista de categorias vazia + aviso), em vez de lançar uma exceção não tratada que quebra `Processos` e `ProcessoModal`.

## Capabilities

### New Capabilities
- `processos-categorias-carregamento`: comportamento de carregamento resiliente das categorias de processos (sucesso e falha da API) na página Processos Operacionais.

### Modified Capabilities
(nenhuma — não há spec existente cobrindo o carregamento de dados de categorias; `processos-ui-redesign` cobre apenas estilo visual e não é afetado por esta correção)

## Impact

- **Banco de dados**: execução da migração `backend/migrations/019_categorias_processos.sql` (cria tabela `categorias_processos`, insere 7 categorias padrão).
- **Backend**: nenhuma mudança de código — `GET/POST/PUT/DELETE /api/categorias-processos` (`backend/server.js`) já está correto; o problema é a tabela ausente.
- **Frontend**: `src/components/Processos.jsx` — `useEffect` de carregamento de categorias (~linha 670) e o `<select>` de categoria dentro de `ProcessoModal` (~linha 337), além dos pills de filtro que também iteram `categorias`.
