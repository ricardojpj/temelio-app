import { Page, Locator } from '@playwright/test';

export class AdminPage {
  readonly page: Page;

  // Team section
  readonly addTeamMemberButton: Locator;
  readonly teamHeading: Locator;

  // AI Feature Controls
  readonly aiFeaturesToggle: Locator;
  readonly aiAssistantForGranteesToggle: Locator;
  readonly formTranslationToggle: Locator;

  // Global Configurations
  readonly currencySelect: Locator;
  readonly timezoneSelect: Locator;
  readonly replyToEmailInput: Locator;
  readonly addFoundationTagButton: Locator;
  readonly addCustomGrantTypeButton: Locator;
  readonly addGrantProgramAreaButton: Locator;

  // Budgeting
  readonly budgetYearStartSelect: Locator;
  readonly budgetYearMenuButton: Locator;
  readonly totalBudgetInput: Locator;
  readonly addBudgetCategoryButton: Locator;

  // Other
  readonly updateBrandingButton: Locator;
  readonly changeBrandingButton: Locator;
  readonly mergeNonprofitsButton: Locator;
  readonly sourceEntitySelect: Locator;
  readonly destinationEntitySelect: Locator;
  readonly senderEmailInput: Locator;
  readonly granteeNpsSurveyToggle: Locator;
  readonly charityCheckNotificationsToggle: Locator;
  readonly mfaForGranteesToggle: Locator;
  readonly mfaForFoundationUsersToggle: Locator;
  readonly hideReportsPastInput: Locator;
  readonly hidePaymentsPastInput: Locator;
  readonly configureCustomPaymentStatusButton: Locator;
  readonly configureReminderScheduleButton: Locator;
  readonly configureProposalIdTemplateButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Team
    this.addTeamMemberButton = page.getByRole('button', { name: 'Team Member' });
    this.teamHeading = page.getByRole('heading', { name: /^Team/ });

    // AI Feature Controls
    this.aiFeaturesToggle = page.locator('label:has-text("AI Features Off") + label input[type="checkbox"]');
    this.aiAssistantForGranteesToggle = page.locator('label:has-text("AI Assistant for Grantees Off") + label input[type="checkbox"]');
    this.formTranslationToggle = page.locator('label:has-text("Form Translation Off") + label input[type="checkbox"]');

    // Global Configurations
    this.currencySelect = page.locator('#react-select-5-input');
    this.timezoneSelect = page.locator('#select-timezone input');
    this.replyToEmailInput = page.locator('input[type="email"][placeholder="Enter email"]');
    this.addFoundationTagButton = page.locator('[data-ph-capture-attribute-analytics-id="settings-add-tag"]');
    this.addCustomGrantTypeButton = page.locator('p:has-text("Custom Grant Types") ~ div button:has-text("Add")').first();
    this.addGrantProgramAreaButton = page.locator('p:has-text("Grant Program Areas") ~ div button:has-text("Add")').first();

    // Budgeting
    this.budgetYearStartSelect = page.locator('#react-select-7-input');
    this.budgetYearMenuButton = page.locator('#menu-button-\\:r91\\:');
    this.totalBudgetInput = page.locator('label:has-text("Total budget year grant budget") + input, input[min="0"][class*="css-4a3b01"]');
    this.addBudgetCategoryButton = page.locator('h2:has-text("Allocation categories") ~ button:has-text("Add")');

    // Other
    this.updateBrandingButton = page.getByRole('button', { name: 'Update' });
    this.changeBrandingButton = page.getByRole('button', { name: 'Change' });
    this.mergeNonprofitsButton = page.getByRole('button', { name: 'Merge Nonprofits' });
    this.sourceEntitySelect = page.locator('#react-select-8-input');
    this.destinationEntitySelect = page.locator('#react-select-9-input');
    this.senderEmailInput = page.locator('[data-pw="sender-email-input"]');
    this.granteeNpsSurveyToggle = page.locator('label:has-text("Ask Grantees to Fill NPS Survey") + label input[type="checkbox"]');
    this.charityCheckNotificationsToggle = page.locator('label:has-text("Send email notifications for nonprofits with invalid EINs") + label input[type="checkbox"]');
    this.mfaForGranteesToggle = page.locator('label:has-text("Require Multi Factor Authentication for all grantees") + label input[type="checkbox"]');
    this.mfaForFoundationUsersToggle = page.locator('label:has-text("Require Multi Factor Authentication for all foundation users") + label input[type="checkbox"]');
    this.hideReportsPastInput = page.locator('input[type="number"][placeholder="0"]').first();
    this.hidePaymentsPastInput = page.locator('input[type="number"][placeholder="0"]').last();
    this.configureCustomPaymentStatusButton = page.getByRole('button', { name: 'Configure' });
    this.configureReminderScheduleButton = page.getByRole('button', { name: 'Configure Custom Reminder Schedule' });
    this.configureProposalIdTemplateButton = page.getByRole('button', { name: 'Configure Internal Proposal ID Template' });
  }

  async getTeamMemberCount(): Promise<number> {
    const text = await this.teamHeading.textContent();
    const match = text?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getGrantTypeNames(): Promise<string[]> {
    const buttons = this.page.locator('[data-sentry-component="EditableGrantType"] button.chakra-button:first-child');
    return buttons.allTextContents();
  }

  async getBudgetCategories(): Promise<{ name: string; amount: string }[]> {
    const rows = this.page.locator('.css-rdwj84');
    const count = await rows.count();
    const result: { name: string; amount: string }[] = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const name = await row.locator('input[id^="field-"]').inputValue();
      const amount = await row.locator('input[type="number"]').inputValue();
      result.push({ name, amount });
    }
    return result;
  }

  async getTotalAllocated(): Promise<string> {
    return this.page.locator('p:has-text("Total Allocated:")').textContent() ?? '';
  }

  async getRemaining(): Promise<string> {
    return this.page.locator('p:has-text("Remaining:")').textContent() ?? '';
  }
}
