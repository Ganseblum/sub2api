# YOUC UI Restyle Record

## Prototype Source

- `/Users/hang/Documents/myProject/sub2api/youc-pages 2`
- `/Users/hang/Documents/myProject/sub2api/test.html`

## Scope

- Restyled the shared frontend shell to match the YOUC mono / hard-border prototype.
- Kept existing routes, API calls, stores, form handlers, permissions, and page workflows unchanged.
- Updated the default home page copy and visual sections from `test.html`.
- Added global compatibility styling for repeated Tailwind primitives so existing pages inherit the new UI without rewriting business templates.
- Preserved chart behavior and chart option logic; chart-specific visual tuning was intentionally left minimal.

## Files Changed

- `frontend/src/style.css`
- `frontend/src/components/layout/AppLayout.vue`
- `frontend/src/components/layout/AppHeader.vue`
- `frontend/src/components/layout/AppSidebar.vue`
- `frontend/src/components/layout/AuthLayout.vue`
- `frontend/src/components/layout/TablePageLayout.vue`
- `frontend/src/views/HomeView.vue`
- `frontend/src/views/KeyUsageView.vue`
- `frontend/src/views/public/LegalDocumentView.vue`
- `UI_RESTYLE_YOUC.md`

## UI Notes

- Full-page backgrounds and horizontal bands are now 100% width.
- Main content in the home page uses prototype-style inner width constraints while the page surface remains full width.
- Admin layout content root is no longer constrained by page-level `max-w-*` utility classes.
- Public `KeyUsage` and legal pages now use full-width main/header layout surfaces.
- Mobile layout keeps content within viewport and uses horizontal table scrolling where needed.
- Standalone public pages inherit the new square, bordered, hard-shadow style through the global compatibility layer.
- Follow-up fixes from `/问题` screenshots:
  - Restored high-contrast dark table headers where scoped table classes were overriding the prototype style.
  - Normalized table body and sticky-column backgrounds to remove washed grey overlay bands.
  - Tightened dropdown option padding, font size, and shadow weight.
  - Replaced global ring hard shadows with outlines so small controls no longer show black offset blocks.
  - Strengthened table action and pagination button styling without changing handlers or data flow.
  - Adjusted shared DataTable loading behavior so server-side sorting keeps existing rows during refresh instead of flashing to skeleton rows.
  - Cleaned up Chinese-locale UI copy in the restyled shell and related forms while preserving technical terms such as API, OAuth, Token, BaseURL, SDK, and provider names.

## Functional Preservation

- No backend endpoints changed.
- No router guards changed.
- No auth, payment, key, account, or settings data flow changed.
- No form submit handlers or API payload builders changed.
- Custom home content override behavior is preserved.

## Validation

- `pnpm run typecheck`
- `pnpm run build`
- Browser checks: `/home`, `/login`, `/key-usage`, `/legal/terms`, and one authenticated admin shell page.
- `/setup` redirected to `/` in this local environment, so the setup route behavior was not bypassed.
