## Context

O modal de suporte de TI exibe um container com o número do protocolo quando um chamado é aberto com sucesso. Esse container possui um `maxWidth` fixo de `280` pixels. O número do protocolo é gerado pelo IXC Soft e pode ter 20 caracteres ou mais. Como o texto usa a fonte monoespaçada `JetBrains Mono` com `fontSize: 24`, a largura do texto ultrapassa a largura interna do container (240px descontando o padding lateral de 20px de cada lado), fazendo com que o número transborde visualmente a caixa.

## Goals / Non-Goals

**Goals:**
- Garantir que qualquer número de protocolo de até 20 dígitos seja exibido integralmente dentro dos limites do container, sem transbordar horizontalmente.
- Ajustar o design visual de forma que fique responsivo e harmonioso dentro do modal (`maxWidth: 520`).

**Non-Goals:**
- Não serão feitas alterações de lógica de integração com o IXC Soft.
- Não serão alteradas outras telas do modal além da tela de sucesso.

## Decisions

### Ajuste de largura do container e redução da fonte
- **Decisão**: Aumentar o `maxWidth` do container de `280` para `380` e diminuir a fonte do número do protocolo de `24` para `19` (com `wordBreak: 'break-all'` para proteção contra transbordo).
- **Razão**: Um número de protocolo com 20 caracteres em fonte monoespaçada de tamanho 19 ocupa cerca de 228px de largura. Com `maxWidth: 380` e padding total de `40px` (20px em cada lado), o espaço interno disponível é de `340px`, deixando uma margem segura de mais de 100px. A propriedade `wordBreak: 'break-all'` assegura que mesmo que o protocolo tenha mais de 30 caracteres, ele quebrará a linha e permanecerá dentro da caixa em vez de estourar.
- **Alternativas consideradas**:
  - *Usar fonte responsiva com JS (como fitty)*: Adiciona complexidade e dependências externas desnecessárias para um caso tão específico.
  - *Usar overflow com reticências (`text-overflow: ellipsis`)*: Ruim para o usuário, que precisa ver o número do protocolo completo para poder anotá-lo ou referenciá-lo.

## Risks / Trade-offs

- **[Risco]** Diminuição da legibilidade do número do protocolo devido à redução da fonte de 24 para 19.
  - *Mitigação*: A fonte JetBrains Mono é altamente legível mesmo em tamanhos menores, e o tamanho 19 ainda é consideravelmente grande no layout.
