## Why

A página "Meus Chamados" exibe colunas desnecessárias (Protocolo) e uma prévia de mensagem suja com delimitadores `========================` e metadados do template, dificultando a leitura rápida do status de cada ticket. Além disso, a coluna "Data" sempre exibe `--/--/--` porque o campo `data_cadastro` não é retornado corretamente pelo IXC.

## What Changes

- **Remover** a coluna "Protocolo" da tabela (dado pouco útil para o colaborador na leitura diária)
- **Corrigir** a coluna "Data" investigando e mapeando o campo correto retornado pelo IXC (candidatos: `data_abertura`, `dt_registro`, `data_cadastro`)
- **Limpar** o preview da mensagem: extrair apenas o conteúdo entre delimitadores `========================`, removendo cabeçalhos de template como `DESCREVA A SITUAÇÃO:` e `Solicitante:`
- **Reordenar** colunas para: ID → Assunto → Mensagem resumida → Status → Data
- A "Mensagem" exibirá no máximo 2 linhas do conteúdo real, sem ruído de template

## Capabilities

### New Capabilities
- `ticket-message-parser`: Função utilitária que extrai o conteúdo limpo do corpo de um ticket IXC, removendo cabeçalhos de template, delimitadores e metadados

### Modified Capabilities
- (nenhuma)

## Impact

- **`src/components/TicketsList.jsx`**: ajuste das colunas do `ResponsiveTable`, adição do parser de mensagem, correção do campo de data
- **`backend/server.js`**: possível ajuste no mapeamento do campo de data retornado pelo IXC
- Sem impacto em outras páginas ou componentes
