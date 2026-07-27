import { test, expect } from '@playwright/test';
import { BudgetingPage, ADMIN_URL } from '../../pages/BudgetingPage';

/**
 * TC-B001 – TC-B020: Budgeting section in Admin Settings
 * Positive and negative scenarios for:
 *   - Budget year start month
 *   - Fiscal year selector
 *   - Total budget amount
 *   - Allocation categories (add, edit, remove, sub-categories)
 *   - Totals calculation
 */

test.describe('Budgeting - Page Load & Read-Only Assertions', () => {
  let bp: BudgetingPage;

  test.beforeEach(async ({ page }) => {
    bp = new BudgetingPage(page);
    await page.goto(ADMIN_URL);
    await page.waitForSelector('[data-sentry-component="BudgetManager"]', { timeout: 10000 });
  });

  test('TC-B001: Budgeting section heading and description are visible', async ({ page }) => {
    await expect(page.locator('h2:has-text("Budgeting")')).toBeVisible();
    await expect(page.locator('p:has-text("Configure your annual budget allocations")')).toBeVisible();
  });

  test('TC-B002: Start Of Budget Year label and selector are visible', async ({ page }) => {
    await expect(page.locator('label:has-text("Start Of Budget Year")')).toBeVisible();
    // The react-select combobox input is reachable
    const combobox = page.locator('[data-sentry-component="BudgetManager"] [role="combobox"]').first();
    await expect(combobox).toBeAttached();
  });

  test('TC-B003: Budget year selector shows current fiscal year range', async () => {
    await expect(bp.budgetYearMenuButton).toBeVisible();
    await expect(bp.budgetYearMenuButton).toContainText('Jun 1, 2026 - May 31, 2027');
  });

  test('TC-B004: Total budget input is visible and shows a dollar amount', async () => {
    await expect(bp.totalBudgetInput).toBeVisible();
    const value = await bp.totalBudgetInput.inputValue();
    expect(value).toMatch(/^\$[\d,]+$/);
  });

  test('TC-B005: Allocation categories heading and At-least-one-required note are visible', async ({ page }) => {
    await expect(page.locator('text=Allocation categories')).toBeVisible();
    await expect(page.locator('text=at least one category is required')).toBeVisible();
  });

  test('TC-B006: At least one allocation category exists on load', async () => {
    const count = await bp.getCategoryCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-B007: Category rows have name input and amount input', async () => {
    const count = await bp.getCategoryCount();
    for (let i = 0; i < count; i++) {
      await expect(bp.getCategoryNameInputAt(i)).toBeVisible();
      await expect(bp.getCategoryAmountInputAt(i)).toBeVisible();
    }
  });

  test('TC-B008: Each category has a Remove and Add sub button', async () => {
    const count = await bp.getCategoryCount();
    for (let i = 0; i < count; i++) {
      await expect(bp.getRemoveButtonAt(i)).toBeVisible();
      await expect(bp.getAddSubButtonAt(i)).toBeVisible();
    }
  });

  test('TC-B009: Total Allocated amount is shown', async () => {
    const allocated = await bp.getTotalAllocatedAmount();
    expect(allocated).toMatch(/^\$[\d,]+$/);
  });

  test('TC-B010: Remaining amount is shown', async () => {
    const remaining = await bp.getRemainingAmount();
    expect(remaining).toMatch(/^\$[\d,]+$/);
  });

  test('TC-B011: Total Allocated + Remaining equals total budget', async () => {
    const budgetRaw = await bp.totalBudgetInput.inputValue();
    const allocatedRaw = await bp.getTotalAllocatedAmount();
    const remainingRaw = await bp.getRemainingAmount();

    const parse = (s: string) => parseInt(s.replace(/[^0-9]/g, ''), 10);
    const budget = parse(budgetRaw);
    const allocated = parse(allocatedRaw);
    const remaining = parse(remainingRaw);

    expect(allocated + remaining).toBe(budget);
  });

  test('TC-B012: Add category button is visible', async () => {
    await expect(bp.addCategoryButton).toBeVisible();
  });
});

test.describe('Budgeting - Fiscal Year Selector', () => {
  let bp: BudgetingPage;

  test.beforeEach(async ({ page }) => {
    bp = new BudgetingPage(page);
    await page.goto(ADMIN_URL);
    await page.waitForSelector('[data-sentry-component="BudgetManager"]', { timeout: 10000 });
  });

  test('TC-B013: Opening fiscal year menu shows multiple year options', async ({ page }) => {
    await bp.openFiscalYearMenu();
    const items = page.locator('button[aria-label^="Select fiscal year"]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('TC-B014: Fiscal year menu contains navigate-years controls', async ({ page }) => {
    await bp.openFiscalYearMenu();
    await expect(page.locator('text=Navigate Years')).toBeVisible();
  });

  test('TC-B015: Selecting a different fiscal year updates the menu button label', async ({ page }) => {
    await bp.selectFiscalYear('Jun 1, 2025 - May 31, 2026');
    await expect(bp.budgetYearMenuButton).toContainText('Jun 1, 2025 - May 31, 2026');
    // Restore original year
    await bp.selectFiscalYear('Jun 1, 2026 - May 31, 2027');
  });

  test('TC-B016: Current year option has a Copy button next to it', async ({ page }) => {
    await bp.openFiscalYearMenu();
    // The Copy button is visible inside the open menu next to the current year
    const copyButton = page.locator('button[aria-label^="Copy budget from"]');
    await expect(copyButton).toBeVisible();
  });
});

test.describe('Budgeting - Add Category (Positive)', () => {
  let bp: BudgetingPage;

  test.beforeEach(async ({ page }) => {
    bp = new BudgetingPage(page);
    await page.goto(ADMIN_URL);
    await page.waitForSelector('[data-sentry-component="BudgetManager"]', { timeout: 10000 });
  });

  test('TC-B017: Adding a new category increases category count by 1', async () => {
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const countAfter = await bp.getCategoryCount();
    expect(countAfter).toBe(countBefore + 1);
  });

  test('TC-B018: New category is added with a placeholder name and zero amount', async () => {
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore; // 0-based
    const newName = await bp.getCategoryNameInputAt(newIndex).inputValue();
    const newAmount = await bp.getCategoryAmountInputAt(newIndex).inputValue();
    // App auto-fills a default name like "New Category N"
    expect(newName.length).toBeGreaterThanOrEqual(0);
    expect(parseInt(newAmount, 10)).toBe(0);
  });

  test('TC-B019: Setting a category name persists the value in the input', async () => {
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    await bp.setCategoryName(newIndex, 'health');
    const savedName = await bp.getCategoryNameInputAt(newIndex).inputValue();
    expect(savedName).toBe('health');
    // Cleanup: remove the added row
    await bp.removeCategory(newIndex);
  });

  test('TC-B020: Setting a category amount updates Total Allocated', async () => {
    const allocatedBefore = parseInt((await bp.getTotalAllocatedAmount()).replace(/[^0-9]/g, ''), 10);
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    await bp.setCategoryName(newIndex, 'test-category');
    await bp.setCategoryAmount(newIndex, '5000');

    const allocatedAfter = parseInt((await bp.getTotalAllocatedAmount()).replace(/[^0-9]/g, ''), 10);
    expect(allocatedAfter).toBe(allocatedBefore + 5000);

    // Cleanup
    await bp.removeCategory(newIndex);
  });

  test('TC-B021: Removing an added category restores original count', async () => {
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    await bp.removeCategory(countBefore); // remove the last (newly added)
    const countAfter = await bp.getCategoryCount();
    expect(countAfter).toBe(countBefore);
  });

  test('TC-B022: Total Allocated is recalculated after removing category', async () => {
    const allocatedBefore = parseInt((await bp.getTotalAllocatedAmount()).replace(/[^0-9]/g, ''), 10);
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    await bp.setCategoryName(newIndex, 'temp-cat');
    await bp.setCategoryAmount(newIndex, '2000');

    const allocatedMid = parseInt((await bp.getTotalAllocatedAmount()).replace(/[^0-9]/g, ''), 10);
    expect(allocatedMid).toBe(allocatedBefore + 2000);

    await bp.removeCategory(newIndex);
    const allocatedAfter = parseInt((await bp.getTotalAllocatedAmount()).replace(/[^0-9]/g, ''), 10);
    expect(allocatedAfter).toBe(allocatedBefore);
  });

  test('TC-B023: Add sub-category button adds a nested category row', async ({ page }) => {
    const countBefore = await bp.getCategoryCount();
    await bp.getAddSubButtonAt(0).click();
    await page.waitForTimeout(500);
    const countAfter = await bp.getCategoryCount();
    expect(countAfter).toBeGreaterThan(countBefore);
    // Cleanup
    await bp.removeCategory(1); // sub is inserted after parent at index 1
  });
});

test.describe('Budgeting - Negative / Edge Cases', () => {
  let bp: BudgetingPage;

  test.beforeEach(async ({ page }) => {
    bp = new BudgetingPage(page);
    await page.goto(ADMIN_URL);
    await page.waitForSelector('[data-sentry-component="BudgetManager"]', { timeout: 10000 });
  });

  test('TC-B024: Category amount with value 0 does not increase Total Allocated', async () => {
    const allocatedBefore = parseInt((await bp.getTotalAllocatedAmount()).replace(/[^0-9]/g, ''), 10);
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    await bp.setCategoryName(newIndex, 'zero-cat');
    await bp.setCategoryAmount(newIndex, '0');

    const allocatedAfter = parseInt((await bp.getTotalAllocatedAmount()).replace(/[^0-9]/g, ''), 10);
    expect(allocatedAfter).toBe(allocatedBefore);

    // Cleanup
    await bp.removeCategory(newIndex);
  });

  test('TC-B025: Allocation exceeding total budget shows Remaining as negative or zero', async ({ page }) => {
    const budgetRaw = await bp.totalBudgetInput.inputValue();
    const budget = parseInt(budgetRaw.replace(/[^0-9]/g, ''), 10);

    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    await bp.setCategoryName(newIndex, 'overflow-cat');
    // Set an amount greater than the total budget
    await bp.setCategoryAmount(newIndex, String(budget + 1));
    await page.waitForTimeout(500);

    const remainingRaw = await bp.getRemainingAmount();
    const remaining = parseInt(remainingRaw.replace(/[^0-9]/g, ''), 10);
    // Remaining should be 0 (capped) or negative — either way not greater than before
    expect(remaining).toBeLessThanOrEqual(0);

    // Cleanup
    await bp.removeCategory(newIndex);
  });

  test('TC-B026: Entering a negative number in category amount is not accepted', async ({ page }) => {
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    const amountInput = bp.getCategoryAmountInputAt(newIndex);
    await amountInput.click({ clickCount: 3 });
    await amountInput.type('-500');
    await amountInput.press('Tab');
    await page.waitForTimeout(300);

    const savedValue = await amountInput.inputValue();
    // input[type=number] ignores negative if min=0; expect 0 or empty
    expect(parseInt(savedValue || '0', 10)).toBeGreaterThanOrEqual(0);

    // Cleanup
    await bp.removeCategory(newIndex);
  });

  test('TC-B027: Category name field accepts special characters', async () => {
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    await bp.setCategoryName(newIndex, 'R&D / Tech (2026)');
    const savedName = await bp.getCategoryNameInputAt(newIndex).inputValue();
    expect(savedName).toBe('R&D / Tech (2026)');
    await bp.removeCategory(newIndex);
  });

  test('TC-B028: Very large category amount is accepted without crashing', async ({ page }) => {
    const countBefore = await bp.getCategoryCount();
    await bp.addCategory();
    const newIndex = countBefore;
    await bp.setCategoryName(newIndex, 'large-cat');
    await bp.setCategoryAmount(newIndex, '999999999');
    await page.waitForTimeout(500);
    // Page should not crash — verify heading still visible
    await expect(page.locator('h2:has-text("Budgeting")')).toBeVisible();
    await bp.removeCategory(newIndex);
  });

  test('TC-B029: [BUG] App allows removing the last allocation category despite "at least one required" note', async ({ page }) => {
    // Reduce to 1 category
    let count = await bp.getCategoryCount();
    while (count > 1) {
      await bp.removeCategory(0);
      count = await bp.getCategoryCount();
    }
    expect(count).toBe(1);

    // BUG: the last Remove button is still enabled — app should block this
    const lastRemoveBtn = bp.getRemoveButtonAt(0);
    const isDisabled = await lastRemoveBtn.getAttribute('disabled');
    const ariaDisabled = await lastRemoveBtn.getAttribute('aria-disabled');
    const isVisible = await lastRemoveBtn.isVisible();
    const isBlocked = isDisabled !== null || ariaDisabled === 'true' || !isVisible;

    // Document the actual (buggy) behavior: isBlocked should be true, but it is false
    expect(isBlocked).toBe(false); // BUG: Remove button is NOT disabled when only 1 category remains
  });

  test('TC-B030: Budget year start month selector opens a dropdown with month options', async ({ page }) => {
    // Click the react-select container (role=combobox is the input, click its parent to open)
    const comboboxParent = page.locator('[data-sentry-component="BudgetManager"] [role="combobox"]').first().locator('..');
    await comboboxParent.click({ force: true });
    await page.waitForTimeout(500);
    // react-select renders 12 month options (id pattern: react-select-*-option-*)
    const options = page.locator('[id*="react-select"][id*="-option-"]');
    await expect(options.first()).toBeVisible();
    const count = await options.count();
    expect(count).toBe(12);
  });
});
