## Why

Hoje o ID exibido para cada Processo Operacional (`OP-001`, `TI-004`...) é puramente interno — gerado sequencialmente por prefixo de categoria (`proximoIdProcesso()`, `backend/server.js`), sem nenhuma relação com o sistema real de atendimento (IXC). Na prática, ninguém usa esse número pra nada fora do próprio sistema: quando alguém precisa saber "qual assunto do IXC esse processo abre", tem que ir descobrir por fora.

O IXC já tem essa informação estruturada no próprio motor de workflow: cada processo (`wfl_processo`) tem tarefas em sequência (`wfl_tarefa`), a primeira tarefa dispara uma interação (`wfl_interacoes`) que aponta pra uma configuração de abertura de OS (`wfl_parametro_oss`), e essa configuração referencia o `id_assunto` real (`su_oss_assunto`) — o mesmo número que aparece quando alguém abre um chamado desse tipo no IXC (ex.: processo "ALTERAR SENHA WIFI (revisado)" → assunto `1113` "SOLICITAR ALTERAÇÃO DE SENHA WI-FI").

Essa cadeia foi confirmada ao vivo (só leitura) contra o IXC real durante a exploração desta change, usando o mesmo padrão de API já usado no projeto para `su_oss_assunto` (`services/ixc.js`/`ixcListar`) — nunca tinha sido consultada por este projeto antes, mas está acessível.

Trazer esse número pra listagem de Processos Operacionais torna o ID do processo útil de verdade: quem olha a tela já vê o número que vai bater com o que aparece no IXC quando o assunto for aberto.

## What Changes

- Novo campo no formulário de Processo (`ProcessoModal`) para o admin vincular um Processo nosso a um `wfl_processo` ativo do IXC, escolhido por nome (seletor), não por ID cru digitado.
- Nova resolução server-side, admin-only, que navega a cadeia `wfl_tarefa` (primeira tarefa ativa, por `sequencia`) → `wfl_interacoes` (só as que geram OS, `id_wfl_param_os` != 0) → `wfl_parametro_oss` → `id_assunto` → `su_oss_assunto` (nome, só para exibição), e persiste o resultado em `processos` — resolvida uma vez no momento do vínculo (ou de um "atualizar" manual), nunca ao vivo a cada carregamento da tela.
- O badge de ID exibido **somente na listagem** de processos (tabela desktop e cards mobile — mesma lista responsiva) passa a mostrar o número do assunto do IXC quando o processo estiver vinculado, com fallback para o ID interno (`OP-001`/`TI-004`) quando não estiver.
- **Fora de escopo, explicitamente**: os badges de ID dentro dos modais de "Editar/Novo Processo" e de "Consulta (somente leitura)" continuam mostrando sempre o ID interno — não mudam.
- **Fora de escopo**: busca por ID no campo de busca continua batendo só com o ID interno, como hoje; não passa a buscar por número de assunto do IXC.

## Capabilities

### New Capabilities
- `processos-vinculo-ixc-workflow` — vínculo de um Processo nosso a um processo de workflow do IXC, resolução do assunto associado, e exibição desse número na listagem.

### Modified Capabilities
- (nenhuma — a capability `processos-ui-redesign` e `processos-integridade-acessibilidade` não descrevem a origem do valor do ID, só sua apresentação visual/acessibilidade; não precisam de delta)

## Impact

- `backend/migrations/022_*.sql` (nova) — colunas nullable em `processos`: referência ao `wfl_processo` do IXC, `id_assunto` resolvido, nome do assunto (cache de exibição), timestamp da última resolução.
- `backend/services/ixc.js` ou novo módulo — função de resolução da cadeia de workflow.
- `backend/server.js` — endpoint admin-only para listar `wfl_processo` ativos (alimentar o seletor) e endpoint/lógica para resolver e persistir o vínculo; `shapeProcesso()` passa a incluir os novos campos na resposta.
- `src/components/Processos.jsx` — novo campo no `ProcessoModal`; troca da fonte do badge de ID nos dois pontos de listagem (tabela desktop, card mobile); nenhuma mudança nos badges dos modais.
- `/impeccable audit` na tela tocada antes de fechar a change (regra fixa do projeto para mudança de interface).
