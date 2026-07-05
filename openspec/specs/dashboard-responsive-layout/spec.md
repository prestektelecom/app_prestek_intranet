# dashboard-responsive-layout Specification

## Purpose
Define os requisitos de layout responsivo para a página de Dashboard da intranet, garantindo que widgets e controles se adaptem corretamente a viewports móveis, tablets e desktops.

## Requirements

### Requirement: Dashboard layout adapts to viewport width
The Dashboard SHALL render a single-column layout on mobile, a two-column layout on tablet and the existing multi-column layout on desktop.

#### Scenario: Mobile viewport
- **WHEN** the viewport width is below 768px
- **THEN** each dashboard widget SHALL occupy the full width of the grid and stack vertically

#### Scenario: Tablet viewport
- **WHEN** the viewport width is between 768px and 1023px
- **THEN** widgets SHALL use a reduced column count and reorganize without horizontal overflow

#### Scenario: Desktop viewport
- **WHEN** the viewport width is 1024px or greater
- **THEN** the Dashboard SHALL keep the existing layout and widget proportions

### Requirement: Dashboard widgets scale internal content
The Hero card, Setor KPIs, OS card, Plantão card and Comunicados card SHALL scale their internal spacing, typography and grids for mobile viewports.

#### Scenario: Hero card on mobile
- **WHEN** the viewport width is below 768px
- **THEN** the Hero card SHALL reduce padding, font size and wrap action buttons to avoid horizontal overflow

#### Scenario: Setor KPIs on mobile
- **WHEN** the viewport width is below 768px
- **THEN** the three KPI cards SHALL stack vertically or use a scrollable horizontal strip instead of a fixed 3-column grid

### Requirement: Dashboard customization controls remain usable on mobile
The "Personalizar Dashboard" button and its edit/save/cancel controls SHALL remain visible and tappable on mobile without overlapping widgets.

#### Scenario: Editing layout on mobile
- **WHEN** the user enters edit mode on a mobile device
- **THEN** the action buttons SHALL stack vertically and remain inside the viewport
