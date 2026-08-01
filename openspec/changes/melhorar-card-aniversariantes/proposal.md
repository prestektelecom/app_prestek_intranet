## Why

O card "Aniversariantes" do Dashboard desperdiça dados que já possui e exibe informação que não ajuda ninguém. A segunda linha de cada colaborador renderiza vazia porque o mapa de departamentos nunca resolve; o campo `dias` (quantos dias faltam) já é calculado mas só vira texto útil em 2 dos 8 valores possíveis, deixando o usuário com um "04/08" cru que não responde "falta quanto?"; e a foto do colaborador já vem na API mas é ignorada, criando inconsistência visual com o card irmão "Disponibilidade" que fica colado nele e usa foto real.

O resultado é uma lista de linhas visualmente idênticas, com nomes em CAIXA ALTA que truncam no meio, sem hierarquia entre quem faz aniversário hoje e quem faz daqui a uma semana.

## What Changes

**Frente 1 — Visual (independente do IXC, sem risco):**

- Avatar passa a usar a foto real do colaborador (`foto_perfil`, já retornada por `/api/colaboradores`), com as iniciais atuais como fallback quando não houver foto. Alinha com o card `TeamBento`/Disponibilidade.
- Nomes vindos em CAIXA ALTA do IXC são normalizados para capitalização legível e encurtados para primeiro + último nome, evitando o truncamento atual. Nome completo permanece acessível via `title`.
- O rótulo temporal passa a cobrir todos os casos: "Hoje", "Amanhã" e "em N dias" — aproveitando o `dias` já calculado, hoje subutilizado.
- A segunda linha da row deixa de ser o departamento vazio e passa a exibir a data por extenso (ex.: "seg, 04/08"), eliminando a dependência do IXC para essa informação.
- Hierarquia visual: aniversariantes de hoje/amanhã se destacam do restante da lista. Rows ganham estado de hover.

**Frente 2 — Investigação do `id_departamento` (dados, não bloqueante):**

- Diagnosticar por que `deptoMap` não resolve, usando a rota de debug já existente `/api/debug-funcionario/:id`, que compara o `id_departamento` do funcionário contra as três tabelas candidatas do IXC (`su_ticket_setor`, `departamento`, `empresa_setor`) e contra o fallback por `id_funcao`.
- Corrigir o mapeamento conforme o resultado do diagnóstico, incluindo fallback por `id_funcao` no padrão que o `TeamBento` já usa.
- **Fallback definido:** se nenhuma tabela casar, o departamento simplesmente não é exibido e a row permanece com a data relativa da Frente 1. A Frente 1 não depende deste resultado e não deve ser bloqueada por ele.
- Se resolver, o departamento entra como informação adicional na row — nunca como espaço vazio reservado.

Sem breaking changes.

## Capabilities

### New Capabilities

- `dashboard-aniversariantes`: Comportamento de exibição do card de aniversariantes do Dashboard — origem do avatar e seu fallback, normalização e encurtamento de nomes, rótulo temporal relativo, conteúdo da linha secundária, hierarquia visual entre aniversários iminentes e distantes, e regra de exibição condicional do departamento.

### Modified Capabilities

Nenhuma. Não há spec existente cobrindo o card de aniversariantes.

## Impact

**Código afetado:**

- `src/components/Dashboard.jsx` — componente `AniversariantesCard` (aprox. linhas 876-958) e helpers próximos (`iniciais`, `rotuloData`, `diasAteAniversario`).
- `backend/server.js` — rota `/api/departamentos-empresa` (linha ~395), apenas se o diagnóstico da Frente 2 indicar que a tabela de origem está errada. Rota de debug `/api/debug-funcionario/:id` (linhas 425-488) é usada como ferramenta de diagnóstico.

**Sem alteração:** `/api/colaboradores` já retorna todos os campos necessários (`foto_perfil`, `data_nascimento`, `id_departamento`, `id_funcao`) e já filtra o SVG genérico do IXC. Nenhuma mudança de contrato de API é necessária para a Frente 1.

**Dependências externas:** a Frente 2 exige backend rodando com credenciais IXC válidas para executar o diagnóstico — não é automatizável e depende de execução manual.

**Padrões a preservar:** wrapper `GlowingEffect`, constante `CARD_TITLE`, tokens de tema (`--accent`, `--accent-soft`, `--success-bento`, `--success-soft`, `bg-surface-raised`, `text-faint`, `text-muted`) e `custom-scrollbar`. Consistência visual com o card `TeamBento` adjacente.
