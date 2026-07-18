## Context

O Header da intranet Prestek possui um botão de sino que exibe comunicados do tipo `Urgente` e `Importante` buscados em `/api/comunicados` a cada 30s. O estado de "visto" é persistido no `localStorage` por userId. O componente atual tem: badge de ponto simples (apenas cor), sem contador, sem distinção visual de lidos/não-lidos por item, sem agrupamento, sem tempo relativo, e sem animação significativa no botão.

O `Header.jsx` hoje tem 322 linhas — o bloco de notificações já representa ~130 linhas. Qualquer adição substancial exige extração para componente próprio.

## Goals / Non-Goals

**Goals:**
- Badge numérico visível no sino (ex: "3")
- Botão com animação de shake no hover quando há notificações não lidas
- Indicador de carregamento (loading spinner sutil) durante fetch
- Marcação individual de item como lido ao clicar — persiste no localStorage
- Ação "Marcar todas como lidas" no header do dropdown
- Agrupamento de notificações por tipo: Urgente → Importante
- Tempo relativo em pt-BR (ex: "há 2h", "ontem")
- Melhoria de acessibilidade (aria-label, aria-expanded, role)
- Extração para `NotificationBell.jsx` mantendo todos os props atuais

**Non-Goals:**
- Persistência de leitura no backend (continua só localStorage)
- Notificações push/WebSocket (fora de escopo)
- Notificações de outros tipos além de Urgente/Importante
- Rewrite da tela de comunicados (`Comunicados.jsx`)

## Decisions

### D1 — Extração do componente
**Decisão**: Extrair o bloco de notificações para `src/components/notifications/NotificationBell.jsx`.  
**Rationale**: Header.jsx já está próximo do limite de 200 linhas por regra de projeto. O componente de sino tem seu próprio estado e lógica isolada. A extração não quebra o Header — ele continua recebendo os mesmos props.  
**Alternativa considerada**: Manter em Header.jsx com hooks extraídos. Rejeitado porque a marcação individual e agrupamento aumentarão mais o tamanho.

### D2 — Badge numérico
**Decisão**: Badge mostra o número de itens não lidos (unseen), cap em "9+" acima de 9.  
**Rationale**: Número é mais informativo que ponto colorido. Cap evita overflow visual.  
**Alternativa**: mostrar total de notificações. Rejeitado — o que importa é o não-lido.

### D3 — Animação shake
**Decisão**: `bell-shake` keyframe em `index.css` aplicado via classe CSS no hover do botão **somente quando há unseen > 0**.  
**Rationale**: Animação contextual — sem notificações, não há necessidade de chamar atenção. Implementar via CSS puro sem biblioteca.

### D4 — Tempo relativo
**Decisão**: Utilitário `formatRelativeTime(dateStr)` em `src/utils/relativeTime.js` usando `Intl.RelativeTimeFormat` (nativo, sem dependência).  
**Rationale**: Sem adicionar dependência externa. Suporta "agora", "há X minutos", "há X horas", "ontem", "há X dias", "há X semanas", datas antigas como data absoluta.

### D5 — Marcação individual
**Decisão**: Ao clicar num item, adiciona seu id ao `seenIds` no localStorage imediatamente, sem esperar o painel fechar.  
**Rationale**: Feedback imediato — o item muda visualmente de "não lido" para "lido" na hora.

### D6 — Agrupamento visual
**Decisão**: No dropdown, exibir primeiro bloco "Urgente" (com header vermelho) depois bloco "Importante" (amber), sem misturar. Dentro de cada bloco, ordenar por `criado_em` desc.  
**Rationale**: Urgente tem prioridade visual. Mais scannable do que lista plana.

## Risks / Trade-offs

- **[Risco] localStorage crescimento ilimitado de seenIds** → Mitigação: ao salvar, filtrar para manter apenas IDs que ainda existem nas notificações atuais (limpeza automática no save).
- **[Trade-off] Extração de componente** → Requer atualização da importação no Header.jsx. Risco baixo — é só substituir o bloco por `<NotificationBell ... />`.
- **[Risco] Intl.RelativeTimeFormat** → Suporte amplo (todos os browsers modernos). Fallback: mostrar data absoluta formatada se não suportado.
- **[Trade-off] Sem persistência backend** → Se o usuário trocar de device ou limpar o storage, perde o estado de leitura. Aceito para essa iteração.
