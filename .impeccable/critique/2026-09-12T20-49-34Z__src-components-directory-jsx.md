---
target: src/components/Directory.jsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Directory.jsx"
target_fingerprint: "sha256:cd996c75394fbc79f7c834ae0f0bc17f887816caca0289b6ffaf184018901bfb"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Directory.jsx"
timestamp: 2026-09-12T20-49-34Z
slug: src-components-directory-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons/aria-live counter solid, but hero KPI panel mixes a search-scoped number with two static ones |
| 2 | Match System / Real World | 2 | Raw ALL-CAPS taxonomy chip labels; unsanitized names leak to UI |
| 3 | User Control and Freedom | 3 | Per-filter pills with "×", global "limpar tudo", persisted view toggle |
| 4 | Consistency and Standards | 2 | Two disagreeing "active" counts on the same screen; `C.muted` used as real text recurs a 4th time across the project |
| 5 | Error Prevention | 3 | aria-disabled contact buttons correctly prevent dead clicks |
| 6 | Recognition Rather Than Recall | 3 | Filters are visible chips, not hidden menus |
| 7 | Flexibility and Efficiency | 2 | No sort control; 490 records default to an order that isn't persisted per-filter |
| 8 | Aesthetic and Minimalist Design | 3 | Well-grouped, but a lot of chrome before the first colleague appears |
| 9 | Error Recovery | 3 | ErrorState/AvisoTaxonomia/EmptyState unusually well differentiated |
| 10 | Help and Documentation | 1 | No explanation for "N/D" department or "situação divergente" icon |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict

Data plumbing (situação-from-name-prefix parsing, IXC department merge, per-department contrast table) is genuinely bespoke to Prestek's messy production data. Visual/interaction language (hero+KPI shell, neumorphic card) is shared verbatim with Serviços/Cobertura/TI — coherent, but the most "human" screen in the intranet looks identical to ticketing screens.

## Deterministic Scan (CLI `impeccable detect`)

17 findings, all `design-system-font-size` (advisory), exit 0. 14 real, 3 confirmed false positives (icon-glyph sizing on `material-symbols-outlined` spans in Directory.jsx:377, EmployeeRow.jsx:125, GrupoSecao.jsx:22).

Real: DirectoryHero.jsx kickers/KPI labels (10-17px), DirectoryToolbar.jsx counters/badges (12px), EmployeeRow.jsx name/badges (10-15px), GrupoSecao.jsx header (12px), Directory.jsx footer text (12px) — all below the documented type ramp.

## Browser Evidence — Confirmed False Positives

- **`low-contrast` 1.1:1 "white-on-#f6f9ff"**: detector reads only `backgroundColor`, which is transparent on the hero's `background: <gradient>` (set via shorthand, not `background-color`) — it fell through to the page's light background instead of the actual dark gradient. Verified visually (screenshots) that hero text renders with full contrast in both light and AMOLED.
- **`text-occlusion` on the kicker div/h1 ("100% covered")**: the decorative `aria-hidden` dot-grid SVG (`position:absolute; inset:0; opacity:.22; pointer-events:none`) bounding-boxes the entire hero, so a naive rect-overlap check flags it as fully covering the text beneath — it doesn't account for opacity/pattern sparseness or `pointer-events:none`. Not a real occlusion.
- **`ai-color-palette` "Cyan neon text on dark background"** (~15 hits, AMOLED only): no cyan color exists anywhere in this surface's source (`grep` confirms the only "cyan" is a code comment about a token *removed* in a previous refactor). Heuristic is misfiring on the AMOLED theme's orange accent on near-black.
- **`em-dash-overuse`**: counting "—" used as the deliberate missing-data placeholder (ramal/email fallback), not prose em-dashes.

## Priority Issues (both assessments combined)

**[P1] Two disagreeing "active" counts on the same screen** — hero KPI "Ativos 170" (raw `ativo` flag) vs. situação chip "Ativo 163" (name-prefix derived); the code already documents named examples of the conflict but only reconciled the chip, not the KPI. Also: only "Departamentos" reacts to search; "Colaboradores"/"Ativos" stay frozen.

**[P1] Default order surfaces inactive/departed people first** — unfiltered first load shows Inativo, Afastado, Afastado before any Ativo person, on a screen whose stated job is "find a colleague."

**[P1] `C.muted` used as real text color, 4th recurrence of a flagged transversal antipattern** — `GrupoSecao.jsx` h3 group header, `DirectoryStates.jsx` body paragraphs (13px), `DirectoryToolbar.jsx` counter/popover text (176/301/313) — measured 2.8:1, same bug already fixed in chrome/Dashboard/ResponsiveTable and still logged for a Fase 16 global sweep.

**[P1] 14 real type-ramp violations** — kickers/KPI labels/counters/badges below the documented sizes (DESIGN.md ramp), confirmed by both the deterministic CLI scan and live browser evidence.

**[P2] "Sem contato cadastrado" printed beside a working WhatsApp button** — `EmployeeCard.jsx` derives the "no contact" string from `ramal || email` but derives the WhatsApp button from `fone_celular` independently; a card can show both at once.

**[P2] Heading hierarchy skips h2** — h1 → h3 everywhere (cards, group headers), no h2, found independently by both assessments.

**[P3] Unsanitized production data on page one** — ") Andreliane Santos de Jesus", "Alaine Silva dos Santos2" (malformed prefix regex / dedup suffix leak).

## Persona Red Flags

- **Alex**: no sort control; situação filter isn't persisted like the grid/list toggle is; "N/D" (158/490 people) unexplained.
- **Sam**: flat heading structure breaks heading-nav; "situação divergente" icon gives no actionable next step; conflicting KPI numbers read with equal authority by screen readers.
- **Riley**: reproduced the name-parsing leaks and the KPI/chip disagreement without deliberately trying.

## Minor Observations

- Department chip labels are raw ALL-CAPS backend strings next to sentence-case hero copy.
- AMOLED nearly erases the card's neumorphic "relevo" depth cue (near-black face on near-black background).
- Hero search placeholder clips mid-word at 360px (same pattern already flagged in the Comunicados audit).
