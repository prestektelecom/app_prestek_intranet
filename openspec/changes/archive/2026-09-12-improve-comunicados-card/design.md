## Context

O `ComunicadosCard` é um widget do Dashboard que lista os comunicados mais recentes vindos de `/api/comunicados`. Atualmente renderiza cada item com a descrição completa truncada em 1 linha (sem contexto real), sem cor nas tags por tipo e sem interação ao clicar no item.

O componente usa inline styles com o sistema de tokens `C` (via `useBentoTheme`), padrão consolidado no projeto. A função `tagStyle()` já mapeia tipos para cores corretas da paleta (`C.dangerSoft`, `C.warningSoft`, `C.accentSoft`), mas o render visual não aproveitava isso totalmente.

## Goals / Non-Goals

**Goals:**
- Melhorar legibilidade da descrição com preview de até 2 linhas
- Adicionar indicador visual de prioridade (stripe lateral colorida) por tipo
- Tornar cada item clicável navegando para a view `announcements`
- Garantir que a tag de tipo tenha cor correta mesmo para `"Importante"` (fallback do `tagStyle` usava cinza neutro)
- Exibir a data e hora de criação completas via tooltip (atributo `title` do HTML) ao passar o mouse sobre o tempo relativo de criação do comunicado.

**Non-Goals:**
- Não criar estado de "não lido" — requer mudança de backend
- Não alterar a API ou o modelo de dados
- Não adicionar animações complexas ou modais inline

## Decisions

### D1 — Stripe lateral via `borderLeft` em vez de ícone dedicado

**Decisão**: Usar `borderLeft: 3px solid <cor>` no container do item.

**Rationale**: Comunica prioridade instantaneamente em qualquer largura de card, sem ocupar espaço horizontal extra. Alternativa de ícone por tipo exigiria manter um mapa de ícones e ocupa área valiosa na linha já densa.

**Alternativa descartada**: Ícone SVG colorido antes da tag — mais pesado visualmente e redundante com a tag de texto.

### D2 — Preview de 2 linhas com `WebkitLineClamp`

**Decisão**: Substituir `whiteSpace: 'nowrap'` por:
```js
display: '-webkit-box',
WebkitLineClamp: 2,
WebkitBoxOrient: 'vertical',
overflow: 'hidden',
whiteSpace: 'normal',
```

**Rationale**: Suporte universal em browsers modernos. Entrega contexto real sem quebrar o layout do card. A altura do item aumenta levemente mas o gap de 4px e o `flexDirection: column` do container já acomodam isso.

**Alternativa descartada**: Truncar manualmente via JS (`.slice(0, 120) + '...'`) — frágil e não respeita largura dinâmica.

### D3 — Click navega para `announcements` sem estado extra

**Decisão**: `onClick={() => setCurrentView('announcements')}` diretamente no item.

**Rationale**: Simples, sem novo estado, sem nova rota. A tela de Comunicados já tem filtros e busca — o usuário chega lá e pode encontrar o item. Alternativa de abrir modal inline foi descartada por requerer nova lógica de estado e overlay.

### D4 — Exibição de Data Completa via Tooltip (`title`)
**Decisão**: Adicionar o atributo `title` formatando a data completa usando `Intl.DateTimeFormat` ou `.toLocaleString('pt-BR')` no span/div que exibe o tempo relativo do comunicado (ex: `há 6d`). Isso será aplicado tanto no Dashboard (`Dashboard.jsx`) quanto na tela detalhada de comunicados (`Comunicados.jsx`).

**Rationale**: Respeita o design atual de tempo relativo (que é limpo e facilita o escaneamento), permitindo que usuários que necessitam saber o horário e dia exatos consigam visualizá-lo com um simples movimento do cursor sobre a informação.

## Risks / Trade-offs

- **Altura variável dos itens**: Com 2 linhas de descrição, cards com muitos comunicados ficam mais altos. O `react-grid-layout` respeita a altura definida no layout — se o card for pequeno, os itens podem ser cortados. → Mitigação: a mudança só afeta visual inline, o scroll do container cobre o caso.
- **`-webkit-box`**: Tecnicamente prefixado, mas suporte é 100% nos browsers alvo (Chrome, Edge, Firefox, Safari modernos). Sem risco real.
