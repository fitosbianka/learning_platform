/// <reference lib="dom" />
/* global window, document, NodeFilter */
/**
 * Browser check for the Anki feature on the production build. Covers
 * the highlight flow in a lesson, creating all three card kinds, a
 * learning session with a wrong and then a correct answer per card,
 * the schedule written to storage, editing, deleting and the reload.
 *
 * Usage: node scripts/qa-anki.mjs   (expects the preview server on :4173)
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

async function main() {
  const browser = await chromium.launch({ executablePath });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  watchConsole(page, 'anki');

  /** Selects a long passage inside the lesson article. */
  const selectPassage = async (/** @type {import('playwright').Page} */ target) => {
    await target.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) throw new Error('article not found');
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
      let node = null;
      while (walker.nextNode()) {
        const current = walker.currentNode;
        const parent = current.parentElement;
        if (!parent || parent.closest('h1, h2, h3, button, a, mark')) continue;
        if ((current.textContent ?? '').trim().length >= 60) {
          node = current;
          break;
        }
      }
      if (!node) throw new Error('no long text node found');
      const range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, 60);
      const selection = window.getSelection();
      if (!selection) throw new Error('no selection api');
      selection.removeAllRanges();
      selection.addRange(range);
    });
  };

  // 1. The marker pen. Select a passage, paint it, it survives a
  // reload and disappears again through the removal bubble.
  await page.goto(`${base}/#/lektion/2`, { waitUntil: 'networkidle' });
  await page.waitForSelector('article h1');
  await selectPassage(page);
  await page.getByRole('button', { name: 'Markieren', exact: true }).click();
  await page.locator('mark[data-mark]').first().waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('mark[data-mark]').first().waitFor();
  await page.locator('mark[data-mark]').first().click();
  await page.getByRole('button', { name: 'Markierung entfernen' }).click();
  await page.locator('mark[data-mark]').waitFor({ state: 'detached' });
  const markTombstone = await page.evaluate(() => {
    const raw = localStorage.getItem('zahnkurs.store.v1');
    if (!raw) throw new Error('store missing');
    /** @type {{markings?: {deleted: boolean}[]}} */
    const data = JSON.parse(raw);
    return data.markings?.[0]?.deleted ?? null;
  });
  check(markTombstone === true, 'marker. the removed marking left no tombstone');

  // 2. Highlight flow into a card. Every kind carries a suggestion,
  // the cloze kind is preselected with a gap.
  await selectPassage(page);
  await page.getByRole('button', { name: 'Lernkarte', exact: true }).click();
  await page.getByRole('heading', { name: 'Neue Lernkarte' }).waitFor();
  await page.getByText('Der Vorschlag kommt aus deiner markierten Stelle', { exact: false }).waitFor();
  const gapCount = await page.locator('[class*="tokenGap"]').count();
  check(gapCount >= 1, `highlight editor. expected a suggested gap, found ${gapCount}`);
  // The question kind carries a written question with the passage as answer.
  await page.getByRole('button', { name: 'Frage und Antwort' }).click();
  const qaQuestion = await page.getByLabel('Frage', { exact: true }).inputValue();
  const qaAnswer = await page.getByLabel('Antwort', { exact: true }).inputValue();
  check(qaQuestion.trim().length > 0, 'suggestion. the question card question is empty');
  check(qaAnswer.trim().length > 0, 'suggestion. the question card answer is empty');
  // The choice kind is fully prefilled from the highlight.
  await page.getByRole('button', { name: 'Auswahl A B C' }).click();
  const suggestedQuestion = await page.getByLabel('Frage', { exact: true }).inputValue();
  check(suggestedQuestion.includes('Welches Wort fehlt?'), 'suggestion. the choice question is not prefilled');
  for (const letter of ['A', 'B', 'C']) {
    const value = await page.getByLabel(`Antwort ${letter}`).inputValue();
    check(value.trim().length > 0, `suggestion. option ${letter} is empty`);
  }
  await page.getByRole('button', { name: 'Lückentext' }).click();
  // Single word mode. A tap adds a separate gap, a tap on a gapped
  // word removes that gap again.
  const gapButtons = page.locator('[class*="tokenGap"]');
  const freeWords = page.locator('[class*="tokens"] button:not([class*="tokenGap"])');
  const startCount = await gapButtons.count();
  await freeWords.first().click();
  const grown = await gapButtons.count();
  check(grown === startCount + 1, `cloze editor. expected ${startCount + 1} gapped words, found ${grown}`);
  await gapButtons.first().click();
  const shrunk = await gapButtons.count();
  check(shrunk === grown - 1, `cloze editor. expected ${grown - 1} gapped words after removal, found ${shrunk}`);
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.getByText('Lernkarte gespeichert').waitFor();

  // 2. On the Anki page the card shows up as due for round one.
  await page.goto(`${base}/#/anki`, { waitUntil: 'networkidle' });
  await page.getByText('Heute 1 Karte zum Wiederholen').waitFor();
  const chip = page.locator('[class*="roundChip"]').first();
  await chip.waitFor();
  const chipText = (await chip.textContent()) ?? '';
  check(chipText.includes('Durchgang 1'), `overview. unexpected round chip text ${chipText}`);

  // 3. A brand new question card for lesson 3.
  await page.getByRole('button', { name: 'Neue Karte' }).click();
  await page.getByRole('heading', { name: 'Neue Lernkarte' }).waitFor();
  await page.getByLabel('Gehört zu Lektion').selectOption('3');
  await page.getByLabel('Frage', { exact: true }).fill('Wie viele Milchzähne hat der Mensch?');
  await page.getByLabel('Antwort', { exact: true }).fill('Zwanzig, pro Kieferhälfte fünf.');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.getByText('Heute 2 Karten zum Wiederholen').waitFor();

  // 4. A new Auswahl card for lesson 9, correct answer B.
  await page.getByRole('button', { name: 'Neue Karte' }).click();
  await page.getByRole('button', { name: 'Auswahl A B C' }).click();
  await page.getByLabel('Gehört zu Lektion').selectOption('9');
  await page.getByLabel('Frage', { exact: true }).fill('Welches Material ist zahnfarben?');
  await page.getByLabel('Antwort A').fill('Amalgam');
  await page.getByLabel('Antwort B').fill('Komposit');
  await page.getByLabel('Antwort C').fill('Gold');
  await page.getByRole('radio', { name: 'B', exact: true }).check();
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.getByText('Heute 3 Karten zum Wiederholen').waitFor();

  // Grouping by week and lesson.
  await page.getByRole('heading', { name: 'Woche 1. Grundlagen' }).waitFor();
  await page.getByRole('heading', { name: 'Woche 2. Diagnostik und Behandlungen' }).waitFor();
  await page.getByRole('heading', { name: /2\. Das Gebiss/ }).waitFor();
  await page.getByRole('heading', { name: /3\. Zahnschema/ }).waitFor();
  await page.getByRole('heading', { name: /9\. Füllungen/ }).waitFor();
  await page.screenshot({ path: join(shotsDir, 'anki.jpg'), fullPage: true, quality: 60, type: 'jpeg' });

  // 5. The learning session. First card is the cloze card, answer it
  // wrongly on purpose, it must return at the end of the queue.
  await page.getByRole('button', { name: 'Jetzt lernen' }).click();
  await page.getByText('Noch 3 Karten heute').waitFor();

  // The queue is shuffled every session, so handle whatever card comes
  // until the day is done. The cloze card is missed once on purpose.
  let clozeAnswer = '';
  let clozeWrongDone = false;
  let sessionShot = false;
  for (let step = 0; step < 12; step += 1) {
    if (await page.getByText('Alles erledigt für heute!').isVisible().catch(() => false)) break;
    if (await page.getByRole('button', { name: 'Antwort zeigen' }).isVisible().catch(() => false)) {
      // Question up, space shows the answer, space counts as known.
      await page.getByText('Wie viele Milchzähne hat der Mensch?').waitFor();
      const early = await page.getByText('Zwanzig, pro Kieferhälfte fünf.').isVisible().catch(() => false);
      check(!early, 'session. the answer must stay hidden until space');
      await page.keyboard.press('Space');
      await page.getByText('Zwanzig, pro Kieferhälfte fünf.').waitFor();
      await page.keyboard.press('Space');
      continue;
    }
    if (await page.getByRole('button', { name: /Komposit/ }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Komposit/ }).click();
      await page.getByText('Richtig!').waitFor();
      // Space walks on after the feedback.
      await page.keyboard.press('Space');
      continue;
    }
    const gapInput = page.getByLabel('Deine Antwort für Lücke 1');
    if (await gapInput.isVisible().catch(() => false)) {
      if (!clozeWrongDone) {
        await gapInput.fill('absichtlich falsch');
        await page.getByRole('button', { name: 'Prüfen' }).click();
        await page.getByText('Leider nicht richtig').waitFor();
        await page.getByText('fällt zurück auf Durchgang 1').waitFor();
        // The wrong verdict offers the override button.
        await page.getByRole('button', { name: 'Meine Antwort war richtig' }).waitFor();
        clozeAnswer = ((await page.locator('[class*="feedbackAnswer"] strong').textContent()) ?? '').trim();
        check(clozeAnswer.length > 0, 'session. missing correct answer text after a wrong cloze answer');
        clozeWrongDone = true;
      } else {
        // One dropped letter still counts and the gap already shows
        // the green verdict before the check.
        const attempt = clozeAnswer.length >= 6 ? clozeAnswer.slice(0, 2) + clozeAnswer.slice(3) : clozeAnswer;
        await gapInput.fill(attempt);
        await page.locator('input[class*="gapInputRight"]').first().waitFor();
        await page.getByRole('button', { name: 'Prüfen' }).click();
        await page.getByText('Richtig!').waitFor();
        if (!sessionShot) {
          await page.screenshot({ path: join(shotsDir, 'anki-lernen.jpg'), fullPage: false, quality: 60, type: 'jpeg' });
          sessionShot = true;
        }
      }
      await page.getByRole('button', { name: 'Weiter', exact: true }).click();
      continue;
    }
    await page.waitForTimeout(200);
  }
  check(clozeWrongDone, 'session. the cloze card never appeared');
  await page.getByText('Alles erledigt für heute!').waitFor();
  await page.getByRole('button', { name: 'Zur Übersicht' }).click();

  // 6. Overview after the session. Nothing due, schedule moved by one day.
  await page.getByText('Für heute ist alles wiederholt.').waitFor();
  await page.getByText('3 Karten insgesamt, davon 0 gelernt').waitFor();
  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem('zahnkurs.store.v1');
    if (!raw) throw new Error('store missing');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    /** @type {{cards?: {stage: number, nextDue: string|null}[]}} */
    const data = JSON.parse(raw);
    return { cards: data.cards ?? [], tomorrowKey: `${y}-${m}-${d}` };
  });
  check(stored.cards.length === 3, `storage. expected 3 cards, found ${stored.cards.length}`);
  for (const card of stored.cards) {
    check(card.stage === 1, `storage. expected stage 1 after the session, found ${card.stage}`);
    check(card.nextDue === stored.tomorrowKey, `storage. expected next due ${stored.tomorrowKey}, found ${card.nextDue}`);
  }

  // 7. Editing a card from the list.
  const qaRow = page.locator('li', { hasText: 'Wie viele Milchzähne hat der Mensch?' }).last();
  await qaRow.getByRole('button', { name: 'Bearbeiten' }).click();
  await page.getByRole('heading', { name: 'Lernkarte bearbeiten' }).waitFor();
  await page.getByLabel('Frage', { exact: true }).fill('Wie viele Zähne hat das Milchgebiss?');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.getByText('Wie viele Zähne hat das Milchgebiss?').waitFor();

  // 8. Everything survives a reload.
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('3 Karten insgesamt, davon 0 gelernt').waitFor();
  await page.getByText('Für heute ist alles wiederholt.').waitFor();

  // 9. Deleting a card after the confirmation.
  const choiceRow = page.locator('li', { hasText: 'Welches Material ist zahnfarben?' }).last();
  await choiceRow.getByRole('button', { name: 'Löschen' }).click();
  await page.getByRole('button', { name: 'Ja, löschen' }).click();
  await page.getByText('2 Karten insgesamt, davon 0 gelernt').waitFor();
  const gone = await page.getByText('Welches Material ist zahnfarben?').count();
  check(gone === 0, 'delete. the removed card is still visible');

  // 10. Phone viewport, no horizontal overflow on the Anki page.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const phonePage = await phone.newPage();
  watchConsole(phonePage, 'anki phone');

  // The marker pen also works on the phone.
  await phonePage.goto(`${base}/#/lektion/3`, { waitUntil: 'networkidle' });
  await phonePage.waitForSelector('article h1');
  await selectPassage(phonePage);
  await phonePage.getByRole('button', { name: 'Markieren', exact: true }).click();
  await phonePage.locator('mark[data-mark]').first().waitFor();

  await phonePage.goto(`${base}/#/anki`, { waitUntil: 'networkidle' });
  await phonePage.getByRole('button', { name: 'Neue Karte' }).waitFor();
  const overflow = await phonePage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 1, `anki phone. horizontal overflow of ${overflow}px`);
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
  console.log('Anki QA clean. Highlight flow, all three card kinds, session with retry, schedule, edit, delete and reload passed.');
}

await main();
