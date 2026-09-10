# mobile-bottom-navigation Specification

## Purpose
Barra de navegação inferior fixa para viewports abaixo de `lg`, com cinco slots (Início, Plantão, Comunicados, Chamados, Mais) vindos da fonte única de navegação, destaque acessível do slot ativo e abertura do sheet "Mais".

## Requirements

### Requirement: Bottom nav visibility
The system SHALL render the bottom navigation bar only on viewports below the `lg` breakpoint.

#### Scenario: Mobile viewport
- **WHEN** the viewport width is less than 1024px
- **THEN** the bottom navigation bar is visible at the bottom of the screen

#### Scenario: Desktop viewport
- **WHEN** the viewport width is 1024px or greater
- **THEN** the bottom navigation bar is hidden and the existing sidebar remains the primary navigation

### Requirement: Bottom nav fixed position
The system SHALL keep the bottom navigation bar fixed at the bottom of the viewport while scrolling.

#### Scenario: Scrolling content
- **WHEN** the user scrolls the page content vertically
- **THEN** the bottom navigation bar remains fixed at the bottom of the viewport

### Requirement: Primary navigation slots
The system SHALL display exactly five slots in the bottom navigation bar, ordered by frequency of daily use: Início, Plantão, Comunicados, Chamados, and Mais. Labels SHALL come from the single navigation source shared with the sidebar. The bar SHALL reserve `env(safe-area-inset-bottom)` below the slots.

#### Scenario: Default mobile view
- **WHEN** the bottom navigation bar is rendered
- **THEN** it shows Início, Plantão, Comunicados, Chamados and Mais with their icons and labels

#### Scenario: Unread announcements
- **WHEN** there are unread urgent or important announcements
- **THEN** the "Comunicados" slot shows a count badge with the same number as the notification bell

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

### Requirement: Slot navigation
The system SHALL update `currentView` when the user taps a primary slot.

#### Scenario: Tap Início
- **WHEN** the user taps the "Início" slot
- **THEN** `currentView` is set to `dashboard`

#### Scenario: Tap Equipe
- **WHEN** the user taps "Colaboradores" inside the more sheet (the former "Equipe" slot no longer exists in the bar)
- **THEN** `currentView` is set to `directory`

#### Scenario: Tap Comunicados
- **WHEN** the user taps the "Comunicados" slot
- **THEN** `currentView` is set to `announcements`

### Requirement: Mais opens sheet
The system SHALL open the "More" sheet when the user taps the "Mais" slot.

#### Scenario: Tap Mais
- **WHEN** the user taps the "Mais" slot
- **THEN** the mobile more sheet is displayed
