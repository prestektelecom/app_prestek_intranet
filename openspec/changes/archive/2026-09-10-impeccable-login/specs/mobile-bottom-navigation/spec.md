## MODIFIED Requirements

### Requirement: Active slot highlight
The system SHALL highlight the slot that corresponds to the current active view using the theme accent for the icon and the theme ink for the label, so the label keeps ≥ 4.5:1 contrast in every theme, and SHALL expose `aria-current="page"` on that slot. The "Mais" slot SHALL be highlighted only while the sheet is open or when the current view has no slot AND is accessible to the user's role. When the current view does not exist or the user's role cannot access it (the "not found" or "no permission" screen is showing), no slot SHALL be highlighted.

#### Scenario: User is on Dashboard
- **WHEN** `currentView` equals `dashboard`
- **THEN** the "Início" slot is highlighted with the active theme color and carries `aria-current="page"`

#### Scenario: User is on Serviços
- **WHEN** `currentView` equals `services`
- **THEN** the "Mais" slot is highlighted because Serviços lives inside the sheet

#### Scenario: User is on Plantão
- **WHEN** `currentView` equals `schedule`
- **THEN** the "Plantão" slot is highlighted and carries `aria-current="page"`, and "Mais" is not highlighted

#### Scenario: User is on Setores
- **WHEN** `currentView` equals `sectors`
- **THEN** the "Mais" slot is highlighted because Setores lives inside the sheet

#### Scenario: Non-admin user on an admin view
- **WHEN** a user without the admin role has `currentView` equal to `admin` and the "no permission" screen is showing
- **THEN** no slot is highlighted, including "Mais"

#### Scenario: Unknown view
- **WHEN** `currentView` does not match any known view
- **THEN** no slot is highlighted
