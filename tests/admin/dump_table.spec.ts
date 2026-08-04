import { test } from '@playwright/test';
import * as fs from 'fs';

test('dump table dom', async ({ page }) => {
  await page.goto('/foundation/3b4d585c-d03c-481f-b8f9-ecf773e768ab/proposals');
  // Wait for table rows to be present
  await page.locator('[data-pw="table-checkbox-0"]').first().waitFor({ state: 'visible' });
  const info = await page.evaluate(() => {
    const header = document.querySelector('[data-pw="table-header-group"]');
    if (header) return header.outerHTML.slice(0, 3000);
    return Array.from(document.querySelectorAll('[data-pw]'))
      .map(e => e.getAttribute('data-pw'))
      .filter((v,i,a) => a.indexOf(v) === i)
      .sort()
      .join('\n');
  });
  fs.writeFileSync('/tmp/table_dom.html', info);
});
