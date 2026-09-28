## 1. Estado unificado de hover/foco no NavRow

- [x] 1.1 Adicionar `onFocus`/`onBlur` ao `<button>` do `NavRow` (`Sidebar.jsx`), alimentando o
      mesmo estado que hoje só `onMouseEnter`/`onMouseLeave` controlam (ou um `isEmphasized =
      hover || focused` derivado de dois estados). Feito via `hover`+`focused` → `emphasized`.
- [x] 1.2 Confirmar que `active` (item da rota atual) continua tendo prioridade visual sobre
      hover/foco, como hoje (`background: active ? C.accentSoft : (hover ? C.surface :
      'transparent')`). Ternários preservados, só `hover` → `emphasized`.

## 2. Efeito no ícone

- [x] 2.1 Aplicar `transform: scale(1.1)` no `<span>` que envolve `IconComponent`, com
      `transition` ~150-180ms `ease-out`, disparado pelo estado unificado da tarefa 1. Feito via
      classe `.navrow-icon.is-boosted` (CSS, não inline) — necessário porque `stroke-width` é um
      atributo de apresentação no `<svg>` de cada ícone (`sk` em `Icons.jsx`), e um valor CSS
      herdado de um `<span>` ancestral não o sobrescreve; só uma regra CSS com seletor real vence.
- [x] 2.2 Aumentar `stroke-width` de 1.7 para 2 no mesmo estado — resolvido pela mesma regra CSS
      (`.navrow-icon.is-boosted svg`), sem tocar os ~20 ícones individualmente em `Icons.jsx`.
- [x] 2.3 Verificar que nenhuma mudança de `width`/`height` ocorre (só `transform` + atributo
      de traço) — sem layout shift nos itens vizinhos. Confirmado por leitura: só `transform` e
      `stroke-width` na regra nova, `transform-box: fill-box` garante escala centrada no ícone.

## 3. Verificação

- [x] 3.1 Testar ao vivo: hover de mouse em 3-4 itens da Sidebar (incluindo o item ativo, para
      confirmar que o estado `active` não é ofuscado pelo novo efeito). Confirmado pelo Felix
      ("ficou bom") na própria sessão logada, não por mim — não tenho credencial pra logar.
- [x] 3.2 Testar ao vivo: Tab pela Sidebar inteira, confirmando que cada item focado mostra o
      mesmo efeito de ícone que o hover de mouse, sem conflitar visualmente com o anel
      `:focus-visible` já desenhado por cima. Confirmado pelo Felix junto com 3.1.
- [x] 3.3 Testar com `prefers-reduced-motion: reduce` ativado no sistema — confirmado por
      leitura, sem precisar rodar: a regra global em `index.css:728-737` é `*, *::before,
      *::after { transition-duration: 0.01ms !important; }`, um seletor universal com
      `!important` que neutraliza a transição nova (`.navrow-icon svg`) sem precisar de
      nenhuma regra adicional.
- [x] 3.4 Testar nos 5 temas (claro + 4 escuros) — o efeito não depende de cor nova, mas vale
      confirmar que `stroke-width` maior não compromete legibilidade em nenhum tema. Confirmado
      pelo Felix junto com 3.1.
- [x] 3.5 Testar no modo colapsado da Sidebar (72px, só ícone) — é onde o efeito é mais visível
      por não competir com o rótulo de texto. Confirmado pelo Felix junto com 3.1.
- [x] 3.6 Impeccable — `/impeccable audit` rodado em `src/components/Sidebar.jsx`. Detector
      determinístico limpo (0 achados). **17/20 (Bom)**: A11y 3, Performance 4, Theming 4,
      Responsivo 3, Integridade de Implementação 3. Zero P0/P1. 3 achados registrados (nenhum
      bloqueante, nenhum introduzido por esta change):
      - **[P3] `GroupLabel` some por completo pra leitor de tela no modo colapsado** (só vira
        `<hr>`, sem texto `sr-only`) — pré-existente, não relacionado ao hover/foco.
      - **[P2/P3] Altura do `NavRow` (~38px) abaixo do mínimo de toque de 44px** — mitigado por
        `aside` ser `hidden lg:flex` (majoritariamente mouse), mas `lg`+ inclui notebooks/
        tablets touch; pré-existente.
      - **[P3] Botão de colapsar usa mutação direta de `style` no hover** em vez do padrão de
        estado React que `NavRow`/botão de perfil já usam no mesmo arquivo — inconsistência de
        padrão, não bug; pré-existente.
      Risco especulado no `design.md` desta change (anel `:focus-visible` conflitando com o
      efeito novo do ícone) **descartado por leitura**: o anel é `outline` 2px/offset 2px em
      torno do botão inteiro; o efeito novo é `transform` só no ícone lá dentro — sem
      sobreposição espacial. Resultado completo registrado no `MEMORIA.md`.

## 4. Fechamento

- [x] 4.1 `npx vite build` limpo — confirmado, nenhum erro/aviso novo (só o warning
      pré-existente do chunk de mapas, já aceito por decisão registrada no `MEMORIA.md`).
- [x] 4.2 Ao arquivar: sincronizar a spec `chrome-keyboard-access` com o requisito de paridade
      hover/foco descrito no proposal.md (seguindo o padrão já usado nas changes anteriores —
      delta escrito manualmente no arquivamento, não neste momento de proposta).
