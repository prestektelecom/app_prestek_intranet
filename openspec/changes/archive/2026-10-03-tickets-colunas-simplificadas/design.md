## Context

A tabela de "Meus Chamados" em `TicketsList.jsx` usa o componente `ResponsiveTable` com 5 colunas: ID, Protocolo, Assunto/Mensagem, Status e Data.

**Problemas atuais:**
1. **Coluna Protocolo**: aparece como "Aguardando..." na maioria dos registros; ocupa espaço sem agregar valor visual
2. **Preview de mensagem sujo**: o campo `menssagem` contém o texto bruto do template IXC, com delimitadores `========================`, linhas como `Solicitante: NOME` e `DESCREVA A SITUAÇÃO:` antes do conteúdo real
3. **Data sempre vazia**: `data_cadastro` é retornado nulo pelo IXC; o campo correto precisa ser identificado inspecionando a resposta real da API

**Stack atual:**
- Frontend: React + Tailwind, componente `TicketsList.jsx`
- Backend proxy: `server.js` (Express) → IXC `/webservice/v1/su_ticket`
- Tabela responsiva via `ResponsiveTable`

## Goals / Non-Goals

**Goals:**
- Remover coluna Protocolo
- Mostrar data de abertura correta do ticket
- Exibir preview da mensagem limpo (sem ruído de template)
- Reordenar colunas: ID → Assunto → Mensagem limpa → Status → Data
- Manter comportamento responsivo existente (cards em mobile)

**Non-Goals:**
- Paginação ou busca (escopo separado)
- Abrir detalhes do ticket em modal/drawer
- Filtrar por status clicando nos KPIs do hero

## Decisions

### D1 — Parser de mensagem no frontend (não no backend)

**Decisão:** Implementar a função `parseTicketMessage(texto)` diretamente em `TicketsList.jsx` (ou em `src/utils/ticketUtils.js`).

**Alternativas consideradas:**
- No backend (server.js): processaria uma vez para todos, mas acopla lógica de UI ao servidor
- No frontend: sem necessidade de alterar o backend, mais simples de testar e iterar

**Rationale:** A limpeza é puramente apresentacional; o backend deve retornar dados brutos.

### D2 — Algoritmo do parser

O campo `menssagem` segue este padrão geral:

```
Solicitante: NOME\n\n========================\nDESCREVA A SITUAÇÃO:\n[conteúdo real]\n========================
```

Estratégia de extração:
1. Dividir por `========================`
2. Pegar o bloco após o primeiro delimitador
3. Remover linhas que contenham apenas cabeçalhos de seção conhecidos (`DESCREVA A SITUAÇÃO:`, `OBS:`, labels em maiúsculas seguidos de `:`)
4. Trim e retornar as primeiras ~150 chars

Fallback: se o padrão não for encontrado, retornar o texto original truncado.

### D3 — Campo de data

**Decisão:** Adicionar log de inspeção no backend para identificar o nome real do campo de data. Candidatos: `data_abertura`, `dt_cadastro`, `data_cadastro`, `data`.

Após identificação, mapear corretamente no frontend (ou expor via backend se necessário renomear).

**Fallback temporário:** Se nenhum campo de data estiver disponível, extrair do número de protocolo quando no formato `YYYYMMDD...` (ex: `20260717...` → 17/07/2026).

## Risks / Trade-offs

- **Parser frágil**: Templates IXC podem variar por tipo de ticket (CRM, SUPORTE TI, etc.). O parser deve ter fallback gracioso.
  → *Mitigação*: sempre retornar algo (texto truncado) se o padrão não bater
- **Campo de data desconhecido**: pode não existir no retorno atual da API.
  → *Mitigação*: usar fallback do protocolo ou exibir `--` com estilo suave em vez de `--/--/--`
