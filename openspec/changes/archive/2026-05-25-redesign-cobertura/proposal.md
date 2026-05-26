## Why

The current "Mapa de Cobertura de Rede" (Coverage Map) tab uses an outdated color palette (browns, golds, warm backgrounds) that conflicts with the modern, unified design system recently applied to the Dashboard, Login, and Services Directory components. Aligning the visual identity is essential to maintain consistency, improve readability, and deliver a more premium user experience.

## What Changes

- Update main layout to a Map-First NOC Control Center layout, with the map covering the full workspace container.
- Use a dark theme map basemap (CARTO DB Dark Matter) to provide a premium and modern sci-fi dashboard aesthetic.
- Float top bar (search, filters, breadcrumbs), collapsible left sidebar (scrollable cities/bairros list), and bottom-right metrics cards on top of the map using translucent glassmorphism styles (`backdrop-blur`).
- Standardize the "Sincronizar IXC" button with the new blue gradient.
- Audit and style the Override Modal (configuration modal) to use modern inputs, clean contrast, and correct focus rings (`focus:ring-[#4A9EF5]`).

## Capabilities

### New Capabilities
- `cobertura-ui-redesign`: Modernization of the Coverage Map UI components including table, summary cards, and modals.

### Modified Capabilities


## Impact

- `src/components/Coverage.jsx`: Major styling overhaul for the layout, cards, table, and modal.
- `src/components/CoverageMap.jsx`: Possible minor tweaks to ensure map overlays and wrapper styles fit the new design.
