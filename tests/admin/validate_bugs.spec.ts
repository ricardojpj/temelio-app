import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const ADMIN_SETTINGS_URL = '/foundation/3b4d585c-d03c-481f-b8f9-ecf773e768ab/settings';
const ADMIN_URL = '/foundation/3b4d585c-d03c-481f-b8f9-ecf773e768ab/settings/admin';
const CONTACTS_URL = '/foundation/3b4d585c-d03c-481f-b8f9-ecf773e768ab/contacts';

async function goToBudgeting(page: any) {
  await page.goto(ADMIN_URL);
  await page.waitForTimeout(2000);
}

// BUG-001: Budgeting data resets between sessions
test('BUG-001: Budgeting categories persist', async ({ page }) => {
  await goToBudgeting(page);
  await page.screenshot({ path: '/tmp/BUG-001.png' });
  // Check if any category rows exist
  const hasCategories = await page.locator('input[type="text"], input[type="number"]').count();
  console.log('BUG-001: category input count =', hasCategories);
  // Also capture page text for context
  const bodyText = await page.locator('body').innerText();
  console.log('BUG-001: page content sample =', bodyText.slice(0, 500));
});

// BUG-002: Last category can be removed
test('BUG-002: Remove button state with one category', async ({ page }) => {
  await goToBudgeting(page);
  await page.screenshot({ path: '/tmp/BUG-002.png' });
  const removeButtons = page.locator('button').filter({ hasText: /remove/i });
  const count = await removeButtons.count();
  console.log('BUG-002: remove button count =', count);
  if (count > 0) {
    const isDisabled = await removeButtons.first().isDisabled();
    console.log('BUG-002: first remove button disabled =', isDisabled);
  }
});

// BUG-003 & BUG-004: Duplicate IDs
test('BUG-003/004: Duplicate checkbox IDs in MFA and Assigned To Me', async ({ page }) => {
  await page.goto('/foundation/3b4d585c-d03c-481f-b8f9-ecf773e768ab/settings/authentication');
  await page.waitForTimeout(3000);
  const result = await page.evaluate(() => {
    const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
    const counts: Record<string, number> = {};
    allIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    const duplicates = Object.entries(counts).filter(([_, c]) => c > 1);
    return duplicates;
  });
  console.log('BUG-003/004: duplicate IDs =', JSON.stringify(result));
  await page.screenshot({ path: '/tmp/BUG-003-004.png' });
});

// BUG-005: Misleading "(Planned Giving)" label
test('BUG-005: Planned Giving label on total budget field', async ({ page }) => {
  await goToBudgeting(page);
  const found = await page.locator('text=Planned Giving').count();
  console.log('BUG-005: "Planned Giving" occurrences =', found);
  await page.screenshot({ path: '/tmp/BUG-005.png' });
});

// BUG-006: Fiscal year nav chevrons no aria-label
test('BUG-006: Fiscal year chevrons missing aria-label', async ({ page }) => {
  await goToBudgeting(page);
  const result = await page.evaluate(() => {
    const chevrons = Array.from(document.querySelectorAll('button')).filter(b =>
      (b.textContent?.trim() === '<' || b.textContent?.trim() === '>' ||
       b.innerHTML.includes('chevron') || b.innerHTML.includes('arrow'))
      && !b.getAttribute('aria-label')
    );
    return chevrons.map(b => ({ text: b.textContent?.trim(), html: b.outerHTML.slice(0, 200) }));
  });
  console.log('BUG-006: chevrons without aria-label =', JSON.stringify(result));
  await page.screenshot({ path: '/tmp/BUG-006.png' });
});

// BUG-007: Archive Grant Type no tooltip
test('BUG-007: Archive Grant Type button aria-label and tooltip', async ({ page }) => {
  await page.goto(ADMIN_URL);
  await page.waitForTimeout(2000);
  const archiveButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button[aria-label="Archive Grant Type"]'))
      .map(b => ({ ariaLabel: b.getAttribute('aria-label'), title: b.getAttribute('title') }));
  });
  console.log('BUG-007: archive buttons =', JSON.stringify(archiveButtons));
  await page.screenshot({ path: '/tmp/BUG-007.png' });
});

// BUG-008: INVALID per user — skipping

// BUG-009: Tailwind deprecation warnings
test('BUG-009: Tailwind deprecation warnings in console', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'warning' && msg.text().match(/lightBlue|warmGray|trueGray|coolGray|blueGray/))
      warnings.push(msg.text());
  });
  await page.goto(ADMIN_SETTINGS_URL);
  await page.waitForTimeout(2000);
  console.log('BUG-009: tailwind warnings =', warnings.length, warnings);
});

// BUG-010: Console errors double slash in href
test('BUG-010: Console errors invalid href double slash', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(CONTACTS_URL);
  await page.waitForTimeout(3000);
  const doubleSlash = errors.filter(e => e.includes('//') && e.includes('href'));
  console.log('BUG-010: double-slash href errors =', doubleSlash.length, doubleSlash);
  await page.screenshot({ path: '/tmp/BUG-010.png' });
});

// BUG-011: Empty state no explanation
test('BUG-011: Contacts empty state message', async ({ page }) => {
  await page.goto(CONTACTS_URL);
  await page.waitForTimeout(3000);
  const emptyText = await page.locator('text=No data available').count();
  console.log('BUG-011: "No data available" count =', emptyText);
  await page.screenshot({ path: '/tmp/BUG-011.png' });
});

// BUG-012: Bulk Actions button visible with no data
test('BUG-012: Bulk Actions visible with no selection', async ({ page }) => {
  await page.goto(CONTACTS_URL);
  await page.waitForTimeout(3000);
  const bulkBtn = page.locator('button').filter({ hasText: /bulk actions/i });
  const count = await bulkBtn.count();
  const visible = count > 0 ? await bulkBtn.first().isVisible() : false;
  const disabled = count > 0 ? await bulkBtn.first().isDisabled() : true;
  console.log('BUG-012: bulk actions visible =', visible, '| disabled =', disabled);
  await page.screenshot({ path: '/tmp/BUG-012.png' });
});

// BUG-013: Checkboxes no id no aria-label
test('BUG-013: Contacts table checkboxes missing label/id', async ({ page }) => {
  await page.goto(CONTACTS_URL);
  await page.waitForTimeout(3000);
  const result = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="checkbox"]'))
      .map(cb => ({
        id: cb.id,
        ariaLabel: cb.getAttribute('aria-label'),
        hasLabel: !!document.querySelector(`label[for="${cb.id}"]`)
      }))
      .filter(cb => !cb.id && !cb.ariaLabel);
  });
  console.log('BUG-013: checkboxes missing id+ariaLabel =', result.length);
  await page.screenshot({ path: '/tmp/BUG-013.png' });
});

// BUG-014: Clear filter visible with no filter active
test('BUG-014: Clear filter visible without active filter', async ({ page }) => {
  await page.goto(CONTACTS_URL);
  await page.waitForTimeout(3000);
  const clearBtn = page.locator('button').filter({ hasText: /clear filter/i });
  const iconClear = page.locator('[aria-label*="clear" i], [title*="clear" i]');
  const count1 = await clearBtn.count();
  const count2 = await iconClear.count();
  console.log('BUG-014: clear filter visible =', count1 + count2);
  await page.screenshot({ path: '/tmp/BUG-014.png' });
});
