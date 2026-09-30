/* global document */
/**
 * End to end check of the device sync on the production build. Browser
 * contexts play MacBook, phone and tablet; the /api/sync endpoint is
 * stubbed with an in memory record, exactly like the real function
 * stores it in Redis. Covers lessons, cards and notes travelling in
 * both directions, deletions, the instant push when the app goes
 * hidden, the pairing link healing a stray device with its own code,
 * and the friendly hint when the cloud store is not set up yet.
 *
 * Usage: node scripts/qa-sync.mjs   (expects the preview server on :4173)
 */

import { chromium } from 'playwright';

const base = process.env.QA_BASE ?? 'http://localhost:4173';
const executablePath = process.env.SHOT_BROWSER ?? '/opt/pw-browsers/chromium';

/** @type {Record<string, { finishedLessons?: number[], cards?: { deleted?: boolean }[], notes?: { html?: string }[] } | undefined>} */
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

  // Device A writes a learn card and a note, device B receives both.
  await pageA.goto(`${base}/#/anki`, { waitUntil: 'networkidle' });
  await pageA.getByRole('button', { name: 'Neue Karte' }).click();
  await pageA.getByLabel('Frage', { exact: true }).fill('Wie viele Wurzeln hat ein Sechser?');
  await pageA.getByLabel('Antwort', { exact: true }).fill('Meist drei.');
  await pageA.getByRole('button', { name: 'Speichern' }).click();
  await pageA.getByText('Heute 1 Karte zum Wiederholen').waitFor();
  await pageA.goto(`${base}/#/lektion/1`, { waitUntil: 'networkidle' });
  await pageA.getByRole('button', { name: 'Notizen', exact: true }).click();
  await pageA.getByRole('textbox', { name: 'Notizen zu Lektion 1' }).click();
  await pageA.keyboard.type('Der Sechser kommt zuerst.');
  await pageA.getByRole('button', { name: 'Speichern' }).click();
  await waitUntil(() => {
    const data = records[code];
    return Boolean(
      data &&
        data.cards?.length === 1 &&
        data.notes?.some((n) => (n.html ?? '').includes('Der Sechser kommt zuerst.')),
    );
  }, 'card and note in the cloud record');
  await pageB.goto(`${base}/#/anki`, { waitUntil: 'networkidle' });
  await pageB.reload({ waitUntil: 'networkidle' });
  await pageB.getByText('Wie viele Wurzeln hat ein Sechser?').waitFor();
  await pageB.goto(`${base}/#/notizen`, { waitUntil: 'networkidle' });
  await pageB.getByText('Der Sechser kommt zuerst.').waitFor();
  console.log('device B received the card and the note from device A');

  // Device B deletes the card, the tombstone reaches device A.
  await pageB.goto(`${base}/#/anki`, { waitUntil: 'networkidle' });
  await pageB.locator('li', { hasText: 'Wie viele Wurzeln hat ein Sechser?' }).getByRole('button', { name: 'Löschen' }).click();
  await pageB.getByRole('button', { name: 'Ja, löschen' }).click();
  await waitUntil(() => Boolean(records[code]?.cards?.[0]?.deleted), 'card tombstone in the cloud record');
  await pageA.goto(`${base}/#/anki`, { waitUntil: 'networkidle' });
  await pageA.reload({ waitUntil: 'networkidle' });
  await pageA.getByText(/Noch keine Lernkarten/).waitFor();
  console.log('the deletion from device B reached device A');

  // The background flush. A change reaches the cloud the moment the
  // app goes hidden, well before the slow two and a half second timer.
  await markRead(pageA, 3);
  await pageA.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await waitUntil(() => {
    const data = records[code];
    return Boolean(data && data.finishedLessons?.includes(3));
  }, 'instant push when the app goes hidden', 2000);
  await pageA.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  console.log('a change is pushed the moment the app goes into the background');

  // Device E once enabled sync on its own and lives in a separate pot
  // with its own progress. Opening the pairing link moves it over and
  // merges everything into the shared pot.
  const deviceE = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await stubApi(deviceE);
  const pageE = await deviceE.newPage();
  watchConsole(pageE, 'device E');
  await pageE.goto(`${base}/#/einstellungen`, { waitUntil: 'networkidle' });
  await pageE.getByRole('button', { name: 'Synchronisation einschalten' }).click();
  const strayText = await pageE.locator('[class*="syncCode"]').textContent();
  const strayCode = (strayText ?? '').replace(/\s/g, '');
  await waitUntil(() => records[strayCode] !== undefined, 'first push of device E');
  await markRead(pageE, 5);
  await waitUntil(() => Boolean(records[strayCode]?.finishedLessons?.includes(5)), 'lesson 5 in the stray record');
  await pageE.goto(`${base}/#/einstellungen?verbinden=${code}`, { waitUntil: 'networkidle' });
  await pageE.getByText('Verbunden. Der Lernstand beider Geräte wurde zusammengeführt.').waitFor();
  const movedText = await pageE.locator('[class*="syncCode"]').textContent();
  if ((movedText ?? '').replace(/\s/g, '') !== code) {
    throw new Error('device E did not move to the shared code');
  }
  await waitUntil(() => Boolean(records[code]?.finishedLessons?.includes(5)), 'lesson 5 merged into the shared record');
  await pageA.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await pageA.reload({ waitUntil: 'networkidle' });
  await pageA.getByText('4 von 21 Lektionen abgeschlossen').waitFor();
  console.log('a stray device moved over through the pairing link, nothing lost');

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
  await deviceE.close();
  await browser.close();

  if (consoleIssues.length > 0) {
    console.log(`CONSOLE ISSUES (${consoleIssues.length})`);
    for (const issue of consoleIssues.slice(0, 20)) console.log(`  ${issue}`);
    process.exit(1);
  }
  console.log(
    'Sync QA clean. Lessons, cards and notes travel between devices, deletions follow, a change is pushed the moment the app goes hidden, the pairing link heals a stray device and the setup hint works.',
  );
}

await main();
