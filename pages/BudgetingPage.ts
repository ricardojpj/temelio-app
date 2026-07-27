import { Page, Locator } from '@playwright/test';

const FOUNDATION_ID = '6ba45f88-82ff-4ec4-a4a3-b1e894e06f55';
export const ADMIN_URL = `/foundation/${FOUNDATION_ID}/settings/admin`;

export class BudgetingPage {
  readonly page: Page;

  // The react-select click target (has data-value="" attribute — stable across CSS regens)
  readonly budgetYearStartClickTarget: Locator;
  // Budget year selector button (opens fiscal year menu)
  readonly budgetYearMenuButton: Locator;
  // Total budget input (MoneyMaskInput, type=text showing $xxx,xxx)
  readonly totalBudgetInput: Locator;
  // "Add" button for allocation categories
  readonly addCategoryButton: Locator;
  // "Total Allocated:" summary line
  readonly totalAllocatedText: Locator;
  // "Remaining:" summary line
  readonly remainingText: Locator;
  // "Allocation categories" heading
  readonly allocationCategoriesHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // react-select click target — the div[data-value=""] that intercepts pointer events
    // Using data-value attribute which is stable (not tied to Emotion CSS hash)
    this.budgetYearStartClickTarget = page
      .locator('[data-sentry-component="BudgetManager"] [role="combobox"]')
      .first()
      .locator('..');
    // Use text-based locator for the menu button (stable across ID changes)
    this.budgetYearMenuButton = page
      .locator('[data-sentry-component="BudgetManager"] [data-sentry-source-file="year-selector.tsx"].chakra-menu__menu-button');
    this.totalBudgetInput = page.locator('input[data-sentry-element="MoneyMaskInput"]');
    this.addCategoryButton = page
      .locator('[data-sentry-component="BudgetManager"] button:has-text("Add")');
    this.totalAllocatedText = page.locator('p:has-text("Total Allocated:")');
    this.remainingText = page.locator('p:has-text("Remaining:")');
    this.allocationCategoriesHeading = page.locator('h2:has-text("Allocation categories"), p:has-text("Allocation categories")');
  }

  /** Returns all category rows: [{nameInput, amountInput, removeButton, addSubButton}] */
  getCategoryRows() {
    // Each row has a text input (name) + number input (amount) + two action buttons
    return this.page.locator('[data-sentry-component="BudgetManager"] .chakra-input.css-1t5sxli');
  }

  getCategoryNameInputAt(index: number): Locator {
    return this.page.locator('[data-sentry-component="BudgetManager"] .chakra-input.css-1t5sxli').nth(index);
  }

  getCategoryAmountInputAt(index: number): Locator {
    return this.page.locator('[data-sentry-component="BudgetManager"] input[type="number"].chakra-input').nth(index);
  }

  getRemoveButtonAt(index: number): Locator {
    return this.page.locator('[data-sentry-component="BudgetManager"] button[aria-label="Remove"]').nth(index);
  }

  getAddSubButtonAt(index: number): Locator {
    return this.page.locator('[data-sentry-component="BudgetManager"] button[aria-label="Add sub"]').nth(index);
  }

  getFiscalYearMenuItem(label: string): Locator {
    return this.page.locator(`button[aria-label="Select fiscal year ${label}"]`);
  }

  async openFiscalYearMenu(): Promise<void> {
    await this.budgetYearMenuButton.click();
    // Wait specifically for the fiscal year menu (year-selector) to become visible
    await this.page.locator('[data-sentry-source-file="year-selector.tsx"][role="menu"]').waitFor({ state: 'visible', timeout: 10000 });
  }

  async selectFiscalYear(label: string): Promise<void> {
    await this.openFiscalYearMenu();
    await this.getFiscalYearMenuItem(label).click();
    await this.page.waitForTimeout(500);
  }

  async getTotalAllocatedAmount(): Promise<string> {
    const text = await this.totalAllocatedText.textContent();
    return text?.replace('Total Allocated:', '').trim() ?? '';
  }

  async getRemainingAmount(): Promise<string> {
    const text = await this.remainingText.textContent();
    return text?.replace('Remaining:', '').trim() ?? '';
  }

  async getCategoryCount(): Promise<number> {
    return this.getCategoryRows().count();
  }

  async addCategory(): Promise<void> {
    const countBefore = await this.getCategoryCount();
    await this.addCategoryButton.click();
    await this.page.waitForFunction(
      (before: number) => {
        const rows = document.querySelectorAll('[data-sentry-component="BudgetManager"] .chakra-input.css-1t5sxli');
        return rows.length > before;
      },
      countBefore,
      { timeout: 5000 }
    );
  }

  async setTotalBudget(amount: string): Promise<void> {
    await this.totalBudgetInput.triple_click?.();
    await this.totalBudgetInput.click({ clickCount: 3 });
    await this.totalBudgetInput.fill(amount);
    await this.totalBudgetInput.press('Tab');
    await this.page.waitForTimeout(500);
  }

  async setCategoryName(index: number, name: string): Promise<void> {
    const input = this.getCategoryNameInputAt(index);
    await input.click({ clickCount: 3 });
    await input.fill(name);
    await input.press('Tab');
    await this.page.waitForTimeout(300);
  }

  async setCategoryAmount(index: number, amount: string): Promise<void> {
    const input = this.getCategoryAmountInputAt(index);
    await input.click({ clickCount: 3 });
    await input.fill(amount);
    await input.press('Tab');
    await this.page.waitForTimeout(300);
  }

  async removeCategory(index: number): Promise<void> {
    const countBefore = await this.getCategoryCount();
    await this.getRemoveButtonAt(index).click();
    await this.page.waitForFunction(
      (before: number) => {
        const rows = document.querySelectorAll('[data-sentry-component="BudgetManager"] .chakra-input.css-1t5sxli');
        return rows.length < before;
      },
      countBefore,
      { timeout: 5000 }
    );
  }
}
