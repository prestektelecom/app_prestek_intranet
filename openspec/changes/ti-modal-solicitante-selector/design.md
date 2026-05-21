## Context

O `TiSupportModal` atualmente exibe o solicitante como texto estático (nome do usuário logado). O campo `nome_solicitante` já é enviado ao backend e aceito pela rota `/api/ixc/su-ticket`. A mudança adiciona um `<select>` no modal para permitir ao usuário escolher o solicitante, construindo a fundação para, no futuro, popular a lista com outros colaboradores da empresa.

## Goals / Non-Goals

**Goals:**
- Substituir o texto estático de identificação do solicitante por um elemento `<select>`.
- Pré-selecionar automaticamente o usuário logado como opção padrão.
- Enviar o nome do solicitante selecionado (não o ID) ao backend via `nome_solicitante`.
- Seguir o padrão de inline styles do Dashboard (paleta `C`, fontes, etc.).

**Non-Goals:**
- Buscar lista dinâmica de colaboradores da API nesta entrega.
- Alterações no backend (`server.js`).
- Salvar a preferência de solicitante entre sessões.

## Decisions

**1. Estrutura do estado do select**
- Usar `useState` para o solicitante selecionado, iniciando com o nome e ID do usuário logado.
- A lista de opções é um array de objetos `{ id, nome }` — facilita a expansão futura sem refatoração.

**2. O que é enviado ao backend**
- Envia `nome_solicitante` (string de nome) como já funciona hoje.
- O `colaborador_id` / `tecnico_id` continua sendo o do usuário logado (não muda com a seleção — refatorar isso é escopo futuro).

**3. Estilo do `<select>`**
- Inline styles alinhados ao padrão do Dashboard (mesmas bordas, fontes, cores).
- Label no padrão monospace uppercase igual aos outros campos do modal.

## Risks / Trade-offs

- **[Risco] Lista estática por enquanto** → Mitigação: A estrutura em array de objetos já está pronta para receber dados dinâmicos; a expansão será só adicionar um `fetch` e popular o array.
- **[Trade-off] ID do técnico não muda com a seleção** → Explicitado no Non-Goals; é escopo separado e consciente.
