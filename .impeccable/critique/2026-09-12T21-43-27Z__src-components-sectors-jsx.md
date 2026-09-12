---
target: src/components/Sectors.jsx
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 5
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Sectors.jsx"
target_fingerprint: "sha256:086aaa9411b3a33d5f6c5c53372b0d059a074a1a24d17ac000ecbcd2a33912bb"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Sectors.jsx"
timestamp: 2026-09-12T21-43-27Z
slug: src-components-sectors-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons, aria-live counter, save spinner solid; OrgChartEditor's Save/Restaurar give no success confirmation |
| 2 | Match System / Real World | 2 | Raw status leaks: "(INATIVO) AUDITORIA DE CONTRATOS", "(AFASTADO) JOYCE...", literal "?" as manager name |
| 3 | User Control and Freedom | 3 | Inline edit has Cancel, search has clear; editor has no undo beyond destructive full reset |
| 4 | Consistency and Standards | 1 | OrgChartEditor abandons the shared modal/token system entirely — different visual language from every other dialog in the app |
| 5 | Error Prevention | 1 | JSON import accepts any parsed object with zero shape validation; malformed data crashes the live chart on save |
| 6 | Recognition Rather Than Recall | 3 | Icons carry aria-label+title, toolbar fully labeled, toggle states visible |
| 7 | Flexibility and Efficiency | 2 | Sort has only 2 options, no "sem responsável" quick filter despite it being a named hero KPI |
| 8 | Aesthetic and Minimalist Design | 3 | Browsing surface clean; undercut by editor's visual noise and raw data artifacts bleeding into cards |
| 9 | Error Recovery | 2 | ErrorState/inline card-save errors excellent; importJson's failure path is a bare native alert() |
| 10 | Help and Documentation | 2 | Nothing beyond a one-line subtitle; JSON tab gets zero guidance on expected shape |
| **Total** | | **22/40** | **Aceitável** |

## Design Specificity Verdict

Split verdict. The browsing half (Hero/Toolbar/Card/Row/read-only OrgChart) is genuinely authored for Prestek — `useDeptColor` gives each sector a measured, contrast-tested categorical color, and `ComposicaoGrupos` shows real handling of messy IXC data. The editing half (`OrgChartEditor.jsx`) is a generic CRUD form in raw inline styles with zero connection to the design system — could be dropped into any unrelated admin tool unchanged.

## Deterministic Scan (CLI `impeccable detect`)

19 findings, all `design-system-font-size` (advisory), exit 0. 4 confirmed icon-glyph false positives. 5 confirmed shared-pattern false positives (SectorsHero's kicker/KPI/subtitle match TiHero/CoverageHero/DirectoryHero verbatim; SectorsStates' 15px headline matches DirectoryStates). **10 real, local, actionable findings** in OrgChart.jsx (2), SectorCard.jsx (5), SectorRow.jsx (2), SectorsToolbar.jsx (1).

## Browser Evidence — False Positives Confirmed Analytically

- **`low-contrast` on hero/CEO-node text (dark AMOLED)**: detector samples `backgroundColor` (transparent, since the real background is `background: <gradient>`). Projected each flagged text's actual position on the gradient and computed real contrast: 5.18–5.77:1, all passing. Confirmed false positive by direct calculation, not fragile screenshot evidence.
- **Icon-glyph and shared hero/state font sizes**: see CLI section above.

## Genuine Findings (Not Dismissed)

- **`ai-color-palette` "cyan neon on dark"** (81 occurrences): measured colors are real sky-300/teal-300, not orange. Root cause: `deptColors.js`'s TI/NOC department uses `tintaEscura: '#7DD3FC'` (literal sky-300) — a deliberate, contrast-tested categorical color already vetted in Fase 6, not AI-slop. Judged a false positive of design *intent*, not of color detection — flagging for awareness, not a fix.
- **`C.muted`/`#8896A8` as real text, systemic**: "Responsável"/"Equipe"/"Composição" labels, org-chart micro-labels ("Caroline"/"Erika"/"Roberta"), "Editar" control text — all ≈2.85–3.0:1 in light theme. 5th+ recurrence of the project's most-repeated antipattern.
- **Marca-tone as text, 2 instances**: `OrgChartEditor.jsx`'s "Exportar JSON"/"Salvar alterações" buttons use `color:'white'` on `C.accent` (should be `C.onAccent`, ~2.8:1 measured); `SectorsToolbar.jsx`'s active Cards/Lista toggle uses `text-[var(--accent)]` on `bg-[var(--accent-soft)]` (2.6:1) — same bug pattern already fixed in `DirectoryToolbar.jsx`'s equivalent toggle during Fase 6, but Sectors wasn't touched then.

## Priority Issues

**[P0] `OrgChartEditor` has no dialog semantics or focus management, on the highest-stakes admin action in this surface** — confirmed independently by both assessments: no `role="dialog"`, no `aria-modal`, Escape does not close it, focus never moves into it on open, Shift+Tab escapes the trap entirely. Worse than the equivalent bugs already fixed in Fase 4 (Plantão) and Fase 5 (Comunicados), and this one guards the ability to overwrite the company's entire org chart.

**[P0/P1] The org chart's CEO (root) node is off-screen by default on mobile** — at 360px, `scrollWidth:1148` vs `clientWidth:248`; the CEO card sits at ~x452–692, entirely outside the visible window at default scroll position. The one thing an org chart exists to answer requires scrolling right first, with no affordance hinting the root itself (not just "more areas") is off-screen.

**[P1] `C.muted` used as real text, 5th+ recurrence of the project's most-repeated antipattern** — systemic across "Responsável"/"Equipe"/"Composição" labels and org-chart micro-labels, ≈2.85–3.0:1 in light theme.

**[P1] Marca-tone used directly as small text, 2 instances** — `OrgChartEditor`'s two primary buttons (`color:'white'` instead of `C.onAccent`) and `SectorsToolbar`'s active view-toggle pill (`text-[var(--accent)]` on `accent-soft`, 2.6:1) — the exact bug already fixed in `DirectoryToolbar.jsx` last phase, recurring here because Sectors wasn't touched then.

**[P1] Touch targets fail widely** — Cards/Lista toggle (36px), 29× per-card "Editar descrição" icon buttons (26×26px), "Ver mais" toggle (67×18px), `OrgChartEditor` close ✕ (24×24px), `OrgChartEditor`'s Restaurar/Cancelar/Salvar buttons (40–42px) — all below the 44px project minimum, confirmed in both themes.

**[P1] Inactive/on-leave status has no model — leaks as raw bracketed text with full visual authority** — "(INATIVO) AUDITORIA DE CONTRATOS" sorts alphabetically first in the entire directory and renders with identical card treatment to live sectors; "(AFASTADO) JOYCE DE MELO OLIVEIRA" reads as an ordinary "Responsável" name. Colaboradores already solved this exact class of problem in Fase 6; Sectors has no equivalent.

**[P1] 10 real type-ramp violations**, local (not part of the shared hero/states family): `OrgChart.jsx` (kicker 10px, root name 17px), `SectorCard.jsx` (h3 19px, "Ver mais" 12px, 3× 10px labels), `SectorRow.jsx` (name 15px, count 12px), `SectorsToolbar.jsx` (count 12px).

**[P2] `importJson`'s error path is a bare native `alert()`** — the exact anti-pattern banned since Fase 2 (Login), sitting two files away from a correctly-done inline `role="alert"` on `SectorCard`'s own save failure.

**[P2] Focus-visible missing** on "Editar descrição" icon buttons and the "Ver mais" toggle (transparent outline, no box-shadow ring), in both themes.

**[P2] Org-chart nodes have a decorative hover affordance (`hover:-translate-y-[3px]`) implying interactivity they don't have** — `cursor:auto`, no `role`, no `tabindex`.

## Persona Red Flags

- **Sam**: OrgChartEditor never announces as a dialog to a screen reader (focus doesn't move, no role/aria-modal); `SectorRow`'s disabled call button is an `<a>` with `aria-disabled` and no `href` — VoiceOver announces it as a plain link, not disabled.
- **Riley**: JSON import has zero schema validation (`draft.areas.map(...)` throws on a malformed structure) — the shipped "?" manager name proves this class of bug already happens in production; the AUDITORIA DE CONTRATOS dead-data card (0 team members, mismatched generic icon) is the directory's very first card by alphabetical sort.
- **Alex**: reaching the JSON batch-edit tab takes 3 clicks with no shortcut; "Restaurar padrão" is a native unstyled `confirm()` that wipes all customization at once; sort has no "sem responsável primeiro" despite that being a named hero KPI.

## Minor Observations

- "RECURSOS HUMANOS" and "RECURSOS HUMANOS (RH)" appear as separate directory entries — likely an IXC data-quality duplicate the UI does nothing to flag.
- `podeExpandir` gates "Ver mais" on a raw 90-character count that doesn't account for actual wrap width at different grid columns.
- Sort `<select>`'s label is `sr-only` — no visible cue for sighted users that the control is for sorting.
- `ICON_MAP` silently falls back to generic icons for unrecognized sector names ("AUDITORIA DE CONTRATOS", "DEVOLUÇÃO DE EQUIPAMENTOS").
