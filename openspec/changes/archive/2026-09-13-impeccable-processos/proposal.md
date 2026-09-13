## Why

A crítica dual-agent isolada e o audit técnico da Fase 12 do programa Impeccable (`programa-impeccable/tasks.md`, seção 12) encontraram 3 problemas P0 e 3 P1 na tela de Processos (`src/components/Processos.jsx`):

- **P0**: `CategoriasAdminModal` — o único diálogo desta tela que grava/exclui dado real na tabela `categorias_processos` — não tem nenhuma semântica de teclado: Escape não fecha, não há trap de Tab (confirmado ao vivo que o Tab escapa para o botão "Novo Processo" atrás do modal).
- **P0**: o CRUD de processos inteiro não persiste nada. `PROCESSOS` (`src/data/processosData.js`) é um array estático permanentemente vazio; não existe rota `/api/processos` no backend; `salvarProcesso` só atualiza estado React local. Criar/editar um processo dá feedback de sucesso completo mas desaparece ao recarregar a página, sem nenhum aviso ao usuário.
- **P0**: `--foreground-faint`/`text-faint` — o token já estabelecido como substituto seguro de `text-muted` em pelo menos 6 fases anteriores deste programa — reprova 4,5:1 de contraste no tema AMOLED especificamente (4,18:1 contra `--surface`, 3,88:1 contra `--surface-raised`), contradizendo uma suposição já registrada em `MEMORIA.md`. Medido ao vivo e recalculado de forma independente.
- **P1**: alvos de toque abaixo de 44px em 3 pontos (chips de filtro de categoria, ícones de editar/excluir do admin de categorias, grade de ícones do `IconePicker`).
- **P1**: nenhuma checagem de permissão em "Novo Processo"/editar linha — ao contrário de "Gerenciar Categorias" (corretamente restrito a `user?.is_admin`).
- **P1**: a categoria padrão de um processo novo (`'atendimento'`, hardcoded) pode ficar órfã, já que categorias são totalmente editáveis/excluíveis pelo admin sem nenhuma proteção contra remover o id usado como padrão.

## What Changes

- **Adiciona** semântica de diálogo completa (`useDismissable`+`trapTab`, mesmo padrão já usado em `ProcessoModal`/`ModalShell.jsx`) ao `CategoriasAdminModal`.
- **Adiciona** um aviso visível e honesto na tela informando que os processos exibidos são dados de demonstração, não persistidos — em vez de fingir que o CRUD é real. A construção de uma persistência de verdade (rota `/api/processos` + tabela no banco) fica registrada em Pendências como decisão de produto/engenharia futura, fora do escopo desta change.
- **Corrige** `--foreground-faint` do bloco AMOLED em `src/index.css` para um valor que passe 4,5:1 contra `--surface` e `--surface-raised`.
- **Corrige** os 3 pontos de alvo de toque abaixo de 44px.
- **Adiciona** a mesma guarda `user?.is_admin` já usada em "Gerenciar Categorias" para "Novo Processo"/editar linha.
- **Corrige** a categoria padrão de um processo novo para ser derivada da lista de categorias carregadas (`categorias[0]?.id`) em vez de um literal fixo, com validação no submit.

## Capabilities

### New Capabilities

- `processos-integridade-acessibilidade`: garante que o diálogo de gerenciamento de categorias tenha semântica completa, que a tela seja honesta sobre a não-persistência atual do CRUD de processos, que a permissão de edição de processo seja consistente com a de categorias, e que a categoria padrão de um processo novo nunca aponte para um id inexistente.

### Modified Capabilities

_(nenhuma — `dark-mode-bento-foundation`/`bento-blue-global-tokens` estão desatualizadas, descrevendo a paleta "Bento Blue" já abandonada; corrigi-las por completo é maior que o escopo desta fase, registrado em Pendências)_

## Impact

- **Arquivos**: `src/components/Processos.jsx`, `src/index.css` (1 variável, bloco AMOLED)
- **Sem impacto** em dado real de categorias existente
- **Fora de escopo** (registrado em Pendências): construir persistência real de processos (rota `/api/processos` + tabela no banco); reescrever `dark-mode-bento-foundation`/`bento-blue-global-tokens` para refletir a paleta laranja atual; nome de processo sem truncamento na tabela desktop (latente); `StatusBadge` com Tailwind cru em vez do sistema de tokens; `window.confirm()` nativo em vez do padrão de diálogo customizado da tela; modo somente-leitura para não-admin
