## Context

Atualmente o `ComunicadoBanner` exibe apenas 1 comunicado em destaque no topo do Dashboard. Para dar visibilidade a múltiplos avisos críticos sem sobrecarregar a tela, a solução ideal é transformar o banner em um **Carousel rotativo dos 3 últimos comunicados prioritários (Urgente / Importante)**, e oferecer suporte completo a cadastro de imagem de capa por URL no painel de comunicados.

## Goals / Non-Goals

**Goals:**
- Adicionar a coluna `imagem_url TEXT` na tabela `comunicados` via migration SQL.
- Atualizar o backend Express (`server.js`) para aceitar e gravar `imagem_url`.
- Adicionar o campo "URL da Imagem de Capa (opcional)" no formulário em `Comunicados.jsx`.
- Implementar carousel com rotação automática (6s), animação de fade, indicadores de slide (`dots`) e pausa ao passar o mouse.
- Selecionar os 3 comunicados de maior relevância: filtrando por `tipo === 'Urgente' || tipo === 'Importante'` (com fallback para mais recentes se houver menos de 3).

**Non-Goals:**
- Infraestrutura pesada de upload de arquivos multipart/form-data (usará URLs diretas HTTP/HTTPS de imagens).
- Animações complexas de slide 3D (será utilizado fade de opacidade limpo e de alto desempenho).

## Decisions

### D1 — Armazenamento de imagem via URL no banco de dados
**Decisão**: Criar campo `imagem_url` do tipo `TEXT` na migration `019_add_imagem_url_comunicados.sql`.

**Rationale**: Permite referenciar imagens hospedadas em serviços internos ou CDNs sem alterar a arquitetura de armazenamento do backend Node/PostgreSQL.

---

### D2 — Seleção e quantidade dos slides no Carousel
**Decisão**: O `ComunicadoBanner` filtrará os comunicados recebidos selecionando até 3 itens da lista, priorizando tipos `Urgente` e `Importante`. Caso haja apenas 1 comunicado, o carousel desativa o timer e os dots de navegação automaticamente.

**Rationale**: Garante excelente UX independente da quantidade de comunicados cadastrados.

---

### D3 — Animação de transição Fade com Tailwind CSS
**Decisão**: Usar transição de opacidade (`transition-opacity duration-700`) gerenciando o índice do slide ativo via `useState`.

**Rationale**: Transições de fade de opacidade não sofrem com problemas de overflow e quebra de layout responsivo em telas pequenas, mantendo o visual moderno.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| URL de imagem inválida ou offline | Tratamento `onError` na imagem para alternar automaticamente para o gradiente de fallback. |
| Troca rápida de slide enquanto o usuário está lendo | Timer de 6 segundos + evento `onMouseEnter` para pausar o carousel enquanto o cursor estiver sobre o banner. |
