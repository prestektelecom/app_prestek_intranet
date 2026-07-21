## Why

O `ServicesDirectory` dispara confetti automaticamente (via CDN externo) toda vez que o carousel auto-avança para os slides de ranking — a cada 3 segundos, sem interação do usuário. O efeito é distratório durante o uso cotidiano da tela e injeta um script desnecessário na aplicação. Além disso, os indicadores de navegação do carousel (3 pontinhos) são pequenos demais para uso em mobile, prejudicando a descoberta do conteúdo.

## What Changes

- **Remove** todo o código de confetti: estado `confettiLoaded`, ref `confettiLoadingRef`, funções `triggerConfetti` e `runConfettiEffects`, e o `useEffect` que os dispara ao trocar de slide.
- **Remove** a injeção dinâmica do script CDN `canvas-confetti`.
- **Remove** os 3 pontinhos de navegação do carousel (pequenos, inacessíveis no mobile).
- **Adiciona** uma seção com header "Rankings do Mês" acima do carousel, com subtítulo contextual.
- **Adiciona** 3 botões de tab com ícone + rótulo (`Planos`, `Colaboradoras`, `Ticket Médio`) como nova navegação do carousel — área de toque mínima de 44px, compatível com mobile e touch.

## Capabilities

### New Capabilities

- `carousel-tab-navigation`: Navegação do carousel de rankings via tabs com rótulo e ícone, substituindo os 3 pontinhos. Inclui header de seção "Rankings do Mês".

### Modified Capabilities

_(nenhuma mudança de requisito em specs existentes)_

## Impact

- **Arquivo principal**: `src/components/ServicesDirectory.jsx`
- **Dependências externas**: remove dependência em runtime de `https://cdn.jsdelivr.net/npm/canvas-confetti`
- **Sem impacto** em APIs, banco de dados ou outros componentes
- **UX mobile**: melhora acessibilidade e descoberta do carousel nos breakpoints `sm`/`md`
