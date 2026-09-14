## ADDED Requirements

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
