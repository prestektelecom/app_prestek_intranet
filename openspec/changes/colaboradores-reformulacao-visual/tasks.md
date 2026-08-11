## 1. Cores por departamento

- [x] 1.1 Criar `src/components/directory/deptColors.js` com as três rampas por departamento (`tintaClara`, `tintaEscura`, `marca`) definidas em `design.md` D1
- [x] 1.2 Implementar `normalizar()` com `.normalize('NFD').replace(/\p{Diacritic}/gu, '')` — sem isso "Suporte Técnico" não casa com `tecnic`
- [x] 1.3 Trocar `includes('ti')` por match com limite de palavra; hoje "Marketing" e "Logística" recebem a cor do TI
- [x] 1.4 Exportar `useDeptColor()` que devolve `{ tinta, marca }` já resolvidos pelo tema via `C.bg !== BENTO_LIGHT.bg`
- [x] 1.5 Descartar os helpers locais `hexToRgb`/`tone` em favor de `src/utils/tone.js`

## 2. Hero

- [x] 2.1 Criar `src/components/directory/DirectoryHero.jsx` usando `TiHero.jsx` como referência estrutural
- [x] 2.2 Fundo via `fundoHero(C)` de `ui/heroGradiente` — resolve a rampa invertida nos três temas escuros
- [x] 2.3 Retícula de pontos 22px com `aria-hidden="true"`, no lugar da grade quadrada de 40px
- [x] 2.4 Remover os dois blur orbs (o segundo usa `C.cyan`, que vale `#FDBA74` nos quatro temas)
- [x] 2.5 Substituir o input inline por `<HeroSearchInput>`, envolto em `<form role="search">`
- [x] 2.6 KPIs no painel `bg-black/60` com `LABEL_MONO` e `tabular-nums`, não em pílulas `rgba(255,255,255,0.18)`
- [x] 2.7 Título na escala da casa (`26/30/34`), sem o emoji `👥`; subtítulo reescrito com substantivos concretos
- [x] 2.8 Remover o `maxWidth: 1440, margin: '0 auto'` morto de dentro do hero

## 3. Card

- [x] 3.1 Criar `src/components/directory/EmployeeCard.jsx`
- [x] 3.2 Inverter o CSS das ações: visível por default, escondido só em `(hover: hover) and (pointer: fine)`, com `:focus-within`
- [x] 3.3 Linha de e-mail vira `<a href="mailto:">`; remover o botão "E-mail" duplicado da barra de ações
- [x] 3.4 Remover `maxWidth: 180` do e-mail
- [x] 3.5 Aplicar a escala tipográfica de 6 degraus; nome sobe para 18px/700
- [x] 3.6 Remover `pulse-ring`; ponto de status usa `C.success` em vez do verde hardcoded `rgba(31,138,91,…)`
- [x] 3.7 `alt=""` no avatar, `loading="lazy"`, `decoding="async"`
- [x] 3.8 Sombra visível nos temas escuros (`rgba(0,0,0,.06)` some sobre amoled)
- [x] 3.9 Alvos de ação com ≥44px de altura efetiva; `aria-disabled` quando não há contato

## 4. Linha (visão lista)

- [x] 4.1 Criar `src/components/directory/EmployeeRow.jsx`: avatar 32px, nome, badge de depto, ramal em `font-mono tabular-nums`, e-mail, ações
- [x] 4.2 `<li>` semântico, alvos de 44px, ações sempre visíveis

## 5. Toolbar

- [x] 5.1 Criar `src/components/directory/DirectoryToolbar.jsx`
- [x] 5.2 Trocar o `ChipButton` local pelo `ui/ChipButton` compartilhado (ganha `aria-pressed`, `type="button"`, `snap-start`)
- [x] 5.3 Envolver a faixa em `<nav aria-label="Filtrar por departamento">` com `snap-x snap-mandatory scroll-smooth`
- [x] 5.4 Máscara de fade nas bordas da faixa como pista de overflow
- [x] 5.5 Segmented control grid/lista com persistência em `localStorage` sob `@Stitch:directoryView`
- [x] 5.6 Contador de resultados com `aria-live="polite"`

## 6. Estados

- [x] 6.1 Criar `src/components/directory/DirectoryStates.jsx`
- [x] 6.2 `ErrorState` de tela cheia com "Tentar novamente" que rechama `carregar()`
- [x] 6.3 Banner de falha **parcial** quando só as APIs de taxonomia caem
- [x] 6.4 `SkeletonCard` espelhando o layout real do card, em quantidade igual ao primeiro lote (16, não 8)
- [x] 6.5 `SkeletonRow` equivalente para a visão lista
- [x] 6.6 Reservar a altura do contador e da faixa de chips durante o carregamento (hoje a faixa mostra "Todos 0")
- [x] 6.7 `EmptyState` sem glifos Unicode soltos

## 7. Shell e dados

- [x] 7.1 Reescrever `src/components/Directory.jsx` para shell + fetch + filtros + estado
- [x] 7.2 `<main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">` + container `mx-auto max-w-[1200px] flex-col gap-8`
- [x] 7.3 Grid de 3 colunas (`sm:grid-cols-2 lg:grid-cols-3`), lembrando que o container é ~330px mais estreito que a viewport
- [x] 7.4 Derivar os três KPIs do mesmo `useMemo` que alimenta os chips
- [x] 7.5 Extrair `13 → [15, 68]` para constante nomeada e comentada
- [x] 7.6 `sessionStorage.getItem` em inicializador lazy do `useState`
- [x] 7.7 Corrigir as deps do `useEffect` de carga (usa `isAdmin` com deps `[]`)
- [x] 7.8 Preservar `resolverDepartamento`, `getWhatsAppUrl`, `Promise.all` e o `sentinelRef` como callback ref

## 8. Semântica

- [x] 8.1 Grid e lista viram `<ul>`/`<li>`
- [x] 8.2 Corrigir o salto de heading `h1` → `h3`
- [x] 8.3 Substituir os glifos `✕` e `✓` por Material Symbols

## 9. Specs

- [x] 9.1 Atualizar `openspec/specs/people-hub-hero/spec.md` — remove a exigência do gradiente azul, adota `fundoHero` e o painel de KPIs
- [x] 9.2 Atualizar `openspec/specs/employee-card-v2/spec.md` — ações não são mais hover-only, `pulse-ring` sai, duas rampas de cor
- [x] 9.3 Atualizar `openspec/specs/department-chip-filter/spec.md` — estilo ativo deixa de ser azul, chips ganham `aria-pressed`
- [x] 9.4 Atualizar `openspec/specs/infinite-scroll-directory/spec.md` — `aria-live`, lista semântica, esqueleto espelhado
- [x] 9.5 Criar a spec nova `directory-densidade`

## 10. Verificação

- [x] 10.1 `npm run build` sem erro
- [ ] 10.2 Conferir a tela nos cinco temas: gradiente monotônico, badge legível, borda visível, sombra perceptível
- [ ] 10.3 Medir no DevTools o contraste do badge dos 8 departamentos no tema claro e no amoled
- [ ] 10.4 Percorrer a tela só com `Tab`: foco sempre visível, ações aparecem ao receber foco, chips anunciam `aria-pressed`
- [ ] 10.5 Derrubar o backend e recarregar → erro com "Tentar novamente", não "Nenhum colaborador"
- [ ] 10.6 Conferir que o KPI "Departamentos" bate com a contagem de chips, e que o chip do depto 13 bate com "Exibindo X de Y"
- [x] 10.7 Confirmar que "Marketing" e "Logística" não recebem mais a cor do TI
- [ ] 10.8 Viewport de 360px: padding de 16px, sem overflow horizontal, alvos ≥44px
- [ ] 10.9 Alternar grid/lista, recarregar, preferência persiste
- [ ] 10.10 Comparar lado a lado com a Central de Vendas: largura, padding e ritmo vertical idênticos
