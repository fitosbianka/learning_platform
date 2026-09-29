/**
 * Small development helper. Opens one route of the running dev server
 * (or a preview server) in headless Chromium, reports console messages
 * and page errors and saves a full page screenshot.
 *
 * Usage: node scripts/shot.mjs "/lektion/3" out.png [width]
 */

import { chromium } from 'playwright';

const route = process.argv[2] ?? '/';
const out = process.argv[3] ?? 'shot.png';
const width = Number(process.argv[4] ?? 1280);
const base = process.env.SHOT_BASE ?? 'http://localhost:5173';

const browser = await chromium.launch({
  executablePath: process.env.SHOT_BROWSER ?? '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width, height: 900 } });

/** @type {string[]} */
const messages = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    messages.push(`${msg.type()}: ${msg.text()}`);
  }
});
page.on('pageerror', (err) => messages.push(`pageerror: ${err.message}`));

await page.goto(`${base}/#${route}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: true });
await browser.close();

if (messages.length > 0) {
  console.log('CONSOLE ISSUES');
  for (const m of messages) console.log(`  ${m}`);
  process.exit(2);
}
console.log(`ok ${route} -> ${out}`);
