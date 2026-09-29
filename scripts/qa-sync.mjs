/**
 * End to end check of the device sync on the production build. Two
 * browser contexts play MacBook and phone; the /api/sync endpoint is
 * stubbed with an in memory record, exactly like the real function
 * stores it in Redis. Also checks the pairing link and the friendly
 * hint when the cloud store is not set up yet.
 *
 * Usage: node scripts/qa-sync.mjs   (expects the preview server on :4173)
 */

import { chromium } from 'playwright';

const base = process.env.QA_BASE ?? 'http://localhost:4173';
const executablePath = process.env.SHOT_BROWSER ?? '/opt/pw-browsers/chromium';

/** @type {Record<string, { finishedLessons?: number[] } | undefined>} */
const records = {};
/** @type {string[]} */
const consoleIssues = [];

/** @param {import('playwright').BrowserContext} context @param {boolean} configured */
async function stubApi(context, configured = true) {
  await context.route('**/api/sync**', async (route) => {
    const request = route.request();
    if (!configured) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ configured: false }) });
      return;
    }
    if (request.method() === 'GET') {
      const url = new URL(request.url());
      const code = (url.searchParams.get('code') ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const data = records[code];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data === undefined ? { exists: false } : { exists: true, data }),
      });
      return;
    }
    if (request.method() === 'PUT') {
      const body = request.postDataJSON();
      records[String(body.code)] = body.data;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }
    await route.fulfill({ status: 405, contentType: 'application/json', body: '{}' });
  });
}

/** @param {import('playwright').Page} page @param {string} label */
function watchConsole(page, label) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleIssues.push(`[${label}] ${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => consoleIssues.push(`[${label}] pageerror: ${err.message}`));
}

/**
 * @param {() => boolean | Promise<boolean>} check
 * @param {string} what
 */
async function waitUntil(check, what, timeoutMs = 10000) {
  const start = Date.now();
  for (;;) {
    if (await check()) return;
    if (Date.now() - start > timeoutMs) throw new Error(`timeout waiting for ${what}`);
    await new Promise((r) => setTimeout(r, 200));
  }
}

/** @param {import('playwright').Page} page @param {number} lesson */
async function markRead(page, lesson) {
  await page.goto(`${base}/#/lektion/${lesson}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Lektion als gelesen markieren' }).click();
  await page.waitForSelector('#test');
}

async function main() {
  const browser = await chromium.launch({ executablePath });

  // Device A enables the sync and learns lesson 1.
  const deviceA = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await stubApi(deviceA);
  const pageA = await deviceA.newPage();
  watchConsole(pageA, 'device A');
  await pageA.goto(`${base}/#/einstellungen`, { waitUntil: 'networkidle' });
  await pageA.getByRole('button', { name: 'Synchronisation einschalten' }).click();
  const codeText = await pageA.locator('[class*="syncCode"]').textContent();
  const code = (codeText ?? '').replace(/\s/g, '');
  if (!/^[a-z0-9]{12}$/.test(code)) throw new Error(`unexpected code ${codeText}`);
  await waitUntil(() => records[code] !== undefined, 'first push of device A');
  console.log('device A enabled sync, code', code);

  await markRead(pageA, 1);
  await waitUntil(() => {
    const data = records[code];
    return Boolean(data && data.finishedLessons?.includes(1));
  }, 'lesson 1 in the cloud record');
  console.log('device A pushed lesson 1');

  // Device B joins with the spaced code and sees the progress.
  const deviceB = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await stubApi(deviceB);
  const pageB = await deviceB.newPage();
  watchConsole(pageB, 'device B');
  await pageB.goto(`${base}/#/einstellungen`, { waitUntil: 'networkidle' });
  const spaced = code.replace(/(.{4})(?=.)/g, '$1 ').toUpperCase();
  await pageB.getByLabel('Code vom anderen Gerät').fill(spaced);
  await pageB.getByRole('button', { name: 'Mit Code verbinden' }).click();
  await pageB.getByText('Verbunden. Der Lernstand beider Geräte wurde zusammengeführt.').waitFor();
  await pageB.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await pageB.getByText('1 von 21 Lektionen abgeschlossen').waitFor();
  console.log('device B joined and sees lesson 1');

  // Device B learns lesson 2, device A picks it up after a reload.
  await markRead(pageB, 2);
  await waitUntil(() => {
    const data = records[code];
    return Boolean(data && data.finishedLessons?.includes(2));
  }, 'lesson 2 in the cloud record');
  await pageA.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await pageA.reload({ waitUntil: 'networkidle' });
  await pageA.getByText('2 von 21 Lektionen abgeschlossen').waitFor({ timeout: 10000 });
  console.log('device A pulled lesson 2 from device B');

  // A third device joins through the pairing link.
  const deviceC = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await stubApi(deviceC);
  const pageC = await deviceC.newPage();
  watchConsole(pageC, 'device C');
  await pageC.goto(`${base}/#/einstellungen?verbinden=${code}`, { waitUntil: 'networkidle' });
  await pageC.getByText('Verbunden. Der Lernstand beider Geräte wurde zusammengeführt.').waitFor();
  await pageC.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await pageC.getByText('2 von 21 Lektionen abgeschlossen').waitFor();
  console.log('device C joined through the pairing link');

  // Without the cloud store the app explains what to do.
  const deviceD = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await stubApi(deviceD, false);
  const pageD = await deviceD.newPage();
  watchConsole(pageD, 'device D');
  await pageD.goto(`${base}/#/einstellungen`, { waitUntil: 'networkidle' });
  await pageD.getByRole('button', { name: 'Synchronisation einschalten' }).click();
  await pageD.getByText(/Cloudablage ist noch nicht eingerichtet/).waitFor();
  console.log('missing store shows the setup hint');

  await deviceA.close();
  await deviceB.close();
  await deviceC.close();
  await deviceD.close();
  await browser.close();

  if (consoleIssues.length > 0) {
    console.log(`CONSOLE ISSUES (${consoleIssues.length})`);
    for (const issue of consoleIssues.slice(0, 20)) console.log(`  ${issue}`);
    process.exit(1);
  }
  console.log('Sync QA clean. Two devices, pairing link and setup hint all work.');
}

await main();
