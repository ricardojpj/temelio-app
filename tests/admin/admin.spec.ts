import { test, expect } from '@playwright/test';
import { AdminPage } from '../../pages/AdminPage';

test.describe('Admin - Team Section', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    await page.goto('/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/settings/admin');
  });

  test('TC-001: Team member count is displayed in heading', async ({ page }) => {
    const count = await adminPage.getTeamMemberCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-002: Add Team Member button is visible', async () => {
    await expect(adminPage.addTeamMemberButton).toBeVisible();
  });

  test('TC-003: Team table displays Name, Title, Email, Permissions columns', async ({ page }) => {
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Title')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Permissions')).toBeVisible();
  });

  test('TC-004: Existing team member row has options menu button', async ({ page }) => {
    const optionsButton = page.locator('[data-pw="table-rows"] button[aria-label="Options"]').first();
    await expect(optionsButton).toBeVisible();
  });
});

test.describe('Admin - AI Feature Controls', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    await page.goto('/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/settings/admin');
  });

  test('TC-005: AI Features toggle is present and unchecked by default', async () => {
    await expect(adminPage.aiFeaturesToggle).toHaveAttribute('aria-checked', 'false');
  });

  test('TC-006: AI Assistant for Grantees toggle is disabled when AI Features is off', async () => {
    await expect(adminPage.aiAssistantForGranteesToggle).toBeDisabled();
  });

  test('TC-007: Form Translation toggle is disabled when AI Features is off', async () => {
    await expect(adminPage.formTranslationToggle).toBeDisabled();
  });
});

test.describe('Admin - Global Configurations', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    await page.goto('/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/settings/admin');
  });

  test('TC-008: Currency defaults to USD - US Dollar', async ({ page }) => {
    await expect(page.locator('.css-1xa1gs2').first()).toContainText('USD - US Dollar');
  });

  test('TC-009: Timezone defaults to America/New_York', async ({ page }) => {
    await expect(page.locator('#select-timezone .css-1xa1gs2')).toContainText('America/New_York');
  });

  test('TC-010: Reply To Email input is present and empty by default', async () => {
    await expect(adminPage.replyToEmailInput).toBeVisible();
    await expect(adminPage.replyToEmailInput).toHaveValue('');
  });

  test('TC-011: Add Foundation Tag button is visible', async () => {
    await expect(adminPage.addFoundationTagButton).toBeVisible();
  });

  test('TC-012: Custom Grant Types are displayed', async () => {
    const types = await adminPage.getGrantTypeNames();
    expect(types).toContain('Capital Grant');
    expect(types).toContain('Fellowship');
    expect(types).toContain('In Kind Giving');
    expect(types).toContain('Operating Grant');
    expect(types).toContain('Project Grant');
  });

  test('TC-013: Each Custom Grant Type has an archive button', async ({ page }) => {
    const archiveButtons = page.locator('button[aria-label="Archive Grant Type"]');
    const count = await archiveButtons.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('TC-014: Add Custom Grant Type button is visible', async () => {
    await expect(adminPage.addCustomGrantTypeButton).toBeVisible();
  });
});

test.describe('Admin - Budgeting', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    await page.goto('/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/settings/admin');
  });

  test('TC-015: Budget year start month is displayed', async ({ page }) => {
    await expect(page.locator('#react-select-7-input').locator('..')).toBeVisible();
  });

  test('TC-016: Budget year menu button shows current fiscal year', async ({ page }) => {
    const budgetYearButton = page.locator('[id^="menu-button-"]').filter({ hasText: /Jun/ });
    await expect(budgetYearButton).toContainText('Jun 1, 2026 - May 31, 2027');
  });

  test('TC-017: Budget allocation categories are displayed', async () => {
    const categories = await adminPage.getBudgetCategories();
    expect(categories.length).toBeGreaterThanOrEqual(1);
    const names = categories.map(c => c.name);
    expect(names).toContain('education');
    expect(names).toContain('help');
  });

  test('TC-018: Total Allocated and Remaining amounts are shown', async () => {
    const allocated = await adminPage.getTotalAllocated();
    const remaining = await adminPage.getRemaining();
    expect(allocated).toContain('$21,000');
    expect(remaining).toContain('$79,000');
  });

  test('TC-019: Add budget category button is visible', async () => {
    await expect(adminPage.addBudgetCategoryButton).toBeVisible();
  });

  test('TC-020: Budget year selector shows fiscal year options', async ({ page }) => {
    const menuButton = page.locator('button').filter({ hasText: /Jun 1, 2026/ });
    await menuButton.click();
    await expect(page.getByRole('menuitem', { name: /Jun 1, 2021/ })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Jun 1, 2026/ })).toBeVisible();
  });
});

test.describe('Admin - Other Settings', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    await page.goto('/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/settings/admin');
  });

  test('TC-021: Organization Branding section shows Update and Change buttons', async () => {
    await expect(adminPage.updateBrandingButton).toBeVisible();
    await expect(adminPage.changeBrandingButton).toBeVisible();
  });

  test('TC-022: Merge Nonprofits button is disabled when no entities selected', async () => {
    await expect(adminPage.mergeNonprofitsButton).toBeDisabled();
  });

  test('TC-023: Source Entity select is enabled', async () => {
    await expect(adminPage.sourceEntitySelect).toBeEnabled();
  });

  test('TC-024: Destination Entity select is disabled until source is selected', async () => {
    await expect(adminPage.destinationEntitySelect).toBeDisabled();
  });

  test('TC-025: Sender Email input is disabled', async () => {
    await expect(adminPage.senderEmailInput).toBeDisabled();
  });

  test('TC-026: Grantee NPS Survey toggle is checked by default', async () => {
    await expect(adminPage.granteeNpsSurveyToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('TC-027: Charity Check Notifications toggle is unchecked by default', async () => {
    await expect(adminPage.charityCheckNotificationsToggle).toHaveAttribute('aria-checked', 'false');
  });

  test('TC-028: MFA for Grantees toggle is unchecked by default', async () => {
    await expect(adminPage.mfaForGranteesToggle).toHaveAttribute('aria-checked', 'false');
  });

  test('TC-029: MFA for Foundation Users toggle is unchecked by default', async () => {
    await expect(adminPage.mfaForFoundationUsersToggle).toHaveAttribute('aria-checked', 'false');
  });

  test('TC-030: Hide Reports Past input defaults to 0', async () => {
    await expect(adminPage.hideReportsPastInput).toHaveValue('0');
  });

  test('TC-031: Hide Payments Past input defaults to 0', async () => {
    await expect(adminPage.hidePaymentsPastInput).toHaveValue('0');
  });

  test('TC-032: Configure Custom Payment Status button is visible', async () => {
    await expect(adminPage.configureCustomPaymentStatusButton).toBeVisible();
  });

  test('TC-033: Configure Custom Reminder Schedule button is visible', async () => {
    await expect(adminPage.configureReminderScheduleButton).toBeVisible();
  });

  test('TC-034: Internal Proposal ID Template shows current template', async ({ page }) => {
    await expect(page.locator('text=Current Template: SUB-{{NUMBER}}')).toBeVisible();
  });

  test('TC-035: Assigned To Me - Viewers and Upcoming Task toggles are on by default', async ({ page }) => {
    const viewersToggle = page.locator('label:has-text("Viewers") input[type="checkbox"]');
    const upcomingTaskToggle = page.locator('label:has-text("Upcoming Task") input[type="checkbox"]');
    await expect(viewersToggle).toHaveAttribute('aria-checked', 'true');
    await expect(upcomingTaskToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('TC-036: Assigned To Me - Grant Primary Contact toggle is off by default', async ({ page }) => {
    const grantPrimaryToggle = page.locator('label:has-text("Grant Primary Contact") input[type="checkbox"]');
    await expect(grantPrimaryToggle).toHaveAttribute('aria-checked', 'false');
  });
});
