# app-temelio — Playwright E2E Test Suite

Automated end-to-end tests for [Temelio](https://app-dev.trytemelio.com) Admin Settings using Playwright + TypeScript.

## Requirements

- Node.js 22+
- Chrome installed (`channel: 'chrome'`)
- Java (for Allure CLI) — install via `brew install java` and add to PATH

## Setup

```bash
npm install
npx playwright install
```

### Authenticate (first time / session expired)

```bash
npm run setup:auth
```

Opens Chrome, log in with your Google account, press Enter. Session saved to `.auth/session.json`.

## Running Tests

```bash
# All budgeting tests
npm run test:admin

# Headed (watch mode)
npm run test:headed

# Single file
npx playwright test tests/admin/budgeting.spec.ts
```

## Allure Report

```bash
# Generate + open (requires Java in PATH)
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
npm run allure:generate
npm run allure:open

# Or serve directly from results
npm run allure:serve
```

> **Tip:** Delete `allure-results/` before a run to get a clean report:
> ```bash
> rm -rf allure-results && npx playwright test tests/admin/budgeting.spec.ts
> ```

## Test Structure

```
tests/
  admin/
    budgeting.spec.ts   # 30 TCs — Budgeting section (positive + negative)
    admin.spec.ts       # 36 TCs — Admin page general settings

pages/
  BudgetingPage.ts      # Page Object for Budgeting section
  AdminPage.ts          # Page Object for Admin settings

scripts/
  setup-auth.ts         # Manual login → saves session to .auth/session.json
```

## Covered Test Cases (budgeting.spec.ts)

| Group | TCs | Description |
|---|---|---|
| Page Load | TC-B001–B012 | Headings, labels, inputs visible; math check |
| Fiscal Year | TC-B013–B016 | Menu opens, navigate years, select year, copy button |
| Add Category | TC-B017–B023 | Add, name, amount, remove, sub-category, totals |
| Negative / Edge | TC-B024–B030 | Zero amount, overflow, negative input, special chars, large value, remove-all bug |

## Known Bugs Found

| TC | Description |
|---|---|
| TC-B029 | App allows removing the last allocation category despite showing "at least one category is required" |
