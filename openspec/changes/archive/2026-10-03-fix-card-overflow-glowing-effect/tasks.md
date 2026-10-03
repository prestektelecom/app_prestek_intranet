# Implementation Tasks: Fix Card Overflow — GlowingEffect

## 1. Corrigir o token CARD

- [x] 1.1 Em `src/components/Dashboard.jsx` (L17), remover `overflow-hidden` da constante `CARD`.

## 2. Preservar clipping de conteúdo nos cards que usam CARD

- [x] 2.1 **PlantaoBento** — adicionar `overflow-hidden` ao `<div className="relative z-10 flex h-full flex-col gap-3.5">` para manter o clipping do conteúdo interno.
- [x] 2.2 **OsBento** — adicionar `overflow-hidden` ao `<div className="relative z-10 flex h-full flex-col justify-between">`.
- [x] 2.3 **AtalhosCard** — adicionar `overflow-hidden` ao `<div className="relative z-10 flex h-full flex-col gap-[inherit]">`.
- [x] 2.4 **AniversariantesCard** — adicionar `overflow-hidden` ao `<div className="relative z-10 flex h-full flex-col gap-[inherit]">`.
- [x] 2.5 **TeamBento** — adicionar `overflow-hidden` ao `<div className="relative z-10 flex h-full flex-col gap-[inherit]">`.

## 3. Corrigir ComunicadosCard (usa bento-hover-border, não CARD)

- [x] 3.1 Remover `overflow-hidden` da div raiz do `ComunicadosCard` (L752 aproximadamente): `bento-hover-border relative flex h-full flex-col overflow-hidden ...` → remover `overflow-hidden`.
- [x] 3.2 Adicionar `overflow-hidden` ao `<div className="relative z-10 flex h-full flex-col overflow-hidden">` que já existe como inner wrapper.

## 4. Validação Visual

- [x] 4.1 Verificar que o GlowingEffect é visível ao mover o mouse sobre cada card no Dashboard (modo desktop).
- [x] 4.2 Confirmar que conteúdo interno (listas, textos, sparklines) não transborda os limites dos cards.
- [x] 4.3 Verificar comportamento em modo escuro e modo claro.
- [x] 4.4 Confirmar que em touchscreen o efeito permanece desativado (via `useTouchOnly`).
