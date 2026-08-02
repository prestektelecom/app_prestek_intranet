## Context

A paleta de accent vive em **dois lugares paralelos**: os objetos JS de
`src/hooks/useBentoTheme.js` (consumidos por `const C = useBentoTheme()` em inline styles)
e as CSS custom properties de `src/index.css` (consumidas por `bg-[var(--accent)]`,
`text-[var(--accent)]`, `ring-[var(--accent)]`). O `index.css` tem **5** blocos de tema
contra 4 objetos JS — `.dark` é o fallback default e não tem objeto correspondente.

Além disso, 382 hex de marca estavam escritos à mão em 33 arquivos, sem passar por token
nem por classe Tailwind.

Este change substitui a tentativa `migrar-accent-azul-teal`, que foi implementada e
rejeitada visualmente.

## Goals / Non-Goals

**Goals:**
- Adotar o laranja `#EC7D23` do logo como accent nos 5 temas, nas duas fontes de cor
- Restaurar a amplitude de luminosidade da rampa `accentDeep → accentDark → accent`
- Eliminar os 382 hex azuis, incluindo a identidade paralela de Login/NotFound
- Separar `warning` do accent

**Non-Goals:**
- Alterar funcionalidade, lógica ou comportamento
- Mudar `success` e `danger` — não colidem com laranja
- Alterar tokens de fundo/estrutura (`bg`, `surface`, `ink`, `line`) — o roxo do Aurora
  e o navy do `ink` permanecem
- Substituir o SVG inventado do Login pelo `Logo.webp` real (mudança de layout, escopo próprio)

## Decisions

### D1 — Laranja do logo, não uma aproximação

**Decisão**: `#EC7D23`, o valor literal extraído dos pixels do logo, e não `#F97316`
(orange-500) nem o `#ff8c00` do `DESIGN.md` legado.

**Rationale**: o `Logo_P.webp` é renderizado cru na Sidebar e no MobileDrawer, sem filtro.
Qualquer aproximação apareceria como duas cores quase-iguais lado a lado, que é pior que
uma diferença assumida.

Nos temas escuros o accent usa `#F97316`/`#FB923C` porque `#EC7D23` sobre `#070B13`
perde presença — mesma lógica de sempre: a mesma tinta rende menos sobre fundo escuro.

---

### D2 — Amplitude da rampa é o que faz o gradiente existir

**Decisão**: `accentDeep` fica 4-5 passos de escala abaixo de `accent`; nos temas escuros
`accentDark` fica **acima** de `accent`, não abaixo.

**Rationale**: foi o erro que matou a tentativa teal. O D3 daquele change pôs
`accentDeep/Dark/accent` em teal-700/600/500 — tons vizinhos — e o hero
(`linear-gradient(120deg, accentDeep, accentDark, accent)` em `ServicesHero.jsx:28`)
virou uma cor chapada. O azul original ia de `#1F5BA8` a `#7AB8F8`.

Luminância relativa da rampa AMOLED:

| | accentDeep | accentDark | accent |
|---|---|---|---|
| teal (rejeitado) | 0.14 | 0.21 | 0.37 |
| laranja | **0.06** | **0.55** | 0.32 |

O `accentDark` mais claro que o `accent` cria um brilho no meio do degradê — é o que o
`#7AB8F8` fazia no azul original.

---

### D3 — `warning` vira amarelo

**Decisão**: `#CA8A04` no claro, `#FACC15` nos escuros. Quebra o Non-Goal "não mexer em
cores semânticas" do change anterior.

**Rationale**: em todos os 4 temas o `warning` era âmbar/laranja (`#D97706`, `#FFB800`,
`#FF6B00`, `#FFD600`). Com azul ou teal o accent era frio e a separação era automática;
com accent laranja, "destaque" e "aviso" passam a competir — pior no Aurora, cujo warning
era `#FF6B00`, laranja literal. Amarelo é tão convencional quanto âmbar para aviso e fica
longe do accent.

`success` (verde) e `danger` (vermelho/rosa) não colidem e ficam.

---

### D4 — Regra dupla no `#4A9EF5`

**Decisão**: `#4A9EF5` em contexto de texto (`text-[...]`, `color:`) vira `#C2410C`;
nos demais contextos vira `#EC7D23`.

**Rationale**: `text-[#4A9EF5]` sobre branco já era 2.8:1 — abaixo de AA. Mapear tudo para
`#EC7D23` (2.8:1) herdaria o defeito; `#C2410C` dá 5.2:1 e passa. A distinção é
mecanicamente detectável, então não custa julgamento caso a caso.

`#EC7D23` sobre branco é **só preenchimento, nunca texto pequeno**.

---

### D5 — Classes `blue-*` categóricas ficam azuis

*(transportado do change teal, ainda válido)*

**Decisão**: as classes Tailwind `blue-*` não migram — exceto as 2 do `CoverageMap.jsx`
(dot de carregamento, anel de foco), que são accent de verdade.

**Rationale**: nesses arquivos o azul é rótulo de categoria, onde a cor codifica *qual
item é*, não *destaque*:

- `InitialsAvatar.PALETTE` — 15 hues; `bg-teal-500` já estava na lista, e `bg-blue-500`
  convive com `sky`, `cyan`, `indigo` sem conflito
- `PlanoComparador.bannerConfig` — `velocidade` (blue→cyan) vs `economia` (emerald→teal),
  exibidos lado a lado
- `Coverage.jsx` — `Rádio` vs `UTP` emerald; `Expansão` vs `Ativo` emerald
- `Dashboard.jsx` — chip "Info" vs "Geral" emerald

Com accent laranja essa coexistência ficou até mais confortável que com teal, que
colidia com os vizinhos emerald.

## Risks / Trade-offs

- **[Risco] Aurora**: laranja `#FB923C` sobre estrutura roxa é par complementar. Pode
  ficar marcante ou berrante — é o primeiro tema a olhar.
- **[Risco] Cyber**: perdeu o néon `#00F2FE`. `#F97316` sobre obsidiana lê como brasa, não
  como néon; muda o caráter do tema. Se ficar apagado, `#FB923C` devolve brilho.
- **[Trade-off] Reverte decisão arquivada**: os changes de jul/2026 removeram laranja de
  propósito. Decisão consciente do usuário.
- **[Pré-existente] `background: C.accent` + `color:'white'`** (~15 ocorrências, 10
  arquivos): com laranja fica 2.8:1 — igual ao azul original, melhor que o teal (2.5:1),
  ainda abaixo de AA. Correção adequada é um token `--accent-ink` por tema, fora deste escopo.

Contrastes verificados: `#EC7D23` sobre `#070B13` = 6.9:1 · branco sobre `#7C2D12` = 9.4:1 ·
branco sobre `#9A3412` = 7.3:1 · `#C2410C` sobre branco = 5.2:1.
