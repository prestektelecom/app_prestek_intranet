## 1. Refatorar layout dos botões em AtalhosRapidosCard

- [x] 1.1 Localizar o JSX dos botões em `AtalhosRapidosCard` no `Dashboard.jsx` (linhas ~832–846)
- [x] 1.2 Substituir o bloco de texto horizontal por um `div` com `flex flex-col min-w-0 flex-1`
- [x] 1.3 Mover o label (`{a.label}`) para dentro do novo div como elemento filho, com classes `text-[13px] font-semibold text-foreground leading-tight`
- [x] 1.4 Mover o hint (`{a.hint}`) para baixo do label, com classes `text-[11px] text-muted leading-tight`
- [x] 1.5 Remover `shrink-0 truncate` do hint (não são mais necessários com layout vertical)
- [x] 1.6 Remover `truncate` do label, pois o espaço agora é exclusivo dele

## 2. Verificação visual e de acessibilidade

- [x] 2.1 Conferir no browser (npm run dev) que label e hint estão empilhados e legíveis
- [x] 2.2 Verificar que a altura dos botões é ≥ 44px com o novo layout
- [x] 2.3 Testar scroll vertical do card quando os botões ficam maiores
- [x] 2.4 Verificar breakpoint `sm` (mobile) — card não deve ultrapassar a tela
- [x] 2.5 Confirmar que todos os 7 atalhos ainda funcionam (clique abre a view/URL correta)
