## Context

The Prestek Intranet system has evolved to a new modern, glassmorphic design system characterized by cool blue tones (`#F5F9FF`, `#1F5BA8`, `#4A9EF5`), bento card layouts, and refined shadows and borders (`#E4ECF5`). The "Mapa de Cobertura" component was built during a previous UI iteration, using warm/brown tones (`#fcfaf8`, `#a17745`) and harder borders. It needs to be visually aligned with the rest of the application (e.g., Dashboard, Login, Services Directory).

## Goals / Non-Goals

**Goals:**
- Completely migrate `src/components/Coverage.jsx` to a Map-First (NOC Dashboard) layout.
- Use a dark map tile layer (CARTO DB Dark Matter) to showcase status marker colors and provide a premium sci-fi/control room look.
- Floating components above the map using glassmorphic styles (`bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#E4ECF5]/30 dark:border-[#2e2a26]/30 shadow-lg`).
- Implement a collapsible sidebar on the left side of the map for list filtering/navigation, allowing full-screen map mode.
- Align background, typography, and interactive button colors with the standard dashboard and services directory.

**Non-Goals:**
- Changing business logic, API endpoints, or data structure.
- Modifying the Leaflet marker logic, except for customizing the HTML popup styling.

## Decisions

- **Color Palette & Typography**: We will adopt `text-[#0B1B2E]` for primary text, `text-[#1F5BA8]` for interactive elements, and `#F5F9FF` for the main background. We will use the existing Tailwind setup but swap the hardcoded hex codes.
- **Glassmorphism Panels**: Controls (filters, search) and stats summaries will float above the map. They will use the classes: `bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#E4ECF5]/30 dark:border-[#2e2a26]/30 shadow-lg rounded-2xl`.
- **Dark Map Theme**: The map tile layer in `CoverageMap.jsx` will be switched to `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`.
- **Collapsible Sidebar**: A panel on the left containing the cities and neighborhoods list will feature a toggle button `[ < ]` / `[ > ]` to collapse/expand it, maximizing the map view.
- **Interactive Elements**: Buttons will use `bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white hover:opacity-90 active:scale-[0.98] transition-all`.

## Risks / Trade-offs

- **Risk**: The Leaflet map size calculations might glitch when the sidebar is collapsed/expanded.
- *Mitigation*: We will trigger a map resize check (`map.invalidateSize()`) whenever the sidebar state changes, or simply handle it using state triggers.
- **Risk**: Low visibility of text/markers on dark background.
- *Mitigation*: The green, blue, and red markers contrast perfectly against the dark CARTO DB basemap, and popup HTML text will have appropriate background blocks.
