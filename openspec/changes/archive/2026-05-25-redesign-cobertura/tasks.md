## 1. Global UI & NOC Layout (Coverage.jsx)

- [x] 1.1 Convert main page content into a full-height container with the map as the absolute background.
- [x] 1.2 Implement a floating top bar (glassmorphic style) containing title, search input, and filter dropdowns.
- [x] 1.3 Implement a collapsible sidebar on the left side of the map to display the scrollable list of cities/bairros, including expand/collapse toggle state.
- [x] 1.4 Implement a floating bottom-right bento metrics card for stats overview.

## 2. Compact Sidebar Table Refactor (Coverage.jsx)

- [x] 2.1 Refactor the data table into a compact sidebar list format (scrollable, borderless layout, with clean separators).
- [x] 2.2 Maintain translucent badges (FTTH, Rádio, UTP) and status bars adapted to the sidebar's compact size.
- [x] 2.3 Style row items with clean hover and selected states, removing any legacy brown colors.
- [x] 2.4 Style row action buttons to use standard interactive blue tones.

## 3. Dark Map & Popup Refactor (CoverageMap.jsx)

- [x] 3.1 Switch the Leaflet tile layer to CARTO DB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`).
- [x] 3.2 Update the map wrapper to have `rounded-2xl` / `rounded-3xl` and border style to seamlessly blend as the background.
- [x] 3.3 Adapt HTML popup content for the dark tile layer, using clear typography and appropriate contrast container backgrounds.

## 4. Override Modal Style Audit (Coverage.jsx)

- [x] 4.1 Audit `OverrideModal` to ensure inputs, selects, range sliders, and primary buttons conform strictly to the standard glassmorphic design and focus states.
