import { test, expect } from '@playwright/test';
import { ProposalPage, PROPOSALS_URL } from '../../pages/ProposalPage';

test.describe('Proposal - Team Section', () => {
    let proposalPage: ProposalPage;

    test.beforeEach(async ({ page }) => {
        proposalPage = new ProposalPage(page);
      await page.goto(PROPOSALS_URL);
    });

    test('TC-001: Bulk method for all checkboxes', async ({ page }) => {
      await proposalPage.clickRowCheckBox(0);
      await proposalPage.clickBulkActionButton();
      await proposalPage.clickBulkSettingsUpdate();
      await proposalPage.bulkSetAmoutRequestAmount('500');
      await proposalPage.clickBulkUpdateConfirmButton();

      const fundingText = proposalPage.getRowFundingRequested(0);
      await expect(fundingText).toHaveText('$500.00');
    });

    test('TC-002: Bulk update two rows', async ({ page }) => {
      await proposalPage.clickRowCheckBox(0);
      await proposalPage.clickRowCheckBox(1);
      await proposalPage.clickBulkActionButton();
      await proposalPage.clickBulkSettingsUpdate();
      await proposalPage.bulkSetAmoutRequestAmount('750');
      await proposalPage.clickBulkUpdateConfirmButton();

      await expect(proposalPage.getRowFundingRequested(0)).toHaveText('$750.00');
      await expect(proposalPage.getRowFundingRequested(1)).toHaveText('$750.00');
    });

    test('TC-003: Bulk update all rows via select all', async ({ page }) => {
      await proposalPage.selectAllCheckbox.first().waitFor({ state: 'visible' });
      await proposalPage.selectAllCheckbox.first().click();
      await proposalPage.clickBulkActionButton();
      await proposalPage.clickBulkSettingsUpdate();
      await proposalPage.bulkSetAmoutRequestAmount('999');
      await proposalPage.clickBulkUpdateConfirmButton();

      const rows = page.locator('[data-pw="table-rows"]').first().locator('> div');
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const cell = rows.nth(i).locator('[data-index="4"] [data-sentry-component="GeneralTableTextCell"] > div');
        await expect(cell).toHaveText('$999.00');
      }
    });
});
