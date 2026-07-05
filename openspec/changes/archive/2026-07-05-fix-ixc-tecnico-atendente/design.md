## Context

O fluxo de abertura de chamado de TI via intranet faz:
1. `POST /webservice/v1/su_ticket` -> cria o ticket (com `id_responsavel_tecnico`)
2. O workflow do IXC cria a OS vinculada (`su_oss_chamado`) automaticamente
3. A OS nasce com `id_tecnico = 0` - o workflow **nao herda** `id_responsavel_tecnico` do ticket
4. A intranet precisa garantir que a OS saia agendada com o tecnico correto

O frontend ja esta correto: `TiSupportModal.jsx` envia `tecnico_id` dinamicamente; o `select` permite escolher entre MARCIO (59570) e EVERTON (59841). Os IDs sao fixos - nao ha busca dinamica na tabela `funcionarios`.

## Goals / Non-Goals

**Goals:**
- Garantir que `id_tecnico` seja corretamente persistido no **registro** da OS (campo direto)
- Garantir que a OS seja criada **agendada** (`status = "AG"` + datas de agendamento)
- Data de agendamento = hora atual (automatico, sem input do usuario)
- Logar claramente o resultado de cada passo

**Non-Goals:**
- Alterar o endpoint `/api/ixc/su-ticket` ou o contrato de resposta
- Busca dinamica de tecnicos na tabela `funcionarios`
- Adicionar novos tecnicos alem de MARCIO e EVERTON
- Lidar com casos onde o IXC nao gera OS (timeout apos 18s)

## Decisions

### Decisao 1: Substituir a OS do workflow por uma OS manual agendada

**Escolhido**: Como o workflow do IXC sempre cria a OS primeiro (bloqueando a criacao manual) e a API nao permite alterar `id_tecnico`/`status` de uma OS criada por workflow, o backend executa os seguintes passos:

1. Cria o `su_ticket` normalmente.
2. Tenta criar a `su_oss_chamado` manualmente ja agendada.
3. Se bloqueada, busca a OS gerada pelo workflow.
4. Deleta as mensagens vinculadas a essa OS.
5. Deleta a OS do workflow.
6. Cria uma nova OS manual agendada com o tecnico correto.
7. Armazena o protocolo da OS deletada e o retorna ao frontend.

**Payload da OS manual:**
```json
{
  "id_cliente": "681",
  "id_login": "1",
  "id_contrato_kit": "18426",
  "id_filial": "1",
  "id_assunto": "1154",
  "id_ticket": "<ticketId>",
  "id_ticket_setor": "16",
  "setor": "54",
  "id_cidade": "1721",
  "id_tecnico": "<tecnico_id>",
  "prioridade": "N",
  "origem_endereco": "CC",
  "endereco": "AL Penedo 57200-000 SENHOR DO BONFIM - RODOVIA MARIO FREIRE LEAHY, 1650",
  "numero": "1650",
  "bairro": "SENHOR DO BONFIM",
  "cidade": "1721",
  "cep": "57200-000",
  "latitude": "-10.277295",
  "longitude": "-36.5581617",
  "status": "AG",
  "data_agenda": "<hora atual>",
  "data_agenda_final": "<hoje 23:59:59>",
  "mensagem": "<mensagemFormatada>"
}
```

### Decisao 2: Data de agendamento = hora atual (automatico)

`data_agenda` = timestamp atual (minuto zerado); `data_agenda_final` = hoje as 23:59:59. Sem input do usuario.

### Decisao 3: Manter o protocolo da OS deletada

A OS manual nao gera protocolo automaticamente. Para nao quebrar a experiencia do usuario, o backend guarda o protocolo da OS do workflow antes de deleta-la e o retorna na resposta.

## Risks / Trade-offs

- **[Risco] OS manual nao tem protocolo proprio**: O protocolo retornado e o da OS deletada. A OS final nao tera protocolo no IXC.
- **[Risco] Origem da OS fica "M" (manual)**: Em vez de "P" (processo/workflow), o que pode afetar filtros/relatorios.
- **[Risco] Ticket fica sem OS se a delecao funcionar mas a criacao manual falhar**: O backend loga o erro, mas o ticket pode ficar inconsistente.
- **[Risco] Workflow pode ter criado outros registros alem da OS**: No cenario atual, a OS e deletada antes que o workflow avance muito, mas isso depende de timing.

## Migration Plan

1. Substituir o bloco pos-OS no `backend/server.js` pelo fluxo de OS manual + delecao do workflow
2. Testar com EVERTON e MARCIO
3. Verificar no IXC Soft se a OS final esta agendada com o tecnico correto
4. Commitar as alteracoes

## Results / Test Notes

Testes realizados em 2026-06-29:

| Ticket | OS Workflow | OS Manual | Tecnico | Status | data_agenda | Protocolo retornado |
|--------|-------------|-----------|---------|--------|-------------|---------------------|
| 776701 | 1816694 (deletada) | 1816695 | EVERTON (59841) | AG | 2026-06-29 16:42:00 | 202606150950 |
| 776702 | 1816696 (deletada) | 1816697 | MARCIO (59570) | AG | 2026-06-29 16:43:00 | 202606150951 |

**Conclusao:**
- O fluxo funciona para ambos os tecnicos.
- A OS final e criada manualmente com `id_tecnico` correto, `status = "AG"` e datas de agendamento.
- O protocolo da OS deletada e retornado ao frontend.
- A solucao e operacional, mas depende de deletar a OS do workflow rapidamente antes que ela avance no processo.
