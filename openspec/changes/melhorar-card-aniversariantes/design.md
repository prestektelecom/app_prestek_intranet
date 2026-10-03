## Context

Ver `proposal.md` — Why para a motivação.

Estado atual relevante ao desenho:

- `AniversariantesCard` vive em `src/components/Dashboard.jsx` (aprox. linhas 876-958), ao lado de `TeamBento` (linhas 960-1037). Os dois cards ficam adjacentes no grid do Dashboard e hoje divergem visualmente sem motivo.
- `Dashboard.jsx` já importa `resolveAvatarUrl` e `AVATAR_PNGS` de `src/utils/avatarPngs` (linha 6). Nenhum import novo é necessário para a foto.
- `/api/colaboradores` já entrega `foto_perfil`, `data_nascimento`, `id_departamento` e `id_funcao` no mesmo payload, e já neutraliza o SVG genérico do IXC no backend (`server.js:1034`). O card não precisa de nova chamada nem de mudança de contrato.
- O componente já calcula `dias` via `diasAteAniversario` e ordena a lista por proximidade. O dado necessário para o rótulo relativo está presente e apenas subutilizado por `rotuloData`.
- A resolução de departamento é um problema aberto e conhecido: existe uma rota de debug temporária (`server.js:425-488`) escrita justamente para descobrir contra qual das três tabelas do IXC o `id_departamento` casa. Nenhuma conclusão foi registrada no repositório.

Restrição de execução: o diagnóstico do departamento exige backend rodando com credenciais IXC válidas. Não é automatizável dentro da implementação.

## Goals / Non-Goals

**Goals:**

- Entregar a melhoria visual completa sem depender do resultado do diagnóstico de departamento.
- Convergir a apresentação de pessoas entre `AniversariantesCard` e `TeamBento`, reduzindo divergência gratuita entre cards vizinhos.
- Deixar o diagnóstico de departamento com resultado registrado no repositório, para que a próxima pessoa não reabra a mesma investigação.

**Non-Goals:**

- Reescrever `TeamBento` ou unificar os dois cards em um componente compartilhado. A convergência aqui é de aparência e de helpers, não de estrutura.
- Alterar a janela de 7 dias, a ordenação, ou a origem dos dados de aniversário.
- Alterar o layout do grid do Dashboard ou o wrapper `GlowingEffect`.
- Corrigir a resolução de departamento em outros pontos do sistema além do card de aniversariantes.

## Decisions

### 1. Duas frentes desacopladas, com a visual entregue primeiro

A Frente 1 (visual) e a Frente 2 (dados) são implementadas e validadas de forma independente. A Frente 1 não referencia departamento em lugar nenhum; a Frente 2 apenas adiciona uma informação opcional a uma linha que já está completa sem ela.

*Por quê:* a Frente 2 depende de um sistema externo cujo comportamento é desconhecido e que pode simplesmente não ter o dado. Acoplar as duas faria uma melhoria certa e barata ficar refém de uma investigação incerta.

*Alternativa considerada:* resolver o departamento primeiro e desenhar a linha em torno dele. Rejeitada — se o diagnóstico terminar sem resposta, a melhoria visual não sai, e o card continua com a linha vazia de hoje.

### 2. Linha secundária passa a ser a data por extenso, não o departamento

O slot da segunda linha muda de dono: passa a ser ocupado por informação derivada de dados que o componente já possui e que nunca falham (`data_nascimento`, já usado no cálculo de `dias`).

*Por quê:* a causa raiz da linha vazia não é o CSS, é ter atribuído um slot fixo a um dado que pode não existir. Trocar o ocupante por um dado sempre disponível resolve a categoria inteira do problema, não a instância.

*Alternativa considerada:* manter o departamento como dono do slot e apenas ocultar o elemento quando vazio. Rejeitada — mantém a linha inconsistente entre colaboradores (alguns com duas linhas, outros com uma) e desperdiça um slot que tem uso melhor.

### 3. Fallback do avatar são as iniciais, não o `AVATAR_PNGS`

`TeamBento` cai para `AVATAR_PNGS[id % n]` quando não há foto. O card de aniversariantes manterá as iniciais atuais como fallback.

*Por quê:* iniciais carregam sinal de identidade real; um avatar ilustrativo sorteado por módulo de id não carrega nenhum, e ainda induz o usuário a achar que aquela é a foto da pessoa. O card de aniversariantes lista poucas pessoas por vez, então a densidade de fallbacks é visível.

*Trade-off aceito:* a convergência com `TeamBento` fica parcial — foto real igual, fallback diferente. Considerado preferível a propagar um padrão fraco por consistência.

*Alternativa considerada:* usar `AVATAR_PNGS` para consistência total com o card vizinho. Rejeitada pelo motivo acima.

### 4. Encurtamento de nome usa primeira e última palavra significativa

Partículas de ligação (`da`, `de`, `do`, `das`, `dos`, `e`) são ignoradas ao escolher o sobrenome, para que "VITOR SANTOS DA SILVA" produza "Vitor Silva" e não "Vitor Da". O helper `iniciais` existente (`Dashboard.jsx:870-874`) tem a mesma fraqueza e deve passar a compartilhar a mesma lógica de tokenização.

*Por quê:* sem esse tratamento o encurtamento produz resultados visivelmente errados em nomes brasileiros, que são o caso dominante aqui.

*Alternativa considerada:* truncar com reticências mantendo o nome completo. Rejeitada — é exatamente o comportamento atual que motivou a mudança.

### 5. Diagnóstico de departamento é tarefa manual com resultado registrado

O diagnóstico usa a rota de debug já existente, e sua conclusão é escrita de volta no repositório antes de qualquer alteração de código de mapeamento.

*Por quê:* a rota de debug foi criada, usada e abandonada sem registro. Repetir o ciclo sem gravar a conclusão significa que a terceira pessoa a olhar isso vai reabrir a mesma investigação.

*Consequência:* se o diagnóstico revelar que nenhuma tabela casa, isso também é um resultado válido e registrável, e a Frente 2 encerra sem mudança de código.

### 6. Destaque de aniversários iminentes reutiliza tokens existentes

A hierarquia visual usa os tokens de tema já presentes no card (`--success-soft`, `--success-bento` para o caso "Hoje"; `bg-surface-raised` e `text-faint` para o caso padrão), sem introduzir cores novas.

*Por quê:* o projeto tem histórico de mudanças de tema (dark mode, bento tokens) registradas em specs. Cor hardcoded aqui viraria dívida na próxima passada de tema.

## Risks / Trade-offs

**Foto do IXC pode vir em formato inesperado ou quebrada** → `resolveAvatarUrl` já normaliza o valor e o backend já filtra o SVG genérico; além disso o `onError` do elemento de imagem deve degradar para as iniciais em vez de deixar imagem quebrada, mantendo a altura da linha (coberto por cenário na spec).

**Encurtamento de nome pode gerar ambiguidade entre homônimos** → o nome completo permanece acessível via atributo de título, e o avatar com foto real reduz a chance de confusão. Aceito: a lista mostra no máximo os aniversariantes de 7 dias, então a colisão é rara.

**Convergência parcial com `TeamBento` pode ser lida como inconsistência** → decisão deliberada e documentada em Decisions #3. Se no futuro o `TeamBento` migrar para fallback de iniciais, os dois cards convergem sem retrabalho aqui.

**Diagnóstico do departamento pode não ser executado e a Frente 2 ficar pendente indefinidamente** → por desenho, isso não bloqueia nada: a Frente 1 entrega valor completo sozinha e a spec já define o comportamento de omissão quando o departamento não resolve.

**Carregar fotos adiciona requisições de imagem ao Dashboard** → volume baixo (aniversariantes de 7 dias, tipicamente poucos registros) e as mesmas imagens já são carregadas pelo card vizinho e pelo Directory, aproveitando cache do navegador.

## Migration Plan

Mudança puramente aditiva de apresentação, sem alteração de contrato de API, de dados persistidos ou de rotas. Não há migração de dados.

Rollback: reverter as alterações em `src/components/Dashboard.jsx`. Se a Frente 2 tiver alterado `/api/departamentos-empresa`, reverter também `backend/server.js`; como o card omite o departamento quando não resolve, o reverso da Frente 2 sozinho não quebra a Frente 1.

## Open Questions

- Após o diagnóstico, se o departamento resolver, onde ele entra na linha: concatenado à data secundária, ou como terceira informação. Pode ser decidido no momento da Frente 2 — não afeta as specs da Frente 1 nem o desenho acima, já que a spec trata o departamento como informação complementar condicional.

## Conclusão do diagnóstico de departamento (2026-10-03)

Resolvido por evidência de código e de produção, sem rodar a rota de debug: o `id_departamento` do funcionário casa com a tabela `empresa_setor` (`/api/cargos`). `/api/setores` agrupa as equipes comparando `id_departamento` com o `id` da `empresa_setor` (`server.js`, bloco "Agrupa funcionários ativos por setor"), e em 2026-10-01 27 de 27 setores bateram com o filtro de Colaboradores. A rota `/api/departamentos-empresa` consulta a tabela `departamento`, que não é a do vínculo; os cards liam só ela. Correção: `useDeptoMap` consulta as duas e a `empresa_setor` vence. As tarefas 6.1–6.4 ficam sem execução ao vivo por decisão de usar esta evidência.
