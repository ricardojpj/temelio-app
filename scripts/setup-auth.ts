import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = path.join(__dirname, '../.auth/session.json');

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: [
    '--disable-blink-features=AutomationControlled',
    '--no-first-run',
    '--no-default-browser-check',
  ],
  ignoreDefaultArgs: ['--enable-automation'],
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});

// Remove webdriver property to avoid detection
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});

const page = await context.newPage();

console.log('\n=== Temelio Login Setup ===');
console.log('Se abrirá Chrome. Haz login con tu cuenta de Google.');
console.log('Cuando estés en la página de admin, vuelve aquí y presiona Enter.\n');

await page.goto('https://app-dev.trytemelio.com/foundation/6ba45f88-82ff-4ec4-a4a3-b1e894e06f55/settings/admin');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await new Promise<void>((resolve) => {
  rl.question('Presiona Enter cuando hayas completado el login...', () => {
    rl.close();
    resolve();
  });
});

const dir = path.dirname(SESSION_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

await context.storageState({ path: SESSION_FILE });
console.log(`\n✓ Sesión guardada en ${SESSION_FILE}`);
console.log('Ya puedes correr los tests con: npm run test:admin\n');

await browser.close();
process.exit(0);
