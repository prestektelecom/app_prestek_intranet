## 1. Diagnóstico e verificação do problema

- [x] 1.1 Abrir um chamado de teste pelo modal de TI e capturar o `ixc_debug.log` gerado no backend
- [x] 1.2 Confirmar no log que o PUT da OS não persiste `id_tecnico` nem `status`
- [x] 1.3 Verificar no `os-data.json` e na OS 1813612 (agendada manualmente) qual o evento/mensagem usado pelo IXC

## 2. Corrigir o agendamento da OS (backend/server.js)

- [x] 2.1 Localizar o bloco após a criação da OS na rota `POST /api/ixc/su-ticket`
- [x] 2.2 Substituir o `PUT /su_oss_chamado/:id` por `POST /su_oss_chamado_mensagem` com evento 5 (Agendamento):
  - `id_chamado` ← `osIdFinal`
  - `status` ← `"AG"`
  - `id_evento` ← `"5"`
  - `mensagem` ← `"Agendado automaticamente via Intranet"`
  - `id_tecnico` ← `tecnico_id`
  - `data_inicio` ← `data_agenda`
  - `data_final` ← `data_agenda_final`
  - `id_equipe` ← `"0"`
  - `finaliza_processo` ← `"N"`
- [x] 2.3 Melhorar o log do resultado: registrar payload e response completo (sucesso ou erro detalhado)

## 3. Validação

- [ ] 3.1 Garantir que o usuário/token da API do IXC tenha permissão para agendar OS via webservice
- [ ] 3.2 Reiniciar o backend e abrir um chamado de teste selecionando EVERTON como atendente
- [ ] 3.3 Verificar no `ixc_debug.log` que o POST da mensagem retornou sucesso (sem `type: "error"`)
- [ ] 3.4 Confirmar no painel do IXC Soft que o chamado está vinculado ao técnico correto
- [ ] 3.5 Repetir o teste selecionando MARCIO para garantir que ambos os técnicos funcionam
