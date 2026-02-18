# Specification

## Summary
**Goal:** Deliver a mobile-first, calculation-only React Progressive Web App that is installable on Android and works offline.

**Planned changes:**
- Add a valid web app manifest (name, short_name, start_url, display=standalone, theme_color, background_color) and reference generated icons (including maskable).
- Register a service worker so the app shell loads offline after the first successful load.
- Implement an on-device calculator flow with input validation, clear inline errors, and immediate computed results (no network calls required).
- Apply a coherent mobile-first visual theme (colors, typography, spacing, component styling) consistently across the app, avoiding blue/purple defaults.
- Ensure core calculator functionality works end-to-end with the device offline.

**User-visible outcome:** Users can install the calculator on Android from Chrome (“Add to Home screen”), launch it as a standalone app, and perform calculations on-device reliably even when offline.
