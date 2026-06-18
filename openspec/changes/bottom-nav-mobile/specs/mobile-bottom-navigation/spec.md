## ADDED Requirements

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
The system SHALL display exactly five slots in the bottom navigation bar: Início, Serviços, Cobertura, Equipe, and Mais.

#### Scenario: Default mobile view
- **WHEN** the bottom navigation bar is rendered
- **THEN** it shows the five slots with their respective icons and labels

### Requirement: Active slot highlight
The system SHALL highlight the slot that corresponds to the current active view.

#### Scenario: User is on Dashboard
- **WHEN** `currentView` equals `dashboard`
- **THEN** the "Início" slot is highlighted with the active theme color

#### Scenario: User is on Serviços
- **WHEN** `currentView` equals `services`
- **THEN** the "Serviços" slot is highlighted with the active theme color

### Requirement: Slot navigation
The system SHALL update `currentView` when the user taps a primary slot.

#### Scenario: Tap Início
- **WHEN** the user taps the "Início" slot
- **THEN** `currentView` is set to `dashboard`

#### Scenario: Tap Equipe
- **WHEN** the user taps the "Equipe" slot
- **THEN** `currentView` is set to `directory`

### Requirement: Mais opens sheet
The system SHALL open the "More" sheet when the user taps the "Mais" slot.

#### Scenario: Tap Mais
- **WHEN** the user taps the "Mais" slot
- **THEN** the mobile more sheet is displayed
