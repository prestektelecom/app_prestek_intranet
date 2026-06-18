## ADDED Requirements

### Requirement: Sheet visibility
The system SHALL render the more sheet as a panel sliding up from the bottom of the viewport.

#### Scenario: Open sheet
- **WHEN** the user taps "Mais" on the bottom navigation bar
- **THEN** the more sheet slides up from the bottom and covers the lower portion of the screen

#### Scenario: Close sheet
- **WHEN** the user taps outside the sheet or on the close area
- **THEN** the more sheet closes

### Requirement: Secondary navigation items
The system SHALL list the following items inside the more sheet: Setores, Plantão, Escritórios, Processos, Meus Chamados, Comunicados, and Configurações.

#### Scenario: Sheet is open
- **WHEN** the user opens the more sheet
- **THEN** all secondary items are visible and tappable

### Requirement: Admin item conditional visibility
The system SHALL display the "Painel Admin" item in the more sheet only when the authenticated user has admin privileges.

#### Scenario: Admin user opens sheet
- **WHEN** `user?.is_admin` is true and the sheet is open
- **THEN** the "Painel Admin" item is visible

#### Scenario: Non-admin user opens sheet
- **WHEN** `user?.is_admin` is false or undefined and the sheet is open
- **THEN** the "Painel Admin" item is not visible

### Requirement: Item navigation
The system SHALL update `currentView` and close the sheet when the user taps a secondary item.

#### Scenario: Tap Processos
- **WHEN** the user taps "Processos" inside the sheet
- **THEN** `currentView` is set to `processes` and the sheet closes

#### Scenario: Tap Configurações
- **WHEN** the user taps "Configurações" inside the sheet
- **THEN** `currentView` is set to `settings` and the sheet closes

### Requirement: Sheet active state
The system SHALL highlight the secondary item that corresponds to the current active view.

#### Scenario: User is on Plantão
- **WHEN** `currentView` equals `schedule` and the sheet is open
- **THEN** the "Plantão" item is highlighted with the active theme color
