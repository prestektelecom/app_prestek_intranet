## Context

O `ServicesDirectory` é o componente central de consulta de planos, serviços técnicos e streaming da intranet Prestek. Ele contém um carousel de rankings (Top Planos, Top Colaboradoras, Ticket Médio) que roda automaticamente a cada 3s e, ao avançar para os slides 1 e 2, dispara um efeito de confetti via CDN externo (`canvas-confetti`). O carousel é fundamental para o uso em mobile (tela principal), mas seus indicadores de navegação atuais (3 pontinhos) são inacessíveis para touch.

## Goals / Non-Goals

**Goals:**
- Eliminar completamente o efeito de confetti e a carga do script CDN externo.
- Substituir os 3 pontinhos por tabs com rótulo + ícone, area de toque >= 44px.
- Adicionar um header de seção "Rankings do Mês" acima do carousel para contexto.
- Preservar o auto-play (3s) e o comportamento de pause no hover.

**Non-Goals:**
- Redesenhar os cards do pódio ou a lógica de ranking.
- Alterar filtros, modais de edição, ou lógica de fetch de dados.
- Adicionar suporte a swipe/touch drag no carousel (pode ser feito em outra change).

## Decisions

### D1 — Remover confetti por completo (não apenas desabilitar)

**Decisão**: Apagar as funções `triggerConfetti` e `runConfettiEffects`, o estado `confettiLoaded`, o ref `confettiLoadingRef` e o `useEffect([activeSlide])` inteiro.

**Alternativa considerada**: Envolver em um flag `ENABLE_CONFETTI = false`. Rejeitada — código morto sem utilidade e ainda mantém a dependência do CDN no código.

**Rationale**: Remoção limpa elimina o risco de reativação acidental e reduz linhas de código desnecessárias.

### D2 — Tabs acima do carousel (não dentro do header do slide)

**Decisão**: Colocar as 3 tabs (`Planos`, `Colaboradoras`, `Ticket Médio`) em uma barra de navegação dedicada logo acima do container do carousel, com um título de seção "Rankings do Mês" à esquerda.

**Alternativa considerada**: Colocar dentro do slide como header de cada slide. Rejeitada — os tabs precisam ser visíveis independentemente do slide ativo para servir como navegação.

**Rationale**: Padrão de tab-navigation é familiar, acessível e permite área de toque adequada no mobile.

### D3 — Reutilizar o mesmo estilo de filtros da página

**Decisão**: Usar as mesmas classes Tailwind das tabs de filtro existentes (`bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5]` para ativo, tom suave para inativo) para consistência visual.

**Rationale**: Sem criar novo padrão visual, mantendo coerência com o design system já em uso na tela.

## Risks / Trade-offs

- **[Risco] Remoção do auto-play pode afetar descoberta dos rankings** → Mitigação: o auto-play é mantido; os tabs são um complemento, não um substituto.
- **[Trade-off] Auto-play sem feedback celebratório** → O confetti era o único indicador visual de "ranking especial". Com a remoção, os slides ficam iguais em peso visual. Aceito — é preferível ao impacto distratório.
