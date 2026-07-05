## 1. Preparação

- [x] 1.1 Confirmar que a branch de trabalho está limpa e o projeto compila (`npm run build`).

## 2. Refatorar estado e dados no TiSupportModal

- [x] 2.1 Remover o estado `solicitantes` e `solicitanteSelecionado` do componente.
- [x] 2.2 Adicionar estado `tecnicoSelecionado` iniciando como string vazia.
- [x] 2.3 Criar array constante `TECNICOS` com as opções:
  - `{ id: '59570', nome: 'MARCIO EDUARDO FELIX' }`
  - `{ id: '59841', nome: 'Everton dos Santos Vieira' }`

## 3. Atualizar o formulário do modal

- [x] 3.1 Remover o bloco de JSX do campo "Solicitante registrado".
- [x] 3.2 Substituir o campo "Técnico responsável" por um `<select>` ativo com:
  - label `Enviar para`
  - placeholder option `Selecione um técnico` com value vazio
  - options dinâmicas a partir de `TECNICOS`
  - `value={tecnicoSelecionado}`
  - `onChange` atualizando `tecnicoSelecionado`
- [x] 3.3 Remover o `<select disabled>` e o ícone de seta duplicado desnecessário.

## 4. Ajustar envio do formulário

- [x] 4.1 Atualizar `handleSubmit` para obter `tecnico_id` a partir de `TECNICOS` usando `tecnicoSelecionado`.
- [x] 4.2 Manter o envio de `nome_solicitante` derivado de `user` (sem alterar a API).
- [x] 4.3 Adicionar validação explícita: se `tecnicoSelecionado` estiver vazio, não enviar.

## 5. Ajustar estados do botão de submit

- [x] 5.1 Atualizar a condição `disabled` do botão "Abrir Chamado" para:
  - `isLoading === true` ou
  - `mensagem.trim() === ''` ou
  - `tecnicoSelecionado === ''`

## 6. Testes e validação

- [x] 6.1 Executar `npm run build` e garantir que não há erros de compilação.
- [x] 6.2 Verificar visualmente o modal:
  - campo "Enviar para" aparece sem valor selecionado
  - botão fica desabilitado sem técnico
  - seleção de Márcio envia `tecnico_id: '59570'`
  - seleção de Everton envia `tecnico_id: '59841'`
