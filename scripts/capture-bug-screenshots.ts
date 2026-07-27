import { chromium } from '@playwright/test';
import fs from 'fs';

const SESSION_FILE = '/Users/parra/Code/app-temelio/.auth/session.json';
const ADMIN_URL = 'https://app-dev.trytemelio.com/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/settings/admin';
const CONTACTS_URL = 'https://app-dev.trytemelio.com/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/contacts';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({
  storageState: SESSION_FILE,
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage();

async function scrollToText(text: string) {
  await page.evaluate((t) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent?.includes(t)) {
        (node.parentElement as HTMLElement)?.scrollIntoView({ behavior: 'instant', block: 'center' });
        break;
      }
    }
  }, text);
  await page.waitForTimeout(600);
}

// ===== ADMIN PAGE =====
await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('[data-sentry-component="BudgetManager"]', { timeout: 30000 });

// BUG-001: Budgeting data resets — categories empty, Total Allocated $0
await scrollToText('Total Allocated');
await page.screenshot({ path: '/tmp/screenshots/BUG-001-budgeting-resets.png', fullPage: false });
console.log('BUG-001 saved');

// BUG-002: Last Remove button enabled when only 1 category
await scrollToText('Allocation categories');
await page.waitForTimeout(400);
// Highlight the remove button
await page.evaluate(() => {
  const btn = document.querySelector('[data-sentry-component="BudgetManager"] button[aria-label="Remove"]') as HTMLElement;
  if (btn) {
    btn.style.outline = '3px solid red';
    btn.style.outlineOffset = '2px';
  }
  const note = document.querySelector('[data-sentry-component="BudgetManager"] p, [data-sentry-component="BudgetManager"] span') as HTMLElement;
  // highlight the "at least one required" text
  const els = document.querySelectorAll('[data-sentry-component="BudgetManager"] *');
  for (const el of els) {
    if (el.textContent?.trim() === '(at least one category is required)') {
      (el as HTMLElement).style.backgroundColor = 'rgba(255,0,0,0.15)';
      (el as HTMLElement).style.fontWeight = 'bold';
    }
  }
});
await page.screenshot({ path: '/tmp/screenshots/BUG-002-remove-last-enabled.png', fullPage: false });
console.log('BUG-002 saved');

// BUG-005: Misleading "(Planned Giving)" label
await scrollToText('Planned Giving');
await page.evaluate(() => {
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    if (label.textContent?.includes('Planned Giving')) {
      label.style.backgroundColor = 'rgba(255,165,0,0.3)';
      label.style.outline = '2px solid orange';
    }
  }
});
await page.screenshot({ path: '/tmp/screenshots/BUG-005-planned-giving-label.png', fullPage: false });
console.log('BUG-005 saved');

// BUG-003/004: Duplicate IDs — MFA and Assigned To Me
await scrollToText('Multi Factor Authentication');
await page.waitForTimeout(400);
await page.evaluate(() => {
  // highlight both MFA checkboxes that share same id
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const ids: Record<string, number> = {};
  checkboxes.forEach(cb => {
    const id = cb.id;
    if (id) ids[id] = (ids[id] || 0) + 1;
  });
  checkboxes.forEach(cb => {
    if (cb.id && ids[cb.id] > 1) {
      (cb.closest('div, label, [role="group"]') as HTMLElement)?.style &&
        ((cb.closest('[role="group"]') as HTMLElement)!.style.outline = '2px dashed red');
      (cb as HTMLElement).style.outline = '3px solid red';
    }
  });
});
await page.screenshot({ path: '/tmp/screenshots/BUG-003-004-duplicate-ids-mfa.png', fullPage: false });
console.log('BUG-003/004 saved');

// BUG-006: Fiscal year nav chevrons — open menu first
await scrollToText('Budget Year');
await page.waitForTimeout(300);
const menuBtn = page.locator('[data-sentry-component="BudgetManager"] .chakra-menu__menu-button');
await menuBtn.click();
await page.locator('[data-sentry-source-file="year-selector.tsx"][role="menu"]').waitFor({ state: 'visible', timeout: 8000 });
await page.evaluate(() => {
  const btns = document.querySelectorAll('[data-sentry-source-file="year-selector.tsx"] .chakra-button.css-lzgbdm');
  btns.forEach(btn => {
    (btn as HTMLElement).style.outline = '3px solid red';
    (btn as HTMLElement).style.outlineOffset = '2px';
  });
});
await page.screenshot({ path: '/tmp/screenshots/BUG-006-nav-chevrons-no-label.png', fullPage: false });
// close menu
await page.keyboard.press('Escape');
console.log('BUG-006 saved');

// BUG-008: Merge Nonprofits button active with empty selection
await scrollToText('Merge Nonprofits');
await page.waitForTimeout(400);
await page.evaluate(() => {
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    if (btn.textContent?.trim() === 'Merge Nonprofits') {
      btn.style.outline = '3px solid red';
      btn.style.outlineOffset = '2px';
    }
  }
});
await page.screenshot({ path: '/tmp/screenshots/BUG-008-merge-nonprofits-active.png', fullPage: false });
console.log('BUG-008 saved');

// BUG-007: Archive buttons — icon only, no tooltip
await scrollToText('Custom Grant Types');
await page.waitForTimeout(300);
await page.evaluate(() => {
  const btns = document.querySelectorAll('button[aria-label="Archive Grant Type"]');
  btns.forEach(btn => {
    (btn as HTMLElement).style.outline = '3px solid orange';
    (btn as HTMLElement).style.outlineOffset = '2px';
  });
});
await page.screenshot({ path: '/tmp/screenshots/BUG-007-archive-icon-only.png', fullPage: false });
console.log('BUG-007 saved');

// ===== CONTACTS PAGE =====
const consoleErrors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

await page.goto(CONTACTS_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);

// BUG-010: Console errors with double slash — save error text as overlay
await page.evaluate((errors) => {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#fee2e2;color:#991b1b;padding:12px 16px;font-size:12px;font-family:monospace;z-index:99999;border-bottom:2px solid #dc2626;';
  div.innerHTML = '<strong>Console Errors:</strong><br>' + errors.map(e => '• ' + e.substring(0, 120)).join('<br>');
  document.body.prepend(div);
}, consoleErrors);
await page.screenshot({ path: '/tmp/screenshots/BUG-010-console-errors-double-slash.png', fullPage: false });
console.log('BUG-010 saved');

// BUG-011/012: Empty state + Bulk Actions(0) visible
await page.reload();
await page.waitForTimeout(2500);
await page.evaluate(() => {
  // Highlight Bulk Actions (0)
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    if (btn.textContent?.includes('Bulk Actions')) {
      btn.style.outline = '3px solid red';
      btn.style.outlineOffset = '2px';
    }
  }
  // highlight "No data available"
  const els = document.querySelectorAll('*');
  for (const el of els) {
    if (el.childElementCount === 0 && el.textContent?.trim() === 'No data available') {
      (el as HTMLElement).style.backgroundColor = 'rgba(255,0,0,0.15)';
      (el as HTMLElement).style.outline = '2px dashed red';
      (el as HTMLElement).style.padding = '4px';
    }
  }
});
await page.screenshot({ path: '/tmp/screenshots/BUG-011-012-empty-state-bulk-actions.png', fullPage: false });
console.log('BUG-011/012 saved');

// BUG-013: Checkboxes without label
await page.evaluate(() => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (!cb.id && !cb.getAttribute('aria-label')) {
      (cb as HTMLElement).style.outline = '3px solid red';
      (cb as HTMLElement).style.outlineOffset = '3px';
      const parent = cb.closest('th, td, div') as HTMLElement;
      if (parent) parent.style.backgroundColor = 'rgba(255,0,0,0.1)';
    }
  });
});
await page.screenshot({ path: '/tmp/screenshots/BUG-013-checkboxes-no-label.png', fullPage: false });
console.log('BUG-013 saved');

// BUG-014: Clear filter visible without active filter
await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="Clear filter"]') as HTMLElement;
  if (btn) {
    btn.style.outline = '3px solid red';
    btn.style.outlineOffset = '2px';
    // Add label
    const label = document.createElement('span');
    label.textContent = ' ← BUG-014: visible without active filter';
    label.style.cssText = 'color:red;font-size:11px;font-weight:bold;margin-left:4px;';
    btn.parentElement?.appendChild(label);
  }
});
await page.screenshot({ path: '/tmp/screenshots/BUG-014-clear-filter-no-filter.png', fullPage: false });
console.log('BUG-014 saved');

await browser.close();
console.log('\nAll bug screenshots saved to /tmp/screenshots/');
