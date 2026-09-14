## Why

A crítica dual-agent isolada e o audit técnico da Fase 13 do programa Impeccable (`programa-impeccable/tasks.md`, seção 13) encontraram 2 problemas P0 e 5 P1 na tela de Configurações (`src/components/Configuracoes.jsx`, "Minha Conta"):

- **P0**: o popover de troca de avatar não tem nenhuma semântica de diálogo — sem `role`, sem `aria-expanded`/`aria-haspopup` no gatilho, sem Escape para fechar. Confirmado ao vivo, de forma independente pelas duas avaliações: o Tab alcança o painel mas escapa dele (para o campo "Nome" da página) sem fechá-lo, deixando-o aberto e órfão flutuando na tela.
- **P0**: `C.muted`/`C.accent` usados como texto real reprovam contraste no tema CLARO especificamente (o inverso do padrão usual já visto neste programa) em praticamente todo rótulo da tela — rótulos de campo (3,01:1), valores de campos somente-leitura (2,72:1) e o texto do cargo abaixo do nome (2,79:1). É a extensão mais ampla já vista deste antipadrão no programa.
- **P1**: alvos de toque abaixo de 44px — botão da câmera do avatar (28×28px, única porta de entrada do card) e trilho do toggle de notificação (20px de altura, que também reprova contraste não-textual, 1,19-1,21:1).
- **P1**: `filialName` cai no literal fabricado `'Sede Principal'` quando não há dado de filial, enquanto `deptoName`, no mesmo card, cai honestamente em `'N/D'` para o mesmo tipo de ausência — mesmo antipadrão já catalogado no `OverrideModal.jsx` (Fase 9).
- **P1**: o botão "Salvar Alterações" não trava durante o carregamento inicial (`isLoading`); como `avatarUrl` só semeia da foto do IXC (não do avatar customizado, que só chega depois via `/api/configuracoes/:id`), um Salvar prematuro pode apagar silenciosamente um avatar customizado já salvo — risco confirmado lendo o código real do backend, não suposto.
- **P1**: o toast de erro de salvamento não tem `role="alert"`/`aria-live` — leitor de tela nunca fica sabendo que o salvamento falhou.
- **P1**: `handleFileUpload` usa `alert()` nativo bloqueante para validar o tamanho do upload, a poucas linhas de um toast já pronto no mesmo arquivo.

## What Changes

- **Adiciona** semântica de menu/diálogo ao popover de troca de avatar: `role="menu"`, `aria-expanded`/`aria-haspopup` no gatilho, handler de Escape que fecha e devolve o foco ao gatilho, foco inicial em "Fazer Upload" ao abrir.
- **Corrige** `C.muted`→`C.ink2` no texto real (rótulos de campo, valores somente-leitura, subtexto do toast) e `C.accent`→`C.accentDeep`/`C.accentDark` (conforme tema) no texto do cargo.
- **Corrige** os alvos de toque do botão da câmera e do trilho do toggle de notificação (incluindo o contraste não-textual do trilho).
- **Corrige** o fallback de `filialName` para `'N/D'` em vez de `'Sede Principal'` fabricado.
- **Trava** o botão Salvar durante `isLoading`, evitando o risco de apagar um avatar customizado salvo.
- **Adiciona** `role="alert"` ao toast de erro e substitui o `alert()` de validação de upload pelo mesmo padrão de toast.

## Capabilities

### Modified Capabilities

- `settings-account-integrity`: ganha requisitos novos cobrindo a semântica do popover de avatar, o contraste do texto real da tela, os alvos de toque, o fallback honesto de "sem dado", a proteção do botão Salvar durante o carregamento, e a acessibilidade do toast de erro.

## Impact

- **Arquivo**: `src/components/Configuracoes.jsx` (único arquivo da tela)
- **Sem impacto** em dado real de perfil/preferências existente
- **Fora de escopo** (registrado em Pendências): flash do ID cru "54" sob o nome antes do cargo resolver (autocura em <1s); preferências pessoais salvas localmente podendo ficar obsoletas se o IXC mudar por fora (decisão de arquitetura de dado maior); `CAMPOS_READONLY` como no-op; grade de 48 avatares sem estado "selecionado" visível; timeout/retry nos fetches de perfil (latência observada de 8-14s, provável IXC real, não bug de frontend)
