## Why

O modal de abertura de chamado de Suporte de TI exibe o solicitante como texto fixo (o usuário logado). Para suportar cenários onde um colaborador abre um chamado em nome de outro (ex: TI abrindo por um setor), é necessário um campo de seleção de solicitante extensível.

## What Changes

- Adicionar um campo `<select>` de "Solicitante" no `TiSupportModal`, inicialmente com apenas o próprio usuário logado como opção selecionada.
- O nome do solicitante selecionado será incluído na descrição formatada enviada ao IXC Soft.
- A estrutura do select deve ser extensível para, no futuro, popular com uma lista de colaboradores da empresa.

## Capabilities

### New Capabilities
- `ti-modal-solicitante-selector`: Campo de seleção de solicitante no modal de abertura de chamado de TI. Inicialmente popula apenas com o próprio usuário logado; estruturado para receber lista dinâmica de colaboradores.

### Modified Capabilities
<!-- Sem alterações de spec existente -->

## Impact

- `src/components/TiSupportModal.jsx`: Adição do campo select e ajuste no payload enviado à API.
- `backend/server.js` (rota `/api/ixc/su-ticket`): Sem mudanças necessárias — o `nome_solicitante` já é aceito via body.
