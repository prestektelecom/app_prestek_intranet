## 1. Diagnostico e verificacao do problema

- [x] 1.1 Abrir um chamado de teste pelo modal de TI e capturar o `ixc_debug.log`
- [x] 1.2 Confirmar que PUT com payload minimo nao persiste `id_tecnico`
- [x] 1.3 Confirmar que PUT com spread completo retorna `type: success` mas NAO persiste `id_tecnico` na OS do workflow
- [x] 1.4 Mapear a diferenca entre su_ticket (id_responsavel_tecnico) e su_oss_chamado (id_tecnico)
- [x] 1.5 Identificar o formulario IXC "Agendar OS" e seu equivalente via API

## 2. Corrigir o fluxo pos-OS (backend/server.js)

- [x] 2.1 Implementar TENTATIVA 1: criar OS manualmente ja agendada com `id_tecnico`
  - endpoint: `POST /webservice/v1/su_oss_chamado` com header `ixcsoft: incluir`
  - body: campos obrigatorios da OS + `id_tecnico`, `status: "AG"`, `data_agenda`, `data_agenda_final`
- [x] 2.2 Implementar TENTATIVA 2 (fallback): quando a manual for bloqueada, buscar OS do workflow, deletar mensagens, deletar OS e recriar manualmente
  - Deletar mensagens via `DELETE /webservice/v1/su_oss_chamado_mensagem/:id`
  - Deletar OS via `DELETE /webservice/v1/su_oss_chamado/:id`
  - Recriar OS manual com `ixcsoft: incluir`
  - Guardar o protocolo da OS deletada para retornar ao frontend
- [x] 2.3 Logar resultado de cada passo separadamente
- [x] 2.4 Garantir que falhas nos passos nao quebrem o retorno do protocolo ao frontend

## 3. Validacao

- [x] 3.1 Testar abertura com EVERTON (59841)
  - Ticket `776701` / OS manual `1816695`
  - `id_tecnico`: 59841, `status`: AG, `data_agenda` preenchida
  - Protocolo retornado: `202606150950`
- [x] 3.2 Testar abertura com MARCIO (59570)
  - Ticket `776702` / OS manual `1816697`
  - `id_tecnico`: 59570, `status`: AG, `data_agenda` preenchida
  - Protocolo retornado: `202606150951`
- [x] 3.3 Verificar no `ixc_debug.log` que o fluxo executou corretamente
  - OS do workflow encontrada e deletada
  - Mensagens deletadas
  - OS manual criada com sucesso
- [x] 3.4 Confirmar no painel IXC Soft
  - Campo `id_tecnico` preenchido no registro da OS
  - Status AG e datas de agendamento preenchidas

## 4. Corrigir contrato vazio na OS manual

- [x] 4.1 Confirmar que `su_oss_chamado` espera `id_contrato_kit` e nao `id_contrato`
- [x] 4.2 Atualizar `buildOSManualPayload` em `backend/server.js` para enviar `id_contrato_kit: ixcIds.id_contrato`
- [x] 4.3 Manter `id_contrato` no `su_ticket` (continua correto)
- [ ] 4.4 Testar abertura de chamado e confirmar que o contrato aparece preenchido no painel IXC

## 5. Conclusao

- [x] 5.1 Fluxo implementado e validado (tecnico + status AG)
- [ ] 5.2 Commitar alteracoes
