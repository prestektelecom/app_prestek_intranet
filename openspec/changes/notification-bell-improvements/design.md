## Context

O `Header.jsx` tem um sino de notificações que faz polling de `/api/comunicados` a cada 30s. Atualmente filtra apenas `tipo === 'Urgente'`, descartando `Importante` e `Geral`. O estado "visto" existe apenas em memória (`useState`), então o badge reaparece ao recarregar. O dropdown abre instantaneamente sem animação.

## Goals / Non-Goals

**Goals:**
- Exibir Urgente + Importante no painel do sino
- Badge adaptativo: vermelho (Urgente presente) ou amarelo (só Importante)
- Persistência do "visto" por userId + ID de comunicado no localStorage
- Animação de entrada suave no dropdown

**Non-Goals:**
- Exibir comunicados do tipo Geral no sino (ficam apenas na página de Comunicados)
- Notificações push / Web Push API
- Configurações por usuário sobre quais tipos receber
- Paginação ou lazy-load dentro do dropdown

## Decisions

### D1 — Persistência: localStorage com chave por userId

**Escolha:** `localStorage.setItem('notif_seen_${userId}', JSON.stringify([...ids]))`

**Alternativas:**
- `sessionStorage` → perde ao fechar aba, não resolve o problema
- Backend (endpoint `/api/notificacoes/lidas`) → over-engineering para o escopo atual, exigiria migração de banco
- Apenas por sessão (estado atual) → descartado, é o problema

**Rationale:** localStorage é suficiente para este caso. O prefixo `notif_seen_${userId}` isola por usuário no mesmo browser. IDs são strings do banco (não timestamps), então são estáveis.

### D2 — Badge: cor adaptativa por prioridade máxima

**Escolha:** verificar urgentes primeiro; se `urgentes.length > 0` → badge vermelho (`C.danger`); else se `importantes.length > 0` → badge amarelo (`C.warning`).

**Alternativa descartada:** badge com número e múltiplas cores simultaneamente → complexidade visual desnecessária para o tamanho do dropdown.

### D3 — Animação: CSS `@keyframes` inline

**Escolha:** `<style>` tag com `@keyframes notif-dropdown-in` dentro do componente Header.

**Alternativa:** Framer Motion → não é dependência do projeto. Adicionar apenas para esta animação seria desproporcional.

**Rationale:** É o padrão já adotado em `Comunicados.jsx` (`card-in`, `pulse`). Consistência > sofisticação.

### D4 — Geral: excluído do sino

**Rationale:** Comunicados Gerais são informativos, não urgentes. O sino deve ser reservado para itens que exigem atenção. Geral permanece visível somente na página de Comunicados.

## Risks / Trade-offs

- **localStorage por browser:** usuário que usa dois dispositivos verá o badge no segundo mesmo tendo visto no primeiro → aceitável para o escopo atual
- **IDs vs timestamps:** se o backend reciclar IDs (improvável em auto-increment), um comunicado antigo poderia ser marcado como visto prematuramente → risco desprezível
- **Limite de localStorage:** com muitos comunicados ao longo do tempo, o array de IDs cresce → solução: manter apenas os IDs dos últimos N comunicados (ex: 200); o Header não faz limpeza ainda, mas o array de urgentes/importantes raramente passa de dezenas

## Migration Plan

- Mudança puramente front-end, sem quebra de API
- Não há rollback necessário: remover o `localStorage.getItem` reverte para comportamento anterior
- Deploy direto, sem feature flag
