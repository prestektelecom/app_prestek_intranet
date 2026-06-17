## Why

O modal de Suporte de TI atual exibe dois campos de seleção ("Solicitante registrado" e "Técnico responsável"), mas o solicitante é sempre o usuário logado e o técnico era fixo em uma única opção. Isso polui visualmente o formulário sem agregar escolha real. Simplificando para um único campo "Enviar para", tornamos o fluxo mais direto, reduzimos erros de envio para a pessoa errada e preparamos a base para múltiplos técnicos.

## What Changes

- Remove o campo `<select>` de **Solicitante registrado** do modal de Suporte de TI.
- Substitui o campo fixo de **Técnico responsável** por um campo obrigatório **Enviar para**, iniciando em branco.
- Adiciona **Everton dos Santos Vieira** (`59841`) como segunda opção de técnico, além de **Márcio Eduardo Felix** (`59570`).
- O botão **Abrir Chamado** permanece desabilitado até que o usuário selecione um técnico e preencha a descrição.
- O nome do solicitante continua sendo enviado para a API a partir do usuário logado (`user`), sem exibição no formulário.
- Atualiza a capability `ti-modal-solicitante-selector` para refletir o novo comportamento.

## Capabilities

### New Capabilities
- Nenhuma (modificação de capability existente).

### Modified Capabilities
- `ti-modal-solicitante-selector`: remover o requisito de exibição do campo de solicitante; transformar o campo de técnico responsável em um select obrigatório com múltiplas opções e sem valor padrão pré-selecionado.

## Impact

- `src/components/TiSupportModal.jsx`: remoção de estado e UI do solicitante, ajuste do select de técnico, validação do formulário.
- `openspec/specs/ti-modal-solicitante-selector/spec.md`: atualização dos requisitos e cenários.
- API `/api/ixc/su-ticket`: continua recebendo `nome_solicitante` e `tecnico_id`, mas o `tecnico_id` agora é dinâmico.
