## 0. Backlog consolidado (origem)

Crítica 26/40 (`.impeccable/critique/2026-09-11T00-15-42Z__src-components-dashboard-jsx.md`) e audit 12/20 (`docs/impeccable/audit-dashboard-2026-09-11.md`). Decisões do Felix (2026-09-11): escopo P0 + P1 apenas; grid customizável documentado como removido, não reativado.

## 1. Botão de ação do OS (P0) — `harden`

- [ ] 1.1 `Dashboard.jsx`: criar `ACTION_BTN_PRIMARY` (sem `bg-surface`/`border-border`) ao lado de `ACTION_BTN`
- [ ] 1.2 Trocar o botão "Gerenciar Meus Chamados" do `OsBento` para `ACTION_BTN_PRIMARY`
- [ ] 1.3 Verificar nos cinco temas: contraste do texto sobre o preenchimento ≥ 4,5:1; alvo de toque ≥ 44px no celular

## 2. `TiSupportModal` acessível (P1) — `harden`

- [ ] 2.1 Adicionar `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (apontando para o título) no container do modal
- [ ] 2.2 Usar `useDismissable` (ou replicar seu contrato) para: foco inicial no primeiro campo ao abrir, trap de Tab dentro do modal, Escape fechando, clique fora fechando
- [ ] 2.3 Verificar no navegador: Tab não visita mais elementos de fundo com o modal aberto; Escape fecha; foco volta ao botão que abriu

## 3. `GlowingEffect` na paleta da marca (P1) — `colorize`

- [ ] 3.1 `ui/glowing-effect.tsx`: nova variante (`variant="brand"`) usando `var(--accent)`/`var(--accent-dark)`/`var(--accent-deep)` no lugar das 4 cores hardcoded
- [ ] 3.2 Trocar os 9 usos de `GlowingEffect` no `Dashboard.jsx` para a nova variante
- [ ] 3.3 Verificar visualmente nos cinco temas (o brilho precisa continuar seguindo o cursor, só a cor muda)

## 4. Badges de estado com contraste AA (P1) — `harden`

- [ ] 4.1 `KpiCard.toneClasses`: trocar `--success-bento`/`--warning-bento`/`--danger-bento` por `--success-strong`/`--warning-strong`/`--danger-strong` como cor de texto
- [ ] 4.2 Badge "Tudo em dia"/status do `OsBento`: mesma troca de token
- [ ] 4.3 Verificar contraste ≥ 4,5:1 nos cinco temas (script ou medição no navegador)

## 5. Documentar o grid como removido (P1) — `clarify`

- [ ] 5.1 `PRODUCT.md`: remover a menção ao grid customizável como capacidade ativa (seção Capabilities and Constraints)
- [ ] 5.2 `MEMORIA.md`: registrar a decisão (2026-09-11, Felix) com a razão e onde reconsiderar
- [ ] 5.3 OpenSpec: delta `REMOVED` para os dois requisitos de `dashboard-customization` (motivo + migração), sincronizar ao arquivar (a spec fica sem requisitos e é removida)

## 6. Verificação e portão

- [ ] 6.1 `npx vite build` limpo
- [ ] 6.2 Navegador: botão de OS visível e focável nos 5 temas e 2 viewports; `TiSupportModal` com Tab preso e Escape funcionando; brilho de hover laranja nos 9 cards; badges com contraste medido
- [ ] 6.3 `/impeccable audit` de novo (12 → ≥ 16) e `/impeccable critique src/components/Dashboard.jsx` (26 → ≥ 30, sem P0/P1)
- [ ] 6.4 Anotar na seção Transversal do programa os padrões novos: colisão de utilitários Tailwind, componente de terceiro não recolorido, token "de gráfico" usado como texto
- [ ] 6.5 Commit e marcar 3.6 a 3.8 em `programa-impeccable/tasks.md`
