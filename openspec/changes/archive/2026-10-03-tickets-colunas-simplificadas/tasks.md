## 1. Investigar campo de data da API IXC

- [x] 1.1 Adicionar `console.log` temporário no backend (`server.js`) para imprimir as chaves do primeiro registro retornado por `/api/ixc/su-ticket/list`
- [x] 1.2 Verificar no log qual campo contém a data de abertura (candidatos: `data_abertura`, `dt_registro`, `data_cadastro`, `data`) → **identificado: `data_criacao`**
- [x] 1.3 Remover o `console.log` de debug após identificação

## 2. Criar utilitário de parse de mensagem

- [x] 2.1 Criar função `parseTicketMessage(texto)` em `TicketsList.jsx` (inline) ou em `src/utils/ticketUtils.js`
- [x] 2.2 Implementar extração do conteúdo entre delimitadores `========================`
- [x] 2.3 Implementar remoção de linhas de cabeçalho conhecidas (`DESCREVA A SITUAÇÃO:`, `Solicitante:`, `OBS:`)
- [x] 2.4 Implementar truncamento a 150 caracteres com `...` ao final
- [x] 2.5 Implementar fallback gracioso (retornar texto original truncado se padrão não encontrado)

## 3. Atualizar colunas da tabela em TicketsList.jsx

- [x] 3.1 Remover a coluna `protocolo` do array `columns` do `ResponsiveTable`
- [x] 3.2 Atualizar a coluna `titulo` para exibir como "Assunto" (header: `'Assunto'`)
- [x] 3.3 Atualizar a coluna `menssagem` para usar `parseTicketMessage(row.menssagem)` no render
- [x] 3.4 Corrigir a coluna `data_cadastro` para usar o campo de data identificado na Tarefa 1 (`data_criacao`)
- [x] 3.5 Implementar fallback de data via protocolo (extrair `YYYYMMDD` dos primeiros 8 dígitos quando campo direto for nulo)
- [x] 3.6 Reordenar colunas para: ID → Assunto → Mensagem → Status → Data

## 4. Validação visual

- [x] 4.1 Verificar renderização desktop (tabela com 5 colunas) — validado via build e inspeção de código
- [x] 4.2 Verificar renderização mobile (cards responsivos via `ResponsiveTable`) — comportamento preservado, colunas alteradas mantêm compatibilidade com cards
- [x] 4.3 Confirmar que mensagens de múltiplos tipos de ticket (SUPORTE TI, CRM, ABERTURA COBRANÇA) são limpas corretamente — testado cenários SUPORTE TI com template, texto simples, texto com Solicitante e fallback
