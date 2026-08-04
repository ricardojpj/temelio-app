import { Page, Locator } from 'playwright/test';

export const PROPOSALS_URL = '/foundation/3b4d585c-d03c-481f-b8f9-ecf773e768ab/proposals';

export class ProposalPage {
  readonly page: Page;

  // Stage filters
  readonly buttonDraft: Locator;
  readonly buttonSubmitted: Locator;
  readonly buttonInReview: Locator;
  readonly buttonPending: Locator;
  readonly buttonApproved: Locator;
  readonly buttonRejected: Locator;

  // Toolbar
  readonly bulkActionButton: Locator;
  readonly exportCsvButton: Locator;
  readonly bulkSettingsUpdateMenuItem: Locator;

  // Table
  readonly selectAllCheckbox: Locator;
  readonly tableRows: Locator;

  // Bulk modal — set fields
  readonly bulkSetAmountRequestInput: Locator;
  readonly bulkSetAmountRequestButton: Locator;
  readonly bulkSetAwardedAmountInput: Locator;
  readonly bulkSetAwardedAmountConfirm: Locator;
  readonly bulkSetAwardedDateInput: Locator;
  readonly bulkSetAwardedDateConfirm: Locator;
  readonly bulkSetGrantPurposeInput: Locator;
  readonly bulkSetGrantPurposeConfirm: Locator;
  readonly bulkSetDeadlineInput: Locator;
  readonly bulkSetDeadlineConfirm: Locator;
  readonly bulkSetProposalTagsInput: Locator;
  readonly bulkSetProposalTagsConfirm: Locator;
  readonly bulkSetProposalViewersInput: Locator;
  readonly bulkSetProposalViewersConfirm: Locator;
  readonly bulkSetProgramAreasInput: Locator;
  readonly bulkSetProgramAreasConfirm: Locator;
  readonly bulkSetGrantStartInput: Locator;
  readonly bulkSetGrantStartConfirm: Locator;
  readonly bulkSetGrantEndInput: Locator;
  readonly bulkSetGrantEndConfirm: Locator;

  // Bulk modal — footer
  readonly bulkUpdateConfirmButton: Locator;
  readonly bulkUpdateCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Stage filters
    this.buttonDraft      = page.locator("//button//div/p[text()='Draft']");
    this.buttonSubmitted  = page.locator("//button//div/p[text()='Submitted']");
    this.buttonInReview   = page.locator("//button//div/p[text()='In Review']");
    this.buttonPending    = page.locator("//button//div/p[text()='Pending']");
    this.buttonApproved   = page.locator("//button//div/p[text()='Approved']");
    this.buttonRejected   = page.locator("//button//div/p[text()='Rejected']");

    // Toolbar
    this.bulkActionButton = page.locator('[data-pw="bulk-actions-menu"]:not([disabled])');
    this.exportCsvButton  = page.locator('[data-pw="export-proposals-csv-button"]:not([disabled])');
    this.bulkSettingsUpdateMenuItem = page.locator('[data-pw="bulk-settings-update"]');

    // Table
    this.selectAllCheckbox = page.locator('[data-sentry-component="ITableHeaderCheckbox"] .chakra-checkbox');
    this.tableRows         = page.locator('[data-pw="table-rows"]');

    // Bulk modal — set fields
    this.bulkSetAmountRequestInput   = page.locator('#bulk-set-request-amount');
    this.bulkSetAmountRequestButton  = page.locator('#bulk-set-request-amount-button');
    this.bulkSetAwardedAmountInput   = page.locator('#bulk-set-awarded-amount');
    this.bulkSetAwardedAmountConfirm = page.locator('#bulk-set-awarded-amount-button');
    this.bulkSetAwardedDateInput     = page.locator('#bulk-set-awarded-date');
    this.bulkSetAwardedDateConfirm   = page.locator('#bulk-set-awarded-date-button');
    this.bulkSetGrantPurposeInput    = page.locator('#bulk-set-grant-purpose');
    this.bulkSetGrantPurposeConfirm  = page.locator('#bulk-set-grant-purpose-button');
    this.bulkSetDeadlineInput        = page.locator('#bulk-set-deadline');
    this.bulkSetDeadlineConfirm      = page.locator('#bulk-set-deadline-button');
    this.bulkSetGrantStartInput      = page.locator('#bulk-set-grant-start');
    this.bulkSetGrantStartConfirm    = page.locator('#bulk-set-grant-start-button');
    this.bulkSetGrantEndInput        = page.locator('#bulk-set-grant-end');
    this.bulkSetGrantEndConfirm      = page.locator('#bulk-set-grant-end-button');
    this.bulkSetProposalTagsInput    = page.locator('#bulk-set-proposal-tags');
    this.bulkSetProposalTagsConfirm  = page.locator('p:text("Bulk Set Proposal Tags")').locator('xpath=../../..').locator('button[aria-label="bulk-confirm-option"]');
    this.bulkSetProposalViewersInput = page.locator('#bulk-set-proposal-viewers');
    this.bulkSetProposalViewersConfirm = page.locator('p:text("Bulk Set Proposal Viewers")').locator('xpath=../../..').locator('button[aria-label="bulk-confirm-option"]');
    this.bulkSetProgramAreasInput    = page.locator('#bulk-set-program-areas');
    this.bulkSetProgramAreasConfirm  = page.locator('p:text("Bulk Set Grant Program Areas")').locator('xpath=../../..').locator('button[aria-label="bulk-confirm-option"]');

    // Bulk modal — footer
    this.bulkUpdateConfirmButton = page.locator('#confirm-settings-update');
    this.bulkUpdateCancelButton  = page.locator('button:text("Cancel")');
  }

  // Table row methods
  getRowCheckBox(index: number): Locator {
    return this.page.locator(`[data-pw="table-checkbox-${index}"]`).first();
  }

  async clickRowCheckBox(index: number): Promise<void> {
    await this.getRowCheckBox(index).click();
  }

  getRowFundingRequested(rowIndex: number): Locator {
    return this.tableRows
      .first()
      .locator(`> div:nth-child(${rowIndex + 1})`)
      .locator('[data-index="4"]')
      .locator('[data-sentry-component="GeneralTableTextCell"] > div');
  }

  async getRowFundingRequestedText(rowIndex: number): Promise<string> {
    return this.getRowFundingRequested(rowIndex).innerText();
  }

  // Bulk action methods
  async clickBulkActionButton(): Promise<void> {
    await this.bulkActionButton.click();
  }

  async clickBulkSettingsUpdate(): Promise<void> {
    await this.bulkSettingsUpdateMenuItem.waitFor({ state: 'visible' });
    // The Chakra virtual menu renders later items (CreatePayment, etc.) on top of
    // Settings Update in screen coordinates. Use React's internal event system to
    // trigger the click handler directly on the correct DOM element.
    await this.page.evaluate(() => {
      const el = document.querySelector('[data-pw="bulk-settings-update"]') as HTMLElement;
      if (!el) throw new Error('bulk-settings-update not found');
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await this.bulkSetAmountRequestInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async bulkSetAmoutRequestAmount(amount: string): Promise<void> {
    await this.bulkSetAmountRequestInput.clear();
    await this.bulkSetAmountRequestInput.fill(amount);
    await this.bulkSetAmountRequestButton.click();
  }

  async bulkSetAwardedAmount(amount: string): Promise<void> {
    await this.bulkSetAwardedAmountInput.fill(amount);
    await this.bulkSetAwardedAmountConfirm.click();
  }

  async bulkSetAwardedDate(date: string): Promise<void> {
    await this.bulkSetAwardedDateInput.fill(date);
    await this.bulkSetAwardedDateConfirm.click();
  }

  async bulkSetGrantPurpose(purpose: string): Promise<void> {
    await this.bulkSetGrantPurposeInput.fill(purpose);
    await this.bulkSetGrantPurposeConfirm.click();
  }

  async bulkSetDeadline(datetime: string): Promise<void> {
    await this.bulkSetDeadlineInput.fill(datetime);
    await this.bulkSetDeadlineConfirm.click();
  }

  async bulkSetGrantStart(date: string): Promise<void> {
    await this.bulkSetGrantStartInput.fill(date);
    await this.bulkSetGrantStartConfirm.click();
  }

  async bulkSetGrantEnd(date: string): Promise<void> {
    await this.bulkSetGrantEndInput.fill(date);
    await this.bulkSetGrantEndConfirm.click();
  }

  async clickBulkUpdateConfirmButton(): Promise<void> {
    await this.bulkUpdateConfirmButton.click();
  }

  async cancelBulkUpdate(): Promise<void> {
    await this.bulkUpdateCancelButton.click();
  }
}
