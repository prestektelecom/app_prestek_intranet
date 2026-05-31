---
name: Leaflet HMR race condition
description: How to prevent "Map container is already initialized" on Vite HMR saves in CoverageMap
---

## Rule
Always use a **static** `import L from 'leaflet'` in Leaflet map components — never `import('leaflet')` (dynamic) inside `useEffect`.

**Why:** Dynamic import creates Promise closures bound to old module versions. On every HMR save Vite re-executes the module, but the old `.then()` callbacks are still alive in the microtask queue. They resolve AFTER the new component's synchronous `L.map()` call, see an already-initialized container, and crash with "Map container is already initialized" — even with a `cancelado` flag, because the old closure predates that flag.

**How to apply:**
1. `import L from 'leaflet'` at the top of the file (static).
2. In `useEffect`, before calling `L.map(container)`, add:
   ```js
   if (container._leaflet_id) container._leaflet_id = undefined;
   ```
   This clears any stale `_leaflet_id` left by a previous module version's callback that ran after the last cleanup (one-time HMR transition guard; harmless in production where `_leaflet_id` is never pre-set on a fresh mount).
3. Cleanup: call `map.remove()` directly — no module-level registry needed.

Module-level `Map` / `WeakMap` registries do NOT work because Vite re-executes the module on every HMR save, resetting them.
`window.*` properties do survive HMR but are unnecessary once the static import approach is used.
