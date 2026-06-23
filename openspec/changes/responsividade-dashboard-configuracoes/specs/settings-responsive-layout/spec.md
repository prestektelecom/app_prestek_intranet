## ADDED Requirements

### Requirement: Settings page stacks sidebar and form on mobile
The Configurações page SHALL display the navigation card above the form on mobile and keep the existing side-by-side layout on desktop.

#### Scenario: Mobile viewport
- **WHEN** the viewport width is below 1024px
- **THEN** the navigation card SHALL appear above the form and both SHALL occupy the full width of the container

#### Scenario: Desktop viewport
- **WHEN** the viewport width is 1024px or greater
- **THEN** the navigation card SHALL occupy 4 columns and the form SHALL occupy 8 columns as it does today

### Requirement: Settings form fields adapt to viewport width
The form fields in Configurações SHALL use a single-column layout on mobile and the existing two-column layout on desktop.

#### Scenario: Mobile viewport
- **WHEN** the viewport width is below 768px
- **THEN** each form field SHALL occupy the full width of the form and stack vertically

#### Scenario: Desktop viewport
- **WHEN** the viewport width is 768px or greater
- **THEN** fields MAY use a two-column grid where semantically appropriate

### Requirement: Settings navigation card remains accessible on mobile
The sticky navigation card in Configurações SHALL not be clipped, overflow or overlap content on mobile.

#### Scenario: Scrolling on mobile
- **WHEN** the user scrolls the settings page on a mobile device
- **THEN** the navigation card SHALL scroll naturally with the page and not remain fixed in a way that hides content
