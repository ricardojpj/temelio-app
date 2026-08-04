# Task 1 — Manual Testing Bug Report

**Pages tested:** Admin Settings · Contacts  
**Date:** 2026-07-27  
**Tester:** Automated exploration (Playwright) + analysis  
**Validation run:** 2026-08-04 (Playwright automated, all 12 tests passed)

---

## Admin Settings

### BUG-005 · Medium — "Total budget year grant budget" label says "(Planned Giving)"
**Status:** ✅ CONFIRMED  
**Section:** Budgeting  
**Description:** The label reads *"Total budget year grant budget (Planned Giving)"*. The parenthetical "(Planned Giving)" is unexplained — it's unclear if this field only applies to Planned Giving grants or if it's a leftover from a previous feature.  
**Severity:** Medium (confusing UX / misleading label)

![BUG-005](screenshots/BUG-005-planned-giving-label.png)

---

### BUG-007 · Low — Archive Grant Type buttons have no tooltip
**Status:** ✅ CONFIRMED (5 archive buttons found; `aria-label="Archive Grant Type"` present but `title=null` — no tooltip for sighted users)  
**Section:** Global Configurations → Custom Grant Types  
**Description:** The archive buttons next to each grant type only contain an icon (no text). They do have `aria-label="Archive Grant Type"` which is correct for screen readers, but hovering shows no tooltip confirming the action for sighted users.  
**Severity:** Low (aria-label present, but no tooltip)

![BUG-007](screenshots/BUG-007-archive-icon-only.png)

---

### BUG-009 · Low — Console warns about deprecated Tailwind CSS color names
**Status:** ✅ CONFIRMED (5 warnings on every page load)  
**Section:** App-wide  
**Description:** 5 Tailwind deprecation warnings appear on every page load (`lightBlue → sky`, `warmGray → stone`, `trueGray → neutral`, `coolGray → gray`, `blueGray → slate`). Not a runtime bug but indicates outdated config.

---

## Contacts

### BUG-010 · High — Console errors: invalid `href` with double slashes
**Status:** ✅ CONFIRMED  
**Section:** Contacts page (Grantees / People tabs)  
**Description:** Two JS errors logged on load:
- `Invalid href '/foundation//contacts'`
- `Invalid href '/foundation//individuals'`

The `foundationId` is empty in these generated URLs — likely a race condition where the component renders before the foundation ID is available in context.  
**Steps:** Open the Contacts page and check browser console  
**Expected:** No console errors  
**Actual:** Two `next/router` invalid-href errors on every load

![BUG-010](screenshots/BUG-010-console-errors-double-slash.png)

---

### BUG-012 · Medium — "Bulk Actions (0)" button visible with no selection
**Status:** ⚠️ PARTIALLY CONFIRMED (visible=true, disabled=true with 0 selections)  
**Section:** Contacts toolbar  
**Description:** The "Bulk Actions (0)" button is shown even when no items are selected. It is correctly disabled, but should ideally be hidden when there is nothing to act on.

---

### BUG-013 · Medium — Contacts table checkboxes have no `id` and no label
**Status:** ✅ CONFIRMED (19 checkboxes without `id` or `aria-label`)  
**Section:** Contacts → table header / row checkboxes  
**Description:** The "select all" and row-level checkboxes have no `id`, no `aria-label`, and no associated `<label>`. They are inaccessible to screen readers.

![BUG-013](screenshots/BUG-013-checkboxes-no-label.png)

---

### BUG-014 · Low — "Clear filter" button visible when no filter is active
**Status:** ✅ CONFIRMED  
**Section:** Contacts toolbar  
**Description:** A "Clear filter" button (×) is visible even though no active filter has been applied. It should only appear when a filter is active.

![BUG-014](screenshots/BUG-014-clear-filter-no-filter.png)

---

## Summary

| Bug ID | Page | Severity | Title |
|--------|------|----------|-------|
| BUG-005 | Admin | Medium | Misleading label "(Planned Giving)" on total budget field |
| BUG-007 | Admin | Low | Archive Grant Type buttons have no tooltip |
| BUG-009 | Admin | Low | Deprecated Tailwind CSS color name warnings in console |
| BUG-010 | Contacts | High | Console errors — invalid href with double slashes |
| BUG-012 | Contacts | Medium | "Bulk Actions (0)" visible with no selection |
| BUG-013 | Contacts | Medium | Table checkboxes have no label or id |
| BUG-014 | Contacts | Low | "Clear filter" visible when no filter is active |
