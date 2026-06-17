## Context

O componente `TiSupportModal.jsx` é acionado pelo botão "Suporte TI" no Dashboard. Hoje ele renderiza dois campos `<select>`:

1. **Solicitante registrado** — sempre contém apenas o usuário logado; é uma informação redundante no formulário.
2. **Técnico responsável** — sempre fixo em "MARCIO EDUARDO FELIX" e desabilitado (`disabled`).

A proposta é consolidar essa experiência em um único campo ativo e obrigatório: **Enviar para**, onde o usuário escolhe para qual técnico o chamado será direcionado.

## Goals / Non-Goals

**Goals:**
- Remover o campo "Solicitante registrado" da UI do modal.
- Transformar o campo de técnico em um `<select>` ativo, obrigatório e sem valor padrão pré-selecionado.
- Adicionar Everton dos Santos Vieira (`59841`) como segunda opção de técnico.
- Garantir que o `tecnico_id` correto seja enviado ao backend conforme a escolha do usuário.
- Manter o envio de `nome_solicitante` derivado do usuário logado, sem exibi-lo no formulário.
- Desabilitar o botão "Abrir Chamado" enquanto o técnico não for selecionado ou a descrição estiver vazia.

**Non-Goals:**
- Alterar o endpoint `/api/ixc/su-ticket` ou o contrato de resposta.
- Adicionar busca dinâmica de técnicos via API (a lista continua hardcoded no frontend).
- Modificar o visual geral do modal além do campo de seleção.

## Decisions

1. **Lista de técnicos hardcoded no componente**
   - *Rationale*: são apenas dois técnicos fixos e não há endpoint de listagem. Manter no estado local evita complexidade desnecessária.
   - *Alternativa considerada*: buscar técnicos do backend. Rejeitada por estar fora do escopo e não haver endpoint disponível.

2. **Estado inicial vazio para o técnico**
   - *Rationale*: força o usuário a conscientemente escolher o destinatário, evitando envios acidentais.

3. **Remoção do campo de solicitante da UI, mantendo o envio na API**
   - *Rationale*: o solicitante é sempre o usuário logado; exibi-lo não agrega escolha. Continuar enviando `nome_solicitante` preserva o contrato com o backend.

4. **Reutilização do design system Bento existente**
   - *Rationale*: manter consistência visual com os selects já utilizados no modal.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Usuário confundir "Enviar para" com outra ação | Label claro e placeholder "Selecione um técnico". |
| Envio sem técnico selecionado | Botão desabilitado até seleção válida; validação no `handleSubmit`. |
| Manutenção da lista hardcoded | Documentar no spec que a lista é estática; considerar endpoint futuramente. |

## Open Questions

- Nenhuma. Decisões validadas com o solicitante durante a fase de explore.
