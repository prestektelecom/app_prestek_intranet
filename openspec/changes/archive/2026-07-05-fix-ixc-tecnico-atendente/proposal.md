## Why

Ao abrir um chamado de TI pelo modal da intranet, o técnico/atendente selecionado pelo usuário **não está sendo salvo no IXC Soft**. O chamado é criado com sucesso, mas o campo `id_tecnico` na OS gerada permanece como `0` (sem técnico). Isso impede que o chamado seja corretamente roteado para o atendente escolhido.

## What Changes

- O backend (`/api/ixc/su-ticket`) tentava atualizar o técnico fazendo um `PUT /su_oss_chamado/:id` com o spread completo do registro da OS. Esse PUT falha silenciosamente no IXC com erro `"Preencha Filial | Preencha Assunto | Preencha Setor | Preencha Prioridade | Preencha Origem do endereço"` — os campos de listagem do IXC têm nomes diferentes dos campos de escrita (ex: `setor` vs `id_ticket_setor`).
- O frontend já envia corretamente `tecnico_id` no payload, e o modal já permite selecionar entre MARCIO e EVERTON. O problema é exclusivamente no backend.
- A correção irá substituir a estratégia de PUT completo na OS por uma abordagem que mapeia corretamente os campos obrigatórios exigidos pelo IXC, garantindo que `id_tecnico` seja persistido.

## Capabilities

### New Capabilities
- `ixc-os-tecnico-update`: Atualização confiável do técnico atendente na OS do IXC após criação do ticket — com mapeamento correto dos campos obrigatórios do PUT e log detalhado do resultado.

### Modified Capabilities
- `ti-modal-solicitante-selector`: O comportamento do campo de técnico responsável muda — deixa de ser fixo (`disabled`) para ser editável, permitindo selecionar entre os técnicos disponíveis (MARCIO ou EVERTON). O requisito da spec anterior precisa ser atualizado.

## Impact

- **Backend**: `backend/server.js` — rota `POST /api/ixc/su-ticket` (bloco do PUT na OS, linhas ~1882–1924)
- **API IXC**: endpoint `PUT /webservice/v1/su_oss_chamado/:id` — requer payload com campos corretos
- **Frontend**: `src/components/TiSupportModal.jsx` — o campo de técnico já é funcional e dinâmico; nenhuma mudança necessária na UI além de garantir que o técnico selecionado seja corretamente refletido no backend
- **Sem mudanças em banco de dados local**
