# settings-account-integrity Specification

## Purpose

Garante que os controles da página "Minha Conta" façam o que aparentam fazer: preferências marcadas pelo usuário são salvas, o carregamento e as falhas de gravação são comunicados visualmente, e os elementos visuais (labels, botão de foto, cores) funcionam corretamente com leitores de tela e nas variantes de tema escuro.

## Requirements

### Requirement: Notification preference toggles persist
The email notification toggles in the "Preferências" section SHALL be part of the saved profile state: their checked value SHALL be included in the payload sent on save, and SHALL be restored from saved data when the page reloads.

#### Scenario: User toggles a notification preference and saves
- **WHEN** the user changes a notification toggle and clicks "Salvar Alterações"
- **THEN** the toggle's new value SHALL be sent to the backend as part of the save request

#### Scenario: User reloads the page after saving
- **WHEN** the user reloads "Minha Conta" after a previous save that changed a notification toggle
- **THEN** the toggle SHALL render with the previously saved value, not the original default

### Requirement: Profile form shows loading feedback while data loads
The "Minha Conta" page SHALL present a visible loading indication for its form fields while profile and preference data are being fetched, and SHALL stop showing it once data has loaded or the load has failed.

#### Scenario: Data still loading
- **WHEN** the page has mounted and the profile/preferences fetch has not yet resolved
- **THEN** the form fields SHALL show a loading state instead of empty inputs

#### Scenario: Data finished loading
- **WHEN** the profile/preferences fetch resolves (success or failure)
- **THEN** the loading state SHALL be replaced by the populated (or fallback) form fields

### Requirement: Save failure shows user-facing feedback
When saving "Minha Conta" fails, the page SHALL show a visible error message to the user, distinct from the existing success toast.

#### Scenario: Save request fails
- **WHEN** any request triggered by "Salvar Alterações" fails (network error or non-OK response)
- **THEN** the page SHALL display an error indication to the user instead of silently returning to the idle state

### Requirement: Form labels are programmatically associated with inputs
Every labeled field in "Minha Conta" SHALL expose a programmatic association between its visible label and its input, so assistive technology announces the label when the input receives focus.

#### Scenario: Screen reader focuses a field
- **WHEN** a screen reader user moves focus to a labeled input on "Minha Conta" (personal info, sector/role, or preferences fields)
- **THEN** the screen reader SHALL announce the field's visible label text

### Requirement: Icon-only avatar controls have an accessible name
Icon-only interactive controls in the avatar section (e.g., the photo upload/camera button) SHALL expose an accessible name usable by assistive technology.

#### Scenario: Screen reader focuses the camera button
- **WHEN** a screen reader user moves focus to the avatar photo-upload button
- **THEN** the screen reader SHALL announce a descriptive accessible name for the button's action

### Requirement: Settings page visuals adapt to all dark theme variants
Visual elements on "Minha Conta" (including the "Setor e Função" section icon and the notification toggle controls) SHALL use the active theme's color tokens rather than fixed color values, so they render with correct contrast in light mode and in every dark theme variant.

#### Scenario: Dark theme variant is active
- **WHEN** the user has any dark theme variant active (cyber, aurora, or amoled)
- **THEN** the "Setor e Função" section icon and the notification toggle controls SHALL render using that variant's color tokens, not a fixed hex value

### Requirement: Avatar change popover has disclosure semantics and Escape support

The avatar-change popover's trigger button SHALL expose `aria-expanded` and `aria-haspopup`, the popover SHALL close on Escape returning focus to the trigger, and SHALL move initial focus to its first actionable control when opened.

#### Scenario: Escape closes the popover
- **WHEN** the avatar-change popover is open and the user presses Escape
- **THEN** the popover closes and focus returns to the camera trigger button

#### Scenario: Tab does not leave the popover open and unreachable
- **WHEN** the user tabs past the last control inside the open popover
- **THEN** the popover either closes or keeps focus reachable back to its own controls, never remaining open with focus already on an unrelated page field

### Requirement: Real text on Minha Conta passes contrast in every theme

Field labels, readonly field values, and the role/cargo text on "Minha Conta" SHALL use a text color that passes 4,5:1 contrast against their background in all five themes, not the `muted`/`accent` tokens reserved for icons and decorative fills.

#### Scenario: Field labels legible in light theme
- **WHEN** the light theme is active
- **THEN** every field label and readonly field value on "Minha Conta" has a contrast ratio of at least 4,5:1 against its background

### Requirement: Touch targets on Minha Conta meet the minimum size

The avatar camera button and the notification toggle switches SHALL have an effective touch target of at least 44×44px, and the toggle's inactive track SHALL meet the 3:1 non-text contrast minimum against its surrounding surface.

#### Scenario: Camera button reaches the touch minimum
- **WHEN** the avatar camera button is rendered
- **THEN** its effective touch target measures at least 44×44px

### Requirement: Missing office location is reported honestly

When an employee has no filial/office data, "Minha Conta" SHALL display the same "not available" indicator used for missing department data, instead of assuming a specific office name.

#### Scenario: No filial data
- **WHEN** the logged-in employee has no filial data
- **THEN** the "Localização do Escritório" field shows the same "N/D" indicator as an employee with no department data

### Requirement: Save is unavailable while profile data is still loading

The "Salvar Alterações" button SHALL be disabled while the profile/preferences fetch is in flight, so a save cannot submit before a previously-saved custom avatar has loaded into the form.

#### Scenario: Save disabled during initial load
- **WHEN** the profile/preferences fetch has not yet resolved
- **THEN** "Salvar Alterações" is disabled

### Requirement: Save failures are announced to assistive technology

The save-error toast SHALL carry `role="alert"` (or an equivalent live region) so its message is announced without requiring visual focus, and file-size validation on avatar upload SHALL use the same in-page feedback pattern instead of a native `alert()`.

#### Scenario: Screen reader announces a save failure
- **WHEN** a save attempt fails and the error toast appears
- **THEN** assistive technology announces the toast's message without the user needing to move focus to it
