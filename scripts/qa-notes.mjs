/// <reference lib="dom" />
/* global window, document */
/**
 * Browser check for the notes feature on the production build. Covers
 * the split view in a lesson, writing on the notebook paper, the
 * formatting toolbar, saving, the notes page grouped by week, copying
 * for the notes apps, the print to PDF flow, editing from the notes
 * page, deleting and the reload.
 *
 * Usage: node scripts/qa-notes.mjs   (expects the preview server on :4173)
 */

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const shotsDir = join(root, 'screenshots');
mkdirSync(shotsDir, { recursive: true });

const base = process.env.QA_BASE ?? 'http://localhost:4173';
const executablePath = process.env.SHOT_BROWSER ?? '/opt/pw-browsers/chromium';

/** @type {string[]} */
const consoleIssues = [];
/** @type {string[]} */
const failures = [];

/** @param {import('playwright').Page} page @param {string} label */
function watchConsole(page, label) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleIssues.push(`[${label}] ${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => consoleIssues.push(`[${label}] pageerror: ${err.message}`));
}

/** @param {boolean} ok @param {string} message */
function check(ok, message) {
  if (!ok) failures.push(message);
}

/** @param {import('playwright').Page} page */
async function stubPrint(page) {
  await page.evaluate(() => {
    /** @type {Window & { __printCount?: number }} */ (window).__printCount = 0;
    window.print = () => {
      const w = /** @type {Window & { __printCount?: number }} */ (window);
      w.__printCount = (w.__printCount ?? 0) + 1;
    };
  });
}

/** @param {import('playwright').Page} page */
async function finishPrint(page) {
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await page.locator('.notePrintArea').waitFor({ state: 'detached' });
}

async function main() {
  const browser = await chromium.launch({ executablePath });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  watchConsole(page, 'notes');

  // 1. Open a lesson, open the notes pane, the split view appears.
  await page.goto(`${base}/#/lektion/2`, { waitUntil: 'networkidle' });
  await page.waitForSelector('article h1');
  await page.getByRole('button', { name: 'Notizen', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Notizen zu Lektion 2' });
  await editor.waitFor();

  const articleBox = await page.locator('article').boundingBox();
  const editorBox = await editor.boundingBox();
  check(
    articleBox !== null && editorBox !== null && editorBox.x > articleBox.x + articleBox.width - 40,
    'split view. the notes pane does not sit beside the lesson',
  );

  // The split uses the whole screen width, not the narrow reading column.
  const containerWidth = await page.evaluate(
    () => document.querySelector('.containerWide')?.getBoundingClientRect().width ?? 0,
  );
  check(containerWidth > 1150, `split view. expected full width at 1280px, got ${containerWidth}px`);

  // 2. Write a note with title, bold text and a list.
  await editor.click();
  await page.keyboard.type('Merksatz zum Gebiss');
  await page.keyboard.press('Control+A');
  await page.getByLabel('Absatz').selectOption('h1');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.getByLabel('Absatz').selectOption('p');
  await page.keyboard.type('Der sechste Zahn kommt zuerst und bleibt.');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Aufzählung' }).click();
  await page.keyboard.type('Milchgebiss zwanzig');
  await page.keyboard.press('Enter');
  await page.keyboard.type('bleibend 28 bis 32');

  // Bold on a selected part.
  await page.keyboard.press('Shift+Home');
  await page.getByRole('button', { name: 'Fett' }).click();

  // A third entry one level deeper through the Tab key, painted with
  // the Leuchtstift.
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.type('davon vier Weisheitszähne');
  await page.keyboard.press('Shift+Home');
  await page.getByRole('button', { name: 'Leuchtstift' }).click();

  // A centered closing line below the list.
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.getByLabel('Absatz').selectOption('p');
  await page.keyboard.type('Ende von Woche eins');
  await page.getByRole('button', { name: 'Zentriert' }).click();

  const html = await editor.innerHTML();
  check(html.includes('<h1>'), 'editor. the title block is missing in the html');
  check(html.includes('<ul>') && html.includes('<li>'), 'editor. the list is missing in the html');
  check(html.includes('<b>') || html.includes('<strong>'), 'editor. bold is missing in the html');
  check((html.match(/<ul/g) ?? []).length >= 2, 'editor. the Tab key did not nest the list');
  check(html.includes('<mark'), 'editor. the Leuchtstift left no mark');
  check(html.includes('text-align: center'), 'editor. the centered line is missing');

  // 3. Save through the button, then check the stored note.
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.getByText(/Gespeichert um/).waitFor();
  const storedHtml = await page.evaluate(() => {
    const raw = localStorage.getItem('zahnkurs.store.v1');
    if (!raw) throw new Error('store missing');
    /** @type {{notes?: {lessonId: number, html: string}[]}} */
    const data = JSON.parse(raw);
    return data.notes?.find((n) => n.lessonId === 2)?.html ?? '';
  });
  check(storedHtml.includes('Merksatz zum Gebiss'), 'storage. the saved note misses the title text');
  check(storedHtml.includes('<h1>'), 'storage. the saved note misses the title markup');
  check((storedHtml.match(/<ul/g) ?? []).length >= 2, 'storage. the nested list was not saved');
  check(storedHtml.includes('<mark>'), 'storage. the Leuchtstift mark was not saved');
  check(storedHtml.includes('text-align: center'), 'storage. the centered line was not saved');

  // A tap on a drawing drops it into the open notes as a vector image.
  await page.locator('.visualBody svg').first().click();
  await page.getByRole('button', { name: 'Bild in die Notizen einfügen' }).click();
  await page.locator('[contenteditable] img').first().waitFor();
  await page.getByRole('button', { name: 'Speichern' }).click();
  const withImage = await page.evaluate(() => {
    const raw = localStorage.getItem('zahnkurs.store.v1');
    if (!raw) throw new Error('store missing');
    /** @type {{notes?: {lessonId: number, html: string}[]}} */
    const data = JSON.parse(raw);
    return data.notes?.find((n) => n.lessonId === 2)?.html ?? '';
  });
  check(withImage.includes('data:image/svg+xml'), 'image. the drawing was not stored inside the note');
  await page.setViewportSize({ width: 1728, height: 1050 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(shotsDir, 'lektion-notizen.jpg'), fullPage: false, quality: 60, type: 'jpeg' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(200);

  // A second note in week two. The pane stays open across the lesson
  // change, otherwise the toggle brings it back.
  await page.goto(`${base}/#/lektion/9`, { waitUntil: 'networkidle' });
  const editor9 = page.getByRole('textbox', { name: 'Notizen zu Lektion 9' });
  try {
    await editor9.waitFor({ timeout: 2500 });
  } catch {
    await page.getByRole('button', { name: 'Notizen', exact: true }).click();
    await editor9.waitFor();
  }
  await editor9.click();
  await page.keyboard.type('Komposit braucht ein trockenes Feld.');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.getByText(/Gespeichert um/).waitFor();

  // 4. The notes page groups by week and lesson.
  await page.goto(`${base}/#/notizen`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Woche 1. Grundlagen' }).waitFor();
  await page.getByRole('heading', { name: 'Woche 2. Diagnostik und Behandlungen' }).waitFor();
  await page.getByRole('heading', { name: /Lektion 2\. Das Gebiss/ }).waitFor();
  await page.getByRole('heading', { name: /Lektion 9\. Füllungen/ }).waitFor();
  await page.getByText('Notizen zu 2 Lektionen', { exact: false }).waitFor();
  await page.screenshot({ path: join(shotsDir, 'notizen.jpg'), fullPage: true, quality: 60, type: 'jpeg' });

  // 5. Copy for the notes apps.
  const card2 = page.locator('article', { hasText: 'Merksatz zum Gebiss' }).first();
  await card2.getByRole('button', { name: 'Kopieren' }).click();
  await page.getByText('Kopiert.', { exact: false }).waitFor();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  check(clipboard.includes('Lektion 2.'), 'copy. the lesson title is missing in the clipboard');
  check(clipboard.includes('Der sechste Zahn'), 'copy. the note text is missing in the clipboard');

  // The inserted drawing shows on the notes page as well.
  await card2.locator('img').first().waitFor();

  // 6. Print a single note and all notes, with a stubbed dialog. The
  // print sheet carries title, date line and the drawing.
  await stubPrint(page);
  await card2.getByRole('button', { name: 'Als PDF drucken' }).click();
  await page.waitForFunction(() => /** @type {Window & { __printCount?: number }} */ (window).__printCount === 1);
  await page.locator('.notePrintArea .printNoteMeta').first().waitFor({ state: 'attached' });
  await page.locator('.notePrintArea .noteContent img').first().waitFor({ state: 'attached' });
  await page.locator('.notePrintArea .noteContent mark').first().waitFor({ state: 'attached' });
  await finishPrint(page);
  await stubPrint(page);
  await page.getByRole('button', { name: 'Alle als PDF drucken' }).click();
  await page.waitForFunction(() => /** @type {Window & { __printCount?: number }} */ (window).__printCount === 1);
  const printCount = await page.locator('.notePrintArea .printNote').count();
  check(printCount === 2, `print. expected 2 notes on the sheet, found ${printCount}`);
  await finishPrint(page);

  // 7. The edit button lands in the lesson with the pane open.
  await card2.getByRole('link', { name: 'In der Lektion bearbeiten' }).click();
  await page.getByRole('textbox', { name: 'Notizen zu Lektion 2' }).waitFor();
  check(!page.url().includes('notizen=1'), 'edit link. the address was not cleaned after opening');

  // 8. Everything survives a reload.
  await page.goto(`${base}/#/notizen`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Notizen zu 2 Lektionen', { exact: false }).waitFor();

  // 9. Delete one note after the confirmation.
  const card9 = page.locator('article', { hasText: 'Komposit braucht' }).first();
  await card9.getByRole('button', { name: 'Löschen' }).click();
  await page.getByRole('button', { name: 'Ja, löschen' }).click();
  await page.getByText('Notizen zu 1 Lektion', { exact: false }).waitFor();
  const tombstone = await page.evaluate(() => {
    const raw = localStorage.getItem('zahnkurs.store.v1');
    if (!raw) throw new Error('store missing');
    /** @type {{notes?: {lessonId: number, html: string}[]}} */
    const data = JSON.parse(raw);
    return data.notes?.find((n) => n.lessonId === 9)?.html ?? null;
  });
  check(tombstone === '', 'delete. the removed note left no tombstone');

  // 10. Phone viewport. The pane floats over the lesson and closes again.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const phonePage = await phone.newPage();
  watchConsole(phonePage, 'notes phone');
  await phonePage.goto(`${base}/#/lektion/2`, { waitUntil: 'networkidle' });
  await phonePage.getByRole('button', { name: 'Notizen', exact: true }).click();
  await phonePage.getByRole('textbox', { name: 'Notizen zu Lektion 2' }).waitFor();
  const overflow = await phonePage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 1, `notes phone. horizontal overflow of ${overflow}px`);
  await phonePage.getByRole('button', { name: 'Notizen schliessen' }).click();
  await phonePage.getByRole('textbox', { name: 'Notizen zu Lektion 2' }).waitFor({ state: 'detached' });
  await phone.close();

  await context.close();
  await browser.close();

  console.log('');
  if (consoleIssues.length > 0) {
    console.log(`CONSOLE ISSUES (${consoleIssues.length})`);
    for (const issue of consoleIssues.slice(0, 30)) console.log(`  ${issue}`);
  }
  if (failures.length > 0) {
    console.log(`FAILURES (${failures.length})`);
    for (const failure of failures) console.log(`  ${failure}`);
  }
  if (consoleIssues.length > 0 || failures.length > 0) process.exit(1);
  console.log('Notes QA clean. Split view, notebook editor, saving, notes page, copy, print, edit, delete and reload passed.');
}

await main();
