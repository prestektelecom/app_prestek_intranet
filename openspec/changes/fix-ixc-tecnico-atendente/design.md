## Context

O fluxo de abertura de chamado de TI via intranet faz:
1. `POST /webservice/v1/su_ticket` → cria o ticket
2. Poll (até 6x, 3s entre tentativas) aguardando a OS vinculada (`su_oss_chamado`) ser criada pelo IXC via workflow
3. `PUT /webservice/v1/su_oss_chamado/:id` → tenta setar `id_tecnico`

O `PUT /su_oss_chamado/:id` aceita a requisição, mas não persiste `id_tecnico` nem `status` — esses campos são controlados pelo workflow do IXC. A OS 1813612 (agendada manualmente no IXC) mostra que o agendamento é feito pela tabela `su_oss_chamado_mensagem` com `id_evento: "5"`, `id_tecnico` e `data_inicio`/`data_final`.

O frontend já está correto: `TiSupportModal.jsx` envia `tecnico_id` dinamicamente; o `select` permite escolher entre MARCIO (59570) e EVERTON (59841).

## Goals / Non-Goals

**Goals:**
- Garantir que `id_tecnico` seja corretamente persistido na OS do IXC ao abrir chamado
- Mapear os campos obrigatórios do PUT da OS com os nomes corretos que o IXC espera
- Loggar de forma clara o resultado do PUT (sucesso ou erro detalhado)
- Manter o campo de técnico editável no frontend (já implementado)

**Non-Goals:**
- Alterar o endpoint `/api/ixc/su-ticket` ou o contrato de resposta
- Modificar o fluxo de criação do ticket em si
- Adicionar novos técnicos além de MARCIO e EVERTON
- Lidar com casos onde o IXC não gera OS (timeout após 18s)

## Decisions

### Decisão 1: Usar `su_oss_chamado_mensagem` com evento 5 (Agendamento)

**Escolhido**: Após a OS ser criada pelo workflow, postar uma mensagem na tabela `su_oss_chamado_mensagem` com `id_evento: "5"` (Agendamento), `id_tecnico` e datas de agendamento. Esse é o caminho que a OS 1813612 (exemplo real agendado no IXC) utilizou.

**Alternativas consideradas**:
- **PUT direto na OS**: Atualiza campos livres (ex: `mensagem_resposta`), mas `id_tecnico` e `status` são controlados pelo workflow e não são persistidos.
- **PUT com bypass de workflow (`id_wfl_tarefa: ''`)**: Também não persistiu `id_tecnico`/`status` nos testes.
- **Eventos 8 (Assumir) e 16 (Reagendamento)**: Postaram mensagem com sucesso, mas não alteraram o estado da OS.
- **Endpoint específico de agendamento**: `su_oss_chamado_agendar` não existe no webservice disponível.

**Payload da mensagem de agendamento**:
```
id_chamado:        osIdFinal
status:            "AG"
id_evento:         "5"
mensagem:          "Agendado automaticamente via Intranet"
id_tecnico:        tecnico_id
data_inicio:       data_agenda
data_final:        data_agenda_final
id_equipe:         "0"
finaliza_processo: "N"
```

### Decisão 2: Manter o poll de OS e só atualizar após encontrá-la

**Escolhido**: O poll atual já aguarda a OS ser criada pelo workflow do IXC antes de tentar o PUT. Esse comportamento deve ser mantido — só ajustar o payload do PUT.

**Rationale**: O IXC cria a OS assincronamente via workflow (pode levar alguns segundos). Tentar setar o técnico antes da OS existir falharia.

## Risks / Trade-offs

- **[Risco] IXC muda os campos obrigatórios** → O PUT pode voltar a falhar. Mitigation: logar o response completo do PUT para diagnóstico rápido.
- **[Risco] Timeout do poll (>18s)** → OS não é encontrada, técnico não é setado. Mitigation: já existe; o chamado é criado mas sem técnico. Fora do escopo desta correção.
- **[Trade-off] Mapeamento manual** → Se o IXC mudar nomes de campos, o mapeamento pode quebrar. Compensado pela clareza e controle explícito sobre o que está sendo enviado.

## Migration Plan

1. Ajustar o bloco `PUT /su_oss_chamado` no `backend/server.js` (~linha 1893)
2. Testar com um chamado real e verificar o log `ixc_debug.log`
3. Confirmar no IXC Soft que o técnico aparece vinculado ao chamado
