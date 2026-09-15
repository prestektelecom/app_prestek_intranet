---
target: aba TI (Ti.jsx + src/components/ti/**) — Assessment A (LLM design review)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Ti.jsx"
target_fingerprint: "sha256:73aa2e4b6b96496ca4754b63826b011565131d8cc0b99b0585719a0106d619a9"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Ti.jsx"
timestamp: 2026-09-14T23-39-36Z
slug: src-components-ti-jsx
---
# Assessment A — Design Review: aba TI (`src/components/Ti.jsx` + `src/components/ti/**`)

Scope: hub shell (`Ti.jsx`, `TiHero.jsx`, `registry.js`) and the single registered tool
"Cadastro de Colaborador" (`CadastroColaborador.jsx` + `ti/cadastro/*`).
Method for this half: source reading + live browser inspection (own tab, admin session,
light + AMOLED, 390/1024/1440, keyboard, empty-form dry-run). No real personal data used.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | "Etapa 1 de 3 · Ficha" never advances — still reads step 1 after the simulation runs. Toast is not a live region. Resumo says 6 errors while the dry-run says 5. |
| 2 | Match System / Real World | 2 | "Deixe em branco para usar o padrão do .env" ships server config vocabulary to an HR operator; taxonomias/payload/dry-run leak throughout. |
| 3 | User Control and Freedom | 2 | No reset, no undo of a PDF autofill, no cancel of an in-flight simulation; leaving the view destroys 38 fields with no warning. |
| 4 | Consistency and Standards | 2 | 33 inputs and no `<form>`; validation errors styled exactly like helper text; accent-on-accent-soft tray repeats a bug already fixed in `SectorsToolbar`; log/toast/upload states use raw emerald/red/amber instead of tokens. |
| 5 | Error Prevention | 2 | The dry-run itself is excellent prevention, but 4 required fields ship pre-answered "N" (incl. "Possui deficiência") and count as "preenchidos"; no `required` attributes anywhere. |
| 6 | Recognition Rather Than Recall | 3 | Strong: labelled sections, per-field confidence badges, cargo/CBO hint, raw ficha text retained, dry-run errors scroll to their field. |
| 7 | Flexibility and Efficiency | 2 | PDF autofill is a real accelerator, but no `<form>` (no Enter to submit), no shortcuts, no draft, no section jump on a 3.3k–5k px page. |
| 8 | Aesthetic and Minimalist Design | 3 | Handsome and coherent; costs are a one-item "tab bar", a 464px hero at 390px, and KPIs that are trivia. |
| 9 | Error Recovery | 2 | Dry-run enumerates every problem with click-to-field links (excellent) — undercut by errors rendered in muted gray at 3.01:1, no `aria-invalid`/`aria-describedby`, and raw `e.message` surfaced in the toast. |
| 10 | Help and Documentation | 3 | The derived-taxonomy advisory and the triple dry-run reassurance are model documentation; nothing explains what happens after a clean simulation. |
| **Total** | | **23/40** | **Acceptable (58%)** |

## Design Specificity Verdict

Authored for this product, not category-interchangeable. The dry-run contract
(hero seal → button caption → persistent footer on the result), the derived-taxonomy
advisory, and per-field extraction confidence are all specific answers to specific
problems of this IXC integration. The hero/section/card anatomy deliberately quotes
CoverageHero and Configuracoes so the screen reads as the same product.

Where it becomes generic is the middle: once past the dropzone it is a
38-field vertical form with no sequencing, no field prioritisation, and a
side panel that scrolls away — the part the "Etapa 1 de 3" label promises to
have solved and hasn't.

## Overall Impression

This is the most honest screen in the program so far — it goes out of its way to
tell the operator what it does not know and what it will not do. That integrity is
the product. The failure is that the honesty stops at the end: a clean simulation
leads nowhere, and the UI never admits that creation is a 501 stub.

Biggest opportunity: make the three steps the hero already claims real
(Ficha → Revisão → Simulação), which simultaneously fixes cognitive load,
the buried primary action, and the lying stepper.

## What's Working

1. **The dry-run contract is reassuring at all three moments that matter.** The hero
   seal ("MODO SIMULAÇÃO — NADA É GRAVADO NO IXC") lands before typing; the caption
   under the button explains that the IXC *is* queried for duplicates but never
   written; the result card carries a permanent amber footer. Three independent
   reassurances, each at the moment the doubt actually occurs. Verified live.

2. **The derived-taxonomy advisory.** "Funções, Grupos de usuário, Contas contábeis
   não têm cadastro acessível pela API do IXC… um valor válido pode não aparecer aqui
   se ninguém o estiver usando hoje." Most products render the dropdown and say
   nothing. This tells the operator the list is inferred *and why*, which is the
   difference between a wrong pick and an informed one.

3. **Extraction uncertainty is surfaced per field, not hidden.** Amber ring +
   "confira" badge below 0.75 confidence, an explicit warning below 0.35, and an
   "editado" badge once the human overrides. OCR doubt becomes a review task instead
   of silent bad data.

## Priority Issues

### [P1] Field labels, validation errors and help text all sit at 3.01:1 in the light theme
**What**: `ROTULO` (every one of ~38 field labels, 10px uppercase mono), `HINT` (every
inline validation message), section subtitles and the Resumo panel all resolve to
`text-muted` = `#8896A8`, measured at **3.01:1** against the light surface. The dropzone
helper measures 2.85:1. In AMOLED the same token is `#888888` and passes at 5.28:1 —
so this is a **light-theme-specific** failure, the same inversion documented in Fase 13.
Compounding it: errors use `HINT`, so "Campo obrigatório." is rendered in the *same
gray as helper text* — there is no error colour at all, only a faint red ring.
**Why it matters**: the lowest-contrast text on a data-entry form is the text that says
what each field means and what went wrong. An operator transcribing a paper ficha reads
those labels ~38 times per employee.
**Fix**: `ROTULO` → `text-faint` (verify AMOLED, per the Fase 12 lesson); give `HINT` an
error variant in the danger token rather than reusing the muted helper style.
**Suggested command**: `/impeccable colorize`

### [P1] Five required-ish controls have no accessible name; the form has no ARIA wiring at all
**What**: measured live — `CampoForm` renders `<label htmlFor="campo-X">` for every field,
but the `segmentado` type renders no element carrying that id. Result: **5 orphan labels**
(`possui_deficiencia`, `criar_usuario`, `envia_email_os`, `envia_sms_os`,
`ferias_colaborador`), four of them required. A screen-reader user meets a bare
"Sim"/"Não" pair with no context; clicking the label does nothing. Separately: **0 of 33
inputs** carry `required`/`aria-required`, `aria-invalid` or `aria-describedby`, the
required asterisk is `aria-hidden`, and there are **zero live regions** — the toast
announcing the result of the primary action is announced to nobody.
**Why it matters**: "Possui deficiência" is an unlabelled control whose answer lands in an
HR record. Required-ness and every error message are invisible to assistive tech.
**Fix**: give `Segmentado` a `role="radiogroup"` + `aria-labelledby` pointing at the label
(or render the label as a `<span id>` and drop `htmlFor`); add `aria-required`,
`aria-invalid`, `aria-describedby` → error `<p id>`; put `role="alert"` on the toast.
**Suggested command**: `/impeccable harden`

### [P1] The stepper is decorative and the journey has no ending
**What**: the hero reads "Etapa 1 de 3 · Ficha" — hardcoded in a `useEffect` and never
updated. Verified live: after running the simulation it *still* reads "Etapa 1 de 3".
There is also no step 3: no "Criar no IXC" control exists, because the create route is a
deliberate 501 stub — and the UI never says so. The hero instead says "conferido antes de
gravar", implying a gravar that isn't there.
**Why it matters**: peak-end rule. The peak (the dry-run result card) is excellent; the
*end* is a green banner followed by a dead end and a step counter that says you are still
at the beginning. That is what the operator will remember.
**Fix**: either drive the etapa from real state, or replace it with an honest status; and
state plainly that creation is not yet implemented — the same honesty already applied to
derived taxonomies, and the pattern already established for Processos in Fase 12.
**Suggested command**: `/impeccable clarify`

### [P1] Below `xl` the primary action and all live feedback fall 3–6 screens below the fold
**What**: the layout correctly stacks at `xl` (1280) as the design doc specifies — but the
stacked order puts `PainelLateral` *after* all six field sections. Measured: at **1024px**
the "Simular cadastro" button sits at y=3051 of a 3289px page (**3.4 screens down**); at
**390px**, y=4758 of 5012px (**5.6 screens down**). The live "Erros de validação" counter
goes with it, so the feedback loop is detached from the work. Touch targets on the same
axis: 10 segmented Sim/Não buttons at **30px**, tool tray **36px**, "Simular cadastro"
**40px** — all below the project's 44px floor (`AGENTS.md` §5).
**Why it matters**: on a tablet or phone the operator fills 38 fields with no running
feedback, then hunts for the action. Casey never finds it.
**Fix**: below `xl`, hoist the Resumo above the sections or pin the primary action to a
sticky footer bar; raise the three control classes to 44px.
**Suggested command**: `/impeccable layout`

### [P2] Defaults masquerade as answers, and two error counts contradict each other
**What**: `VALOR_INICIAL` pre-sets four required segmented fields to `'N'` — including
"Possui deficiência". The Resumo and hero then count them: a pristine form reports
**"Obrigatórios preenchidos: 4 de 10"** before the operator types anything (verified live).
The operator can ship `envia_email_os = N` having never decided it. This is the
"formulário assume o valor mais comum como se fosse verificado" antipattern already
catalogued in Fase 9 (`OverrideModal`) and Fase 13 (`filialName`). Separately, after a
dry-run the Resumo says "Erros de validação: **6**" while the result card 30px below says
"Simulação: **5** erro(s)" — client and server counts differ with no explanation of which
is authoritative.
**Why it matters**: the progress KPI overstates readiness, and a disability field is
answered by the software rather than by a human.
**Fix**: initialise segmented required fields as unset with a visible "ainda não definido"
state and a `tocado` flag (the Fase 9 remedy); count only touched fields. Label the two
counters distinctly ("erros no formulário" vs "erros apurados na simulação").
**Suggested command**: `/impeccable clarify`

## Persona Red Flags

**Sam (Accessibility-Dependent)**: Five unlabelled Sim/Não controls, four required, one of
them "Possui deficiência" — reached by keyboard with no announced name. No `aria-required`
on any of 33 inputs, so required-ness is conveyed only by an `aria-hidden` red asterisk.
Error messages are `<p>`s with no `aria-describedby`, so they are never read. No live
region: the toast announcing whether the simulation passed is silent. Field labels at
3.01:1 in light. Genuine credit: the focus ring is a clean 2px accent on every input and
the dry-run error links move focus to the offending field.

**Alex (Power User)**: 33 inputs and **no `<form>` element** — Enter never submits, so the
primary action is mouse-or-tab-to-the-bottom only. No keyboard shortcut for "Simular".
No draft/autosave: switching to another view unmounts everything and 38 fields are gone
with no warning. No section jump on a 3289px page. Re-selecting the *same* PDF after a
failed parse silently does nothing (the file input's value is never reset), so the retry
gesture appears broken.

**Riley (Stress Tester)**: Dropping a PDF a few pixels outside the dropzone makes the
browser navigate away from the page and take the filled form with it (no global
drag/drop guard). `handleDragLeave` fires when crossing child elements, so the "Solte para
processar" state flickers. The "Página X · Y%" OCR progress readout can never appear —
`progressoOCR` is only ever set to `null`, and the `ocr` entry in `ESTADOS` is unreachable.
On a network failure the toast prints the raw exception text.

## Minor Observations

- The tool tray renders a tab bar for exactly one tool. Defensible as a growth signal, but
  `aria-current="page"` is wrong for a tool switcher that changes no page.
- Heading jump h1 → h3 with no h2 (9 headings) — the project-wide pattern already in Pendências.
- Toast colours are hardcoded `emerald-500/90` and `red-500/90` with white text
  (computed ≈2.5:1 and ≈4.0:1 for 16px bold) instead of the DESIGN.md Badge Pair tokens.
- Log level colours (`text-emerald-600`, `text-red-600`) carry no dark variant; the success
  line measures 3.77:1 in AMOLED.
- Hero KPIs "Filiais 20" and "Contas de folha 36 de 105" are ambient trivia the operator
  never acts on; "Gravação: simulação" restates the seal 200px above it.
- The log panel has no clear or copy action and silently caps at 200 entries.
- `Documentos` holds 11 fields in one group — the largest chunk on the screen.

## Verified Non-Issues (checked before claiming)

- **Tailwind `dark:` variants do fire in AMOLED.** `darkMode: "class"` plus theme classes
  named `.dark-amoled` looked like a trap, but the root element carries **both**
  `dark dark-amoled`, so `AVISO_AMBAR`/`AVISO_ERRO`/`DryRunResultado` dark variants work.
  Confirmed live.
- **The dropzone is not a keyboard trap.** It has no `role`/`tabindex`, but the
  "Escolher arquivo" button gives a complete keyboard path to the same action.
- **Residual browser state**: a CPF value and a mid-session theme flip observed during
  testing came from a concurrent agent sharing this browser, not from the app.

## Cognitive Load

5 of 8 checklist items fail → **high load (critical)**.
Fails: single focus (upload + 38 fields + panel + log compete); chunking (sections of 11,
8, 7 fields vs the ≤4 rule); one-thing-at-a-time (no sequencing despite the "Etapa 1 de 3"
promise); minimal choices (38 simultaneous fields; the Conta contábil select draws on 105
entries); progressive disclosure (only `senha` is conditional).
Passes: grouping (sections are genuinely well grouped), visual hierarchy, working memory
(raw ficha text stays available and dry-run errors link back to their fields).

## Emotional Journey (peak-end)

Confident open — the hero and the simulation seal earn trust in the first two seconds.
Immediate valley: the Resumo greets a pristine form with "Erros de validação: 6" in red
before a single keystroke. Intended peak: dropping a PDF and watching fields fill
themselves with confidence badges — genuinely delightful. Long valley: the 38-field wall
with the faintest labels on screen and the action 3–6 screens away. Real peak: the dry-run
result card, enumerated and click-to-field. Then the end — nothing. A clean simulation
produces a green banner, a still-frozen "Etapa 1 de 3", and no way forward, because step 3
does not exist and the UI never says so. The strongest moment is followed by the emptiest.

## Questions to Consider

1. The hero already promises "Etapa 1 de 3". What if it were true — Ficha (upload + the
   ~10 fields the PDF actually fills), Revisão (only low-confidence and required-empty
   fields), Simulação (the result card)? That single change would fix the lying stepper,
   the buried primary action, and four of the five cognitive-load failures at once.
2. This tool is unusually honest about what it doesn't know (derived taxonomies, OCR
   confidence, "nada é gravado"). Why does that honesty stop at the one thing the operator
   most needs to know — that creating the employee isn't built yet?
3. If the operator's real job is "make the paper ficha become an IXC record", why does the
   interface make them read 38 labels instead of showing the ficha and the extraction
   side by side, and asking only about the fields the parser was unsure of?
