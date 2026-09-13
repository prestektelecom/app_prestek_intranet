## 1. OverrideModal não fabrica dado (P0)

- [x] 1.1 Estado inicial: `tecnologia`/`status` como `null`, `percentual_cobertura` como `0`, quando a região não tem esses campos
- [x] 1.2 Estado `tocado` rastreando se o admin já interagiu com tecnologia/status/percentual
- [x] 1.3 Rótulo "— ainda não definida/o" ao lado de cada campo não tocado
- [x] 1.4 Verificado ao vivo: abrir o modal de uma região sem dado real (DOM CONSTANTINO) mostra os 3 campos sem nenhuma opção marcada e o slider em 0, com o rótulo de aviso

## 2. Contraste dos toggles (P1)

- [x] 2.1 `Coverage.jsx`: toggle Mapa/Lista, `text-[var(--accent)]` → `text-[var(--accent-dark)]`, `text-muted` → `text-faint`
- [x] 2.2 `RegionPanel.jsx`: toggle de ordenação, mesma correção
- [x] 2.3 Verificado ao vivo: 4,88:1 no claro (era 2,63:1) e 8,31:1 no AMOLED, nos dois toggles

## 3. Alvos de toque (P1)

- [x] 3.1 `Coverage.jsx`: toggle Mapa/Lista ganha `min-h-[44px]`
- [x] 3.2 `RegionCard.jsx`: ícone de engrenagem admin ganha `after:-inset-1.5`, mesma técnica de `Pilula`/`SectorCard`
- [x] 3.3 Verificado ao vivo: 44px no toggle; `elementFromPoint` a 4px da caixa visual do ícone de engrenagem resolve para o mesmo botão

## 4. Specs

- [x] 4.1 Atualizar `openspec/specs/cobertura-ui-redesign/spec.md` — requisito de não fabricar dado de classificação e de contraste/área de toque dos toggles

## 5. Verificação

- [x] 5.1 `npx vite build` sem erro
- [x] 5.2 P0 e os 2 P1 verificados ao vivo em claro e AMOLED, com dado real de produção
- [x] 5.3 `openspec validate --strict` limpo na spec tocada
