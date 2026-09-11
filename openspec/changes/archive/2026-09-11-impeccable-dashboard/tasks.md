## 0. Backlog consolidado (origem)

Crítica 26/40 (`.impeccable/critique/2026-09-11T00-15-42Z__src-components-dashboard-jsx.md`) e audit 12/20 (`docs/impeccable/audit-dashboard-2026-09-11.md`). Decisões do Felix (2026-09-11): escopo P0 + P1 apenas; grid customizável documentado como removido, não reativado.

## 1. Botão de ação do OS (P0) — `harden`

- [x] 1.1 `Dashboard.jsx`: criada `ACTION_BTN_PRIMARY` (sem `bg-surface`/`border-border`) ao lado de `ACTION_BTN`, com texto em `text-[var(--on-accent)]` (não branco: branco sobre o accent rendia 2,79:1) e sem `hover:bg-primary-hover` (navy sobre o hover caía a 3,35:1 no claro) — hover eleva com sombra, mesmo padrão do botão do NotFound
- [x] 1.2 Botão "Gerenciar Meus Chamados" do `OsBento` trocado para `ACTION_BTN_PRIMARY`
- [x] 1.3 Verificado nos temas claro/Default Dark/Cyber/AMOLED, repouso e hover: 6,22 / 6,11 / 6,11 / 7,06:1; alvo de toque 44px (ambas as constantes ganharam `min-h-[44px]`, achado da verificação final — mediam 35px)

## 2. `TiSupportModal` acessível (P1) — `harden`

- [x] 2.1 `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (`TITULO_ID`) no container do modal
- [x] 2.2 `useDismissable` (Escape em fase de captura, clique fora, foco inicial/retorno) + trap de Tab local (mesmo padrão do `BottomSheet.jsx`)
- [x] 2.3 Verificado no navegador: Tab preso em ciclo completo dentro do modal; Escape fecha e devolve o foco ao botão "Suporte TI"; clique fora fecha. Achado da verificação final: o botão de fechar (primeiro foco ao abrir) não tinha `aria-label` — corrigido (`aria-label="Fechar"`)

## 3. `GlowingEffect` na paleta da marca (P1) — `colorize`

- [x] 3.1 `ui/glowing-effect.tsx`: nova variante `variant="brand"` usando `var(--accent)`/`var(--accent-dark)`/`var(--accent-deep)` (as cores originais de demonstração ficam só no branch `default`, para não quebrar outros consumidores)
- [x] 3.2 Os 9 usos de `GlowingEffect` no `Dashboard.jsx` trocados para `variant="brand"` (confirmado em runtime: 9 de 9)
- [x] 3.3 Verificado visualmente e por `getComputedStyle('--gradient')` nos temas claro/dark; o brilho segue o cursor normalmente, só a cor mudou

## 4. Badges de estado com contraste AA (P1) — `harden`

- [x] 4.1 `KpiCard.toneClasses`: `--success-bento`/`--warning-bento`/`--danger-bento` → `--success-strong`/`--warning-strong`/`--danger-strong` como cor de texto
- [x] 4.2 Badge "Tudo em dia"/status do `OsBento`: mesma troca de token
- [x] 4.3 Verificado ≥ 4,5:1 nos temas claro/Default Dark/Cyber/AMOLED (6,00 a 11,26:1 nos casos medidos). Achado da verificação final: um badge irmão não citado no backlog original (pill de data do `AniversariantesCard`) ainda usava `-bento` (3,82:1) — corrigido para `-strong` também

## 5. Documentar o grid como removido (P1) — `clarify`

- [x] 5.1 `PRODUCT.md`: seção Capabilities and Constraints atualizada — grid fixo, com a razão e o caminho de volta (endpoints de backend) documentados
- [x] 5.2 `MEMORIA.md`: decisão registrada (2026-09-11, Felix)
- [x] 5.3 Delta `REMOVED` para os dois requisitos de `dashboard-customization` (motivo + migração) em `openspec/changes/impeccable-dashboard/specs/dashboard-customization/spec.md`; a spec principal fica sem requisitos ao arquivar (pasta removida na sincronização)

## 6. Verificação e portão

- [x] 6.1 `npx vite build` limpo (duas vezes: após a rodada principal e após os 3 ajustes da verificação final)
- [x] 6.2 Navegador: botão de OS visível, focável e com 44px nos 5 temas relevantes e 2 viewports; `TiSupportModal` com Tab preso e Escape funcionando; brilho de hover laranja nos 9 cards (runtime, não só código); badges com contraste medido
- [x] 6.3 `/impeccable audit` (relatório único cobre antes/depois, ver `docs/impeccable/audit-dashboard-2026-09-11.md`) e `/impeccable critique src/components/Dashboard.jsx` em 2 rodadas: 26 → **35/40** (alvo ≥ 30 superado, 0 P0/P1). Snapshot `.impeccable/critique/2026-09-11T22-44-37Z__src-components-dashboard-jsx.md`. Tendência completa: 13 → 15 → 26 → 35
- [x] 6.4 Anotado na seção Transversal do programa: colisão de utilitários Tailwind, componente de terceiro não recolorido (`GlowingEffect` também em `BentoCard.jsx`, área de Serviços — Fase 10), token "de gráfico" usado como texto
- [x] 6.5 Commit e marcar 3.6 a 3.8 em `programa-impeccable/tasks.md`
