---
target: "TI screen (Ti.jsx + ti/) — Assessment B: detector + browser evidence"
total_score: 0
max_score: 0
na_heuristics: 
p0_count: 2
p1_count: 5
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Ti.jsx"
target_fingerprint: "sha256:73aa2e4b6b96496ca4754b63826b011565131d8cc0b99b0585719a0106d619a9"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Ti.jsx"
timestamp: 2026-09-14T23-44-48Z
slug: src-components-ti-jsx
---
# Assessment B — Detector + Browser Evidence: TI screen (`src/components/Ti.jsx` + `src/components/ti/`)

Role: deterministic-detector + live-browser-evidence half of a dual-agent critique. Isolated from Assessment A.
Target: TI hub shell + "Cadastro de Colaborador" tool (PDF ficha -> IXC payload, dry-run only; `/criar` is a deliberate 501 stub).
Browser: own new Playwright tab (index 3), admin session (`marciofelix@prestek.com.br`, `is_admin: true`).

## 1. CLI detector

```
.claude/skills/impeccable/scripts/impeccable detect --json src/components/Ti.jsx src/components/ti/
exit 0  (clean — zero primary findings)
22 findings, ALL severity "advisory", ALL one rule: design-system-font-size
```

Per-file: Ti.jsx 1 · TiHero.jsx 5 · CadastroColaborador.jsx 2 · CampoForm.jsx 4 · UploadFicha.jsx 4 · DryRunResultado.jsx 2 · PainelLateral.jsx 2 · SecaoForm.jsx 1 · estilos.js 1.

**The detector is near-blind on this target and its exit 0 must not be read as "clean".** It found zero contrast, touch-target, or a11y issues that the live pass proved exist in quantity. Two reasons, both verified:
- `TiHero.jsx` styles through the JS hook (`useBentoTheme()` + `tone()`) in inline `style={{}}` objects — no static string for a regex to read (the known `Configuracoes.jsx` blind spot).
- Everything else styles through Tailwind CSS *variables* (`text-[var(--accent)]`, `text-muted`), so the literal colour never appears in source; it only resolves in the browser.

Of the 22 advisories, ~9 are the catalogued **icon-glyph font-size false positive** (`material-symbols-outlined text-[16px]/[17px]/[18px]` — glyph sizing, not text): Ti.jsx:98, UploadFicha 125/139/148/155, CampoForm 116/131, SecaoForm 14, PainelLateral 39/49. The remaining ~13 are real 9-11px text sizes, but see §5 for which are local and which are a shared idiom.

## 2. Live overlay (detect.js via `impeccable live-server`, port 8400)

Mutable injection preflighted (title set + `<script>` appended) and succeeded; overlay injected, console read, server stopped and port 8400 confirmed closed.

| Rule | Count | Verdict |
|---|---|---|
| undersized-ui-text | 50 | Real, but split local vs. transversal (§5) |
| low-contrast | 32 | **Real** — matches my independent measurements exactly |
| nested-cards | 4 | False positive — CARD wrapping section cards is the intended anatomy |
| all-caps-body | 2 | Design idiom (mono uppercase labels); real only in combination with 10px |
| layout-transition | 2 | Out of scope — sidebar `transition: width` (chrome) |
| skipped-heading | 1 | **Real** — h1 -> h3, no h2 (confirmed in a11y snapshot) |
| kicker-above-heading | 1 | False positive — shared hero idiom across 12 screens |
| overused-font | 1 | False positive — Plus Jakarta Sans is the brand font |

The overlay caught one thing both the CLI and my own first sweep missed: `low-contrast 2.8:1 — #ffffff on #ec7d23`, which is the **primary action button** (see P1-a). The CLI cannot see it because the colour lives in `background-image` (a gradient), not `backgroundColor`.

## 3. Contrast — measured live, WCAG relative luminance, translucent tokens composited against nearest opaque ancestor

Same elements, same script, both themes. **Light fails across the board; AMOLED passes across the board** — the catalogued "passes in one theme, fails in the other" trap, here in its purest form yet.

| Element | Light | AMOLED | Needs |
|---|---|---|---|
| Tool-tray active pill `Ti.jsx:94` (13px/700) | **2.63:1** | 5.00:1 | 4.5 |
| Segmented active button `CampoForm.jsx:18` (12px/700, x5 fields) | **2.63:1** | 5.00:1 | 4.5 |
| Field label ROTULO (10px/600, x37 labels) | **3.01:1** | 5.28:1 | 4.5 |
| Section subtitle | **3.01:1** | 5.28:1 | 4.5 |
| Side-panel paragraphs (`Obrigatórios`, `Erros`) | **3.01:1** | 5.28:1 | 4.5 |
| **Field validation ERROR message** | **3.01:1** | 5.28:1 | 4.5 |
| Upload dropzone hint | **2.85:1** | 5.92:1 | 4.5 |
| Section icon glyph on accent-soft chip | 2.63:1 | 5.46:1 | 3 (decorative, aria-hidden — P3) |
| AVISO AMBAR (derived-lists warning) | 8.75:1 | 16.02:1 | PASS both |
| Dry-run header / error items / footer | 5.68 / 4.83 / 6.55 | — | PASS |

Light-theme values: `--accent` `#EC7D23` on `--accent-soft` `#FFF7ED`; `--foreground-muted` `#8896A8` on `#FFFFFF`/`#F5F9FF`.
AMOLED values: `--accent` `rgb(249,115,22)` on composited `rgb(59,39,25)`; muted `#888888` on `#121212`.

Theme-independent failures (hardcoded hex, no dark variant — fail in all five themes):
- **Primary button "Simular cadastro"** (`BTN_PRIMARIO`, `estilos.js:21`): white 14px/600 on `linear-gradient(to right, #9A3412, #EC7D23)` — **7.31:1 at the left edge decaying to 2.79:1 at the right edge**, mid-point 4.42:1. The label is centred, so its trailing half sits below AA.
- **Toast** (`CadastroColaborador.jsx:277`): white 16px/700 on `rgba(239,68,68,0.9)` composited to `rgb(240,86,87)` = **3.41:1**.

Checked and cleared (not a bug): I suspected the `dark:` variants in `estilos.js` would never fire on `dark-cyber`/`dark-aurora`/`dark-amoled` given `darkMode: "class"`. `ThemeContext.tsx:31-32` always adds `dark` *and* the variant class, so they do fire. Hypothesis disproved.

## 4. Touch targets — `getBoundingClientRect` + pseudo-element check

Desktop 1440x900: **46 of 47** interactive elements in `<main>` are under 44px.
Mobile 390x844: **51 of 51**.

Every one reported `no-::after` — **none of these use the pseudo-element expansion technique**, so the catalogued "false FAIL on expanded hit area" exemption does not apply here. These are genuinely small. Measured heights: segmented Sim/Não buttons **30px**; tool-tray pill **35.5px**; all `<select>` **36px**; text inputs **37.5px**; date inputs **39.5px**; "Escolher arquivo" 42px; "Simular cadastro" 40px.

## 5. Typography — local vs. transversal (per the documented "grep before normalising" rule)

- **Hero 10px** (`LABEL_MONO`, `tracking-[0.14em]`): shared byte-for-byte across **12 files** (`CoverageHero`, `ServicesHero`, `DirectoryHero`, `SectorsHero`, `Comunicados`, `Offices`, `Processos`, `Schedule`, `OrgChart`, `PlanoComparador`, `TiHero`, `DryRunResultado`). **Transversal — Phase 16, do not fix locally.**
- **Field label 10px** (`ROTULO`, `tracking-[0.12em]`): also shared — identical string in `coverage/OverrideModal.jsx:9` and `coverage/CoverageFilters.jsx:11`. **The 10px size is a shared idiom; the `text-muted` colour failing 3.01:1 is the locally fixable half.** Fix the colour, leave the size to Phase 16.
- `9px` "editado" badge (`CampoForm.jsx:113`) is local and genuinely below the 11px floor.

## 6. Accessibility — measured in the DOM

| Check | Result |
|---|---|
| Fields with `label[for]` resolving to a real element | 32/33 — **good** |
| **Orphan `label[for]` pointing at a non-existent id** | **5** |
| Fields with `required` / `aria-required` | **0 of 33** (10 are required) |
| Fields with `aria-invalid` | **0** |
| Error messages with `aria-describedby` linkage | **0** |
| Live regions (`aria-live` / `role=alert` / `role=status`) in `<main>` | **0** |

**The 5 orphan labels are all the `Segmentado` fields** — `CampoForm.jsx:109` renders `<label htmlFor={id}>` but `Segmentado` never receives that `id`:
`campo-possui_deficiencia`, `campo-criar_usuario`, `campo-envia_email_os`, `campo-envia_sms_os`, `campo-ferias_colaborador` (four of the five are required).
Their 10 Sim/Não buttons carry no `aria-label`. A screen-reader user hears five identical unlabelled "Sim / Não" pairs with no indication of which question is being answered — including **"Criar usuário do sistema"**, the toggle that decides whether a system login is created.

Required-ness is conveyed *only* by a red `*` that is explicitly `aria-hidden="true"` (`CampoForm.jsx:111`), so it reaches nobody using AT.

**Validation error styling** (verified by typing an invalid CPF and tabbing out): the message "CPF com dígito verificador inválido." renders through `HINT = 'mt-1 text-xs text-muted'` — the *same* class as a neutral hint. It is grey, not red; has no `role`, no `id`, no `aria-describedby` link; the field gets no `aria-invalid`. The only error-specific signal is a red ring measuring 3.14:1 against the field background. Error state is therefore conveyed essentially by colour alone, to sighted users only.

## 7. Keyboard — walked live

- Tab order matches visual order (DOM order); no traps found in the form body.
- Text inputs / selects / buttons have a real focus ring (`focus:ring-2 focus:ring-[var(--accent)]`) — **good**.
- **`CidadeCombobox` is the weak point.** Measured:
  - `ArrowDown` does nothing (focus stays in the input, no `aria-activedescendant`).
  - **`Escape` does not close the list** — the popup is `absolute z-20` over the following fields and the only dismissal is a mouse `mousedown` outside.
  - Tab *does* reach the option, but its focus indicator is `focus:outline-none` + `focus:bg-surface-raised` = `rgb(247,250,253)` on `rgb(255,255,255)` = **1.048:1**, versus the 3:1 that WCAG 2.2 SC 2.4.11 wants. Effectively invisible.
  - ARIA is malformed: the input has `aria-expanded`/`aria-haspopup="listbox"` but **no `role="combobox"`**; the `ul[role=listbox]`'s direct children are `<li>` with no role (the `role="option"` sits on a nested `<button>`), breaking listbox/option ownership; options have no ids.
- Dropzone: not focusable and has **no click handler at all** — the large dashed area is inert; only the "Escolher arquivo" button works. Keyboard path exists (good), but the dropzone's primary affordance is a lie to mouse users.

## 8. Pre-interaction state — fresh load, zero interaction

- Side panel shows **"Erros de validação: 6"** in red `rgb(220,38,38)` **before the operator types anything**. (Inline field errors are correctly gated on `touched` — only this aggregate leaks.)
- Hero KPI and panel show **"Obrigatórios preenchidos: 4 de 10"** — but only one field is actually prefilled (`nacionalidade` = "Brasileira"). The other 3 come from the five `Segmentado` fields silently defaulting to "Não" in `VALOR_INICIAL`. The progress metric counts defaults the operator never chose as progress they made — a softer relative of the catalogued Phase 9 "form assumes the common value as if verified" antipattern.

## 9. Mobile (390x844)

- Page is **5597px** tall; no horizontal overflow (`scrollWidth` 390 = `clientWidth` — AGENTS.md respected).
- `PainelLateral` is `xl:sticky` only, so below 1280px it stacks *after* the whole form: **"Simular cadastro" sits 4839px down, ~5.7 screens below the fold**, past all 38 fields. There is no mobile-persistent primary action.
- 51/51 controls under 44px.

## 10. Prioritised issues (Assessment B)

### P0-a — Five required/consequential toggles are unlabelled for assistive tech
`CampoForm.jsx:109` + `Segmentado` (`CampoForm.jsx:5-28`). 5 orphan `label[for]`, 10 buttons with no accessible name beyond "Sim"/"Não". Includes "Criar usuário do sistema". A screen-reader operator cannot tell these five questions apart, and 0/33 fields expose `required`. On a form whose entire purpose is entering another person's legal identity into an ERP, this blocks the task rather than inconveniencing it.
**Fix**: pass `id` into `Segmentado` (or swap `<label>` for a `role="group"` + `aria-labelledby` fieldset), add `aria-required`/`required`, and stop hiding the required signal behind an `aria-hidden` asterisk.

### P0-b — The primary action reports its result to nobody
0 live regions in `<main>`. "Simular cadastro" fires a real IXC round-trip; the outcome lands in a side-panel card and a toast that has **no `role`, no `aria-live`, no close button**, and self-destructs after 4s (`CadastroColaborador.jsx:69`). Nothing is announced. Upload state transitions (`lendo` -> `ok` -> `escaneado` -> `erro`) are equally silent, and `UploadFicha`'s error banner lacks the `role="alert"` its sibling in `CadastroColaborador.jsx:203` has.
**Fix**: `role="alert"` on the toast + upload error, `role="status"` on upload progress and the dry-run result header; make the toast dismissible and stop the 4s auto-hide for errors. This is the third straight phase with the toast-without-`role="alert"` recurrence (Phase 13 P1).

### P1-a — Primary button label fails contrast in every theme
`BTN_PRIMARIO` (`estilos.js:21`): white on `#9A3412 -> #EC7D23` decays **7.31:1 -> 2.79:1** left to right; the centred label's trailing half is below AA. Hardcoded hex, so all five themes. Only the overlay caught it — the static detector reads `backgroundColor` and a gradient lives in `background-image`.
**Fix**: darken the gradient's right stop (or stop the gradient before `#EC7D23`) so the whole run clears 4.5:1. Same fix covers the toast's 3.41:1.

### P1-b — `text-[var(--accent)]` on `bg-[var(--accent-soft)]`, 2.63:1 in light
`Ti.jsx:94` (tool tray) and `CampoForm.jsx:18` (5 segmented controls). Byte-identical to the antipattern already fixed in `SectorsToolbar.jsx` (Phase 7) and still open in `DirectoryToolbar.jsx` — now confirmed on two more surfaces. Passes at 5.00:1 in AMOLED, which is why it survived.
**Fix**: `text-[var(--accent-dark)]`, the fix already proven in Phases 7 and 9.

### P1-c — `text-muted` as real text, 3.01:1 in light, across the whole form
37 field labels, section subtitles, side-panel figures, upload hint (2.85:1), **and the validation error messages**. 7th+ recurrence of this token antipattern. The error-message case is the serious one: errors are grey, styled identically to hints, with no `aria-invalid`/`aria-describedby` — so the error is conveyed by a 3.14:1 ring and colour alone.
**Fix**: `text-faint` for hints (re-verify in AMOLED per the Phase 12 `--foreground-faint` correction), and give errors a real error token plus `aria-invalid` + `aria-describedby`. Leave the 10px *size* alone — it is a shared idiom (§5).

### P1-d — Touch targets: 46/47 desktop, 51/51 mobile, none pseudo-expanded
Worst in the programme so far. Segmented buttons 30px, tray pill 35.5px, selects 36px, inputs 37.5px.
**Fix**: raise the shared `CAMPO`/segmented/tray paddings to a 44px floor; this is one edit in `estilos.js` plus two components, not 47 edits.

### P1-e — City combobox is keyboard-hostile
Escape does not close; ArrowDown does nothing; focus indicator on options measures **1.048:1**; `role="combobox"` missing and listbox/option ownership broken by the intervening `<li>`.
**Fix**: add `role="combobox"`, Escape-to-close, arrow-key + `aria-activedescendant` navigation, move `role="option"` onto the `<li>` (or drop the `<li>`), and give the focused option a visible ring.

### P2-a — Mobile has no reachable primary action
"Simular cadastro" is ~5.7 screens down on a 5597px page; `PainelLateral` is `xl:sticky` only.
**Fix**: sticky action bar below `xl`.

### P2-b — "6 errors" before the user has done anything
Fresh load shows a red "Erros de validação: 6"; the hero simultaneously claims "4/10 obrigatórios preenchidos" from silent `Não` defaults the operator never chose.
**Fix**: suppress the aggregate until first interaction (the inline errors already do this correctly); don't count untouched defaults as filled.

### P2-c — Dropzone is inert to clicks
The large dashed "Arraste a ficha aqui" area has no `onClick`; only the button works. Verified `hasOnClick: false`, no `tabindex`, no `role`.

### P2-d — "Copiar JSON do plano" can fail completely silently
`DryRunResultado.jsx:55-57` swallows the clipboard rejection with a comment that literally says "sem crash, sem feedback". On any non-secure context (production over plain http) the button does nothing and never flips to "Copiado!".

### P3 — Minor
- h1 -> h3, no h2 (`SecaoForm` headings) — same gap as Comunicados/Colaboradores.
- Section icon chip: glyph 2.63:1 and chip-vs-card 1.06:1 in light — decorative and `aria-hidden`, so cosmetic only.
- 9px "editado" badge (`CampoForm.jsx:113`) below the 11px floor.
- Toast timeout is never cleared on unmount (`CadastroColaborador.jsx:69`).
- Toast is top-right, outside the mobile thumb zone.

## 11. False positives discarded, with evidence

- **Detector exit 0** — not a clean bill of health; the tool is structurally blind to this file set (§1).
- **~9 of 22 font-size advisories** — `material-symbols-outlined` glyph sizing, not text.
- **`nested-cards` x4** — CARD-wrapping-CARD is the deliberate anatomy copied from `Configuracoes.jsx`.
- **`kicker-above-heading`, `overused-font`** — shared hero idiom / brand font.
- **`layout-transition` x2** — sidebar chrome, outside this target.
- **`dark:` variants never firing on the three named dark themes** — my own hypothesis, disproved by reading `ThemeContext.tsx:31-32`.
- **Theme flipping to AMOLED mid-session** — a concurrent agent writing shared `localStorage`, not an app bug. My first sweep ran in light, the error-message sample in AMOLED; I re-ran everything deterministically in both themes afterwards and the table in §3 is from that clean pass.

## 12. Notes on conduct

No real personal data used. No PDF uploaded. "Simular cadastro" exercised three times with obviously fake data ("TESTE QA IMPECCAVEL NAO USAR", CPF `111.111.111-11`, `qa-teste@example.com`) against the read-only dry-run route; the page was reloaded afterwards to clear it. Session credential copied into my own tab and the temp file deleted. Live server started in background and stopped; port 8400 verified closed. Theme left as found (`dark` + `dark-amoled`).
