# ixc-os-tecnico-update Specification

## Purpose
Define o comportamento de atualização do técnico atendente na OS vinculada a um ticket de suporte de TI criado pela intranet, garantindo que o `id_tecnico` correto seja persistido no IXC Soft após a criação do chamado.

## Requirements

### Requirement: Atualização do técnico atendente na OS do IXC
Após a criação do ticket de suporte de TI, o backend SHALL atualizar o campo `id_tecnico` da OS vinculada no IXC usando um payload com os campos obrigatórios corretamente mapeados. O PUT SHALL incluir no mínimo: `id_filial`, `id_assunto`, `id_ticket_setor` (mapeado de `osRecord.setor`), `prioridade`, `origem_endereco` e `id_tecnico`. O resultado SHALL ser logado em `ixc_debug.log`.

#### Scenario: Técnico salvo com sucesso na OS
- **WHEN** o ticket é criado e a OS vinculada é encontrada no poll
- **THEN** o sistema SHALL fazer PUT em `/su_oss_chamado/:id` com o payload mapeado incluindo `id_tecnico: tecnico_id`
- **THEN** o log SHALL registrar confirmação de sucesso com o ID da OS e o técnico atribuído

#### Scenario: Falha no PUT é registrada com detalhe
- **WHEN** o PUT na OS retorna `type: "error"` ou status HTTP não-OK
- **THEN** o sistema SHALL logar o response completo do erro em `ixc_debug.log`
- **THEN** o chamado SHALL ainda retornar `sucesso: true` ao frontend com o protocolo gerado (a falha no técnico não bloqueia o protocolo)

#### Scenario: OS não encontrada no poll não bloqueia o retorno
- **WHEN** nenhuma OS é encontrada após as 6 tentativas de poll
- **THEN** o sistema SHALL logar o evento e retornar o protocolo normalmente ao frontend, sem tentar o PUT
