## 1. Header adjustments

- [ ] 1.1 Review Header search box and action buttons for overflow at 320px-768px
- [ ] 1.2 Apply responsive classes to prevent search collapse and action overlap
- [ ] 1.3 Test Header at 320px, 375px, 768px and 1024px

## 2. Dashboard responsive grid

- [ ] 2.1 Add `md`, `sm`, `xs` and `xxs` layouts to `ResponsiveReactGridLayout` in `Dashboard.jsx`
- [ ] 2.2 Ensure all layouts contain the same widget keys (`hero`, `setor`, `plantao`, `os`, `comunicados`, `atalhos`, `team`)
- [ ] 2.3 Verify desktop layout (`lg`) remains identical to current behavior

## 3. Dashboard widget scaling

- [ ] 3.1 Make `HeroCard` responsive (padding, font size, button wrapping)
- [ ] 3.2 Make `SetorBento` responsive (convert fixed 3-column grid to stacked or scrollable on mobile)
- [ ] 3.3 Make `OsBento` and `PlantaoBento` responsive (padding, font size)
- [ ] 3.4 Make `ComunicadosCard` and `AtalhosCard` responsive

## 4. Settings page responsive layout

- [ ] 4.1 Convert main grid in `Configuracoes.jsx` from fixed 12 columns to `grid-cols-1 lg:grid-cols-12`
- [ ] 4.2 Make navigation card full-width on mobile and sticky only on desktop
- [ ] 4.3 Convert form fields from fixed `grid-cols-2` to `grid-cols-1 md:grid-cols-2`
- [ ] 4.4 Adjust section paddings and font sizes for mobile

## 5. Verification

- [ ] 5.1 Test Dashboard at 320px, 375px, 768px, 1024px and 1440px
- [ ] 5.2 Test Configurações at 320px, 375px, 768px, 1024px and 1440px
- [ ] 5.3 Confirm no horizontal scroll appears in main content area at any width
- [ ] 5.4 Confirm bottom nav does not cover actionable content
