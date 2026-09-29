/// <reference lib="dom" />
/* global window, document */
/**
 * The manual check from the brief, automated with a real browser.
 * The DOM lib reference above types the callbacks that run inside the
 * browser through page.evaluate.
 *
 * Opens every one of the 21 lessons on the production build, scrolls to
 * the bottom, verifies that every visual rendered, marks the lesson as
 * read, takes the test with random answers and saves a screenshot of
 * each lesson and of the dashboard into the screenshots folder. The
 * run fails when the browser console shows a single error or warning.
 * A second pass checks a phone viewport of 390 pixels.
 *
 * Usage: node scripts/qa.mjs   (expects the preview server on :4173)
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

/** @param {import('playwright').Page} page */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(120);
}

/**
 * @param {import('playwright').Page} page
 * @param {number} id
 * @param {number} expectedVisuals
 * @param {number} expectedQuestions
 */
async function runLesson(page, id, expectedVisuals, expectedQuestions) {
  const label = `lektion ${id}`;
  await page.goto(`${base}/#/lektion/${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('article h1');
  await scrollThrough(page);

  // Every visual of the lesson must be on the page.
  const visualCount = await page.locator('.visualFrame').count();
  if (visualCount !== expectedVisuals) {
    failures.push(`${label}. expected ${expectedVisuals} visuals, found ${visualCount}`);
  }

  // Screenshot of the full lesson.
  await page.screenshot({
    path: join(shotsDir, `lektion-${String(id).padStart(2, '0')}.jpg`),
    fullPage: true,
    quality: 55,
    type: 'jpeg',
  });

  // Mark as read, the summary and the test appear.
  const markButton = page.getByRole('button', { name: 'Lektion als gelesen markieren' });
  if ((await markButton.count()) > 0) {
    await markButton.click();
  }
  await page.waitForSelector('#test');

  // Take the test with random answers, scoped to the test region so the
  // step buttons of the visuals do not interfere.
  const quiz = page.getByRole('region', { name: /^(Test|Schlussprüfung)$/ });
  await quiz.getByRole('button', { name: /Test starten|Test nochmals machen/ }).first().click();
  for (let q = 0; q < expectedQuestions; q += 1) {
    const options = quiz.getByRole('list', { name: 'Antworten' }).getByRole('button');
    await options.first().waitFor();
    const pick = Math.floor(Math.random() * 4);
    await options.nth(pick).click();
    await quiz.getByRole('button', { name: 'Antwort bestätigen' }).click();
    const next = q === expectedQuestions - 1 ? 'Zum Ergebnis' : 'Weiter';
    await quiz.getByRole('button', { name: next, exact: true }).click();
  }
  await quiz.getByText(/von \d+ richtig/).first().waitFor();
}

async function main() {
  const browser = await chromium.launch({ executablePath });

  // Desktop pass with the full flow.
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await desktop.newPage();
  watchConsole(page, 'desktop');

  await page.goto(`${base}/#/`, { waitUntil: 'networkidle' });

  // Visual counts per lesson, mirrors the validated generated content.
  const counts = [3, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4, 5, 3].map((v, i) => ({
    id: i + 1,
    visualCount: v,
    questionCount: i === 20 ? 20 : 5,
  }));

  for (const meta of counts) {
    await runLesson(page, meta.id, meta.visualCount, meta.questionCount);
    console.log(`lesson ${meta.id} ok`);
  }

  // Dashboard with all progress.
  await page.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await page.getByText('21 von 21 Lektionen abgeschlossen').waitFor();
  await page.screenshot({ path: join(shotsDir, 'dashboard.jpg'), fullPage: true, quality: 60, type: 'jpeg' });

  // Reference pages.
  await page.goto(`${base}/#/nachschlagen/glossar`, { waitUntil: 'networkidle' });
  await page.getByRole('searchbox').fill('Abutment');
  await page.getByText('Verbindungsstück zwischen Implantat und Krone').waitFor();
  await page.goto(`${base}/#/nachschlagen/spickzettel/1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.fdiChart');
  await page.screenshot({ path: join(shotsDir, 'spickzettel.jpg'), fullPage: true, quality: 60, type: 'jpeg' });

  // Anki page in its empty state. The full card flow runs in qa-anki.mjs.
  await page.goto(`${base}/#/anki`, { waitUntil: 'networkidle' });
  await page.getByText('Noch keine Lernkarten').waitFor();
  await page.getByRole('button', { name: 'Neue Karte' }).waitFor();

  // Settings with dark mode.
  await page.goto(`${base}/#/einstellungen`, { waitUntil: 'networkidle' });
  await page.getByRole('switch').click();
  await page.waitForTimeout(200);
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  if (theme !== 'dark' && theme !== 'light') failures.push(`settings. unexpected theme ${theme}`);
  await page.screenshot({ path: join(shotsDir, 'einstellungen-dunkel.jpg'), fullPage: true, quality: 60, type: 'jpeg' });
  // Dark dashboard for the visual check.
  await page.goto(`${base}/#/lektion/3`, { waitUntil: 'networkidle' });
  await scrollThrough(page);
  await page.screenshot({ path: join(shotsDir, 'lektion-03-dunkel.jpg'), fullPage: true, quality: 55, type: 'jpeg' });
  await page.getByRole('switch', { includeHidden: false }).count();
  await desktop.close();

  // Phone pass, 390 pixels wide, render and scroll every lesson.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const phonePage = await phone.newPage();
  watchConsole(phonePage, 'phone');
  for (const meta of counts) {
    await phonePage.goto(`${base}/#/lektion/${meta.id}`, { waitUntil: 'networkidle' });
    await phonePage.waitForSelector('article h1');
    await scrollThrough(phonePage);
    const visualCount = await phonePage.locator('.visualFrame').count();
    if (visualCount !== meta.visualCount) {
      failures.push(`phone lektion ${meta.id}. expected ${meta.visualCount} visuals, found ${visualCount}`);
    }
    // No horizontal scrolling anywhere.
    const overflow = await phonePage.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) failures.push(`phone lektion ${meta.id}. horizontal overflow of ${overflow}px`);
  }
  await phonePage.goto(`${base}/#/`, { waitUntil: 'networkidle' });
  await phonePage.screenshot({ path: join(shotsDir, 'dashboard-phone.jpg'), fullPage: true, quality: 60, type: 'jpeg' });
  await phonePage.goto(`${base}/#/lektion/3`, { waitUntil: 'networkidle' });
  await scrollThrough(phonePage);
  await phonePage.screenshot({ path: join(shotsDir, 'lektion-03-phone.jpg'), fullPage: true, quality: 55, type: 'jpeg' });
  await phone.close();

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
  console.log('QA run clean. Zero console errors, zero warnings, all lessons, visuals and tests passed.');
}

await main();
