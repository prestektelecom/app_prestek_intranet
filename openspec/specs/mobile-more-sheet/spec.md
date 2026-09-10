# mobile-more-sheet Specification

## Purpose
Sheet "Mais" da navegação mobile: painel acessível (`role="dialog"`) que sobe do rodapé e lista os itens de navegação sem slot na barra inferior, com grupo separado de administração para admins.

## Requirements

### Requirement: Sheet visibility
The system SHALL render the more sheet as a panel sliding up from the bottom of the viewport, with `role="dialog"`, `aria-modal="true"` and `aria-label="Mais opções"`, and SHALL lock background scrolling while open.

#### Scenario: Open sheet
- **WHEN** the user taps "Mais" on the bottom navigation bar
- **THEN** the more sheet slides up, focus moves into it, and the page behind it does not scroll

#### Scenario: Close sheet
- **WHEN** the user taps outside the sheet, taps the close button (44×44, `aria-label="Fechar"`), or presses Escape
- **THEN** the more sheet closes and focus returns to the "Mais" slot

### Requirement: Secondary navigation items
The system SHALL list inside the more sheet every navigation item from the single navigation source that does not own a bottom-bar slot, in this order: Serviços, Cobertura, Colaboradores, Setores, Escritórios, Processos, Configurações, and, for admins, a separated group with TI and Painel Admin.

#### Scenario: Sheet is open
- **WHEN** a non-admin user opens the more sheet
- **THEN** Serviços, Cobertura, Colaboradores, Setores, Escritórios, Processos and Configurações are visible and tappable, and no admin item is rendered

### Requirement: Admin item conditional visibility
The system SHALL display the "TI" and "Painel Admin" items in the more sheet only when the authenticated user has admin privileges, visually separated from the everyday items.

#### Scenario: Admin user opens sheet
- **WHEN** `user?.is_admin` is true and the sheet is open
- **THEN** "TI" and "Painel Admin" are visible after a divider labeled "Administração"

#### Scenario: Non-admin user opens sheet
- **WHEN** `user?.is_admin` is false or undefined and the sheet is open
- **THEN** neither "TI" nor "Painel Admin" is rendered

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
