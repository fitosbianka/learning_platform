/**
 * Every visible interface text of the platform lives here. The content
 * validation test checks this whole object against the text rules, so no
 * hyphen, dash, colon or Eszett can slip into the interface.
 */

export const strings = {
  appName: 'Zahnmedizin Grundkurs',

  nav: {
    dashboard: 'Dashboard',
    reference: 'Nachschlagen',
    settings: 'Einstellungen',
    menu: 'Menü',
    mainNavLabel: 'Hauptnavigation',
    backToDashboard: 'Zurück zur Übersicht',
    skipToContent: 'Zum Inhalt springen',
  },

  dashboard: {
    title: 'Zahnmedizin Grundkurs',
    subtitle: 'Für Praxismanagerinnen. Drei Wochen, 21 Lektionen, jeden Tag etwa 30 bis 60 Minuten.',
    progress: (done: number, total: number) => `${done} von ${total} Lektionen abgeschlossen`,
    progressLabel: 'Kursfortschritt',
    nextUp: 'Als Nächstes',
    continueButton: 'Weiter lernen',
    openLesson: 'Öffnen',
    openLessonLabel: (n: number, title: string) => `Lektion ${n} öffnen, ${title}`,
    finished: 'Abgeschlossen',
    finishedShort: 'Gelesen',
    bestScore: (score: number, total: number) => `Test ${score} von ${total}`,
    bestScoreLabel: (score: number, total: number) => `Bester Test ${score} von ${total} richtig`,
    noTestYet: 'Noch kein Test',
    examTitle: 'Schlussprüfung',
    examText: 'Die grosse Prüfung mit 20 Fragen aus dem ganzen Kurs. Direkt aus Lektion 21.',
    examButton: 'Zur Schlussprüfung',
    examPassed: 'Bestanden',
    week: (n: number) => `Woche ${n}`,
    day: (n: number) => `Tag ${n}`,
    minutes: (n: number) => `etwa ${n} Minuten`,
    allDone: 'Alle 21 Lektionen abgeschlossen. Gut gemacht!',
  },

  lesson: {
    breadcrumb: (week: number, n: number) => `Woche ${week} · Lektion ${n}`,
    goalsTitle: 'Lernziele',
    whyTitle: 'Warum das für dich wichtig ist',
    summaryTitle: 'Zusammenfassung',
    markRead: 'Lektion als gelesen markieren',
    markedRead: 'Als gelesen markiert',
    readingProgressLabel: 'Lesefortschritt',
    prevLesson: 'Vorherige Lektion',
    nextLesson: 'Nächste Lektion',
    notFound: 'Diese Lektion gibt es nicht.',
    loadError: 'Die Lektion konnte nicht geladen werden. Bitte lade die Seite neu.',
  },

  quiz: {
    title: 'Test',
    examTitle: 'Schlussprüfung',
    intro: (n: number) => `${n} Fragen, beliebig viele Versuche.`,
    examIntro: (n: number, pass: number) =>
      `${n} Fragen aus dem ganzen Kurs. Bestanden ab ${pass} richtigen Antworten, beliebig viele Versuche.`,
    start: 'Test starten',
    restart: 'Test nochmals machen',
    revealEarly: 'Test schon jetzt machen',
    questionOf: (i: number, n: number) => `Frage ${i} von ${n}`,
    confirm: 'Antwort bestätigen',
    next: 'Weiter',
    toResult: 'Zum Ergebnis',
    correct: 'Richtig!',
    wrong: 'Leider nicht richtig.',
    correctIs: (label: string) => `Richtig ist ${label}`,
    explanation: 'Erklärung',
    keyboardHint: 'Tastatur. Zahlen 1 bis 4 wählen eine Antwort, Enter bestätigt und macht weiter.',
    answersLabel: 'Antworten',
    optionLabel: (i: number) => `Antwort ${i}`,
    cancel: 'Test abbrechen',
  },

  result: {
    title: 'Ergebnis',
    scoreLine: (score: number, total: number) => `${score} von ${total} richtig`,
    percentLine: (p: number) => `${p} Prozent`,
    perfect: 'Perfekt, alles richtig!',
    great: 'Sehr gut gemacht!',
    good: 'Gut gemacht, das sitzt schon fast.',
    solid: 'Ein guter Anfang. Schau dir die Erklärungen nochmals an.',
    tryAgain: 'Noch nicht ganz. Lies die Lektion nochmals und versuch es wieder.',
    passed: 'Bestanden',
    notPassed: 'Noch nicht bestanden, versuch es nochmals',
    questionListLabel: 'Alle Fragen dieses Versuchs',
    correctIcon: 'richtig beantwortet',
    wrongIcon: 'falsch beantwortet',
    retake: 'Test nochmals machen',
    nextLesson: 'Weiter zur nächsten Lektion',
    backToDashboard: 'Zurück zur Übersicht',
  },

  attempts: {
    title: 'Letzte Versuche',
    line: (date: string, score: number, total: number) => `${date}, ${score} von ${total}`,
    best: 'Bester Versuch',
  },

  reference: {
    title: 'Nachschlagen',
    tabGlossary: 'Glossar',
    tabSheets: 'Spickzettel',
    searchLabel: 'Glossar durchsuchen',
    searchPlaceholder: 'Begriff oder Stichwort suchen',
    noResults: 'Keine Treffer. Versuch es mit einem anderen Begriff.',
    resultCount: (n: number) => (n === 1 ? '1 Eintrag' : `${n} Einträge`),
    lessonLink: (n: number) => `Lektion ${n}`,
    lessonLinkLabel: (n: number) => `Zu Lektion ${n} wechseln`,
    openSheet: 'Öffnen',
    closeSheet: 'Schliessen',
  },

  settings: {
    title: 'Einstellungen',
    appearance: 'Darstellung',
    darkMode: 'Dunkelmodus',
    darkModeHint: 'Beim ersten Besuch folgt die Darstellung der Systemeinstellung.',
    dataTitle: 'Fortschritt sichern',
    exportButton: 'Fortschritt exportieren',
    exportHint: 'Speichert Lernstand und alle Testversuche als JSON Datei.',
    importButton: 'Fortschritt importieren',
    importHint: 'Liest eine exportierte Datei ein und ergänzt Versuche ohne Doppelte.',
    importSuccess: 'Import erfolgreich. Dein Fortschritt wurde zusammengeführt.',
    importInvalid: 'Diese Datei ist keine gültige Sicherung der Lernplattform.',
    resetTitle: 'Zurücksetzen',
    resetButton: 'Alles zurücksetzen',
    resetHint: 'Löscht Lernstand, Testversuche und Einstellungen.',
    resetConfirm1Title: 'Wirklich alles zurücksetzen?',
    resetConfirm1Text: 'Lernstand und alle Testversuche gehen verloren.',
    resetConfirm2Title: 'Ganz sicher?',
    resetConfirm2Text: 'Das kann nicht rückgängig gemacht werden. Ein Export vorher schadet nie.',
    resetConfirmYes: 'Ja, zurücksetzen',
    resetCancel: 'Abbrechen',
    resetDone: 'Alles wurde zurückgesetzt.',
    storageWarning:
      'Dein Browser erlaubt kein Speichern. Die Plattform funktioniert, der Fortschritt geht beim Schliessen aber verloren.',
    about: 'Über diese Plattform',
    aboutText:
      'Persönliche Lernplattform für den Zahnmedizin Grundkurs. Alle Daten bleiben in deinem Browser, nichts wird an einen Server geschickt.',
  },

  visuals: {
    replay: 'Nochmals abspielen',
    stepNext: 'Weiter',
    stepBack: 'Zurück',
    play: 'Abspielen',
  },

  notFound: {
    title: 'Diese Seite gibt es nicht.',
    toDashboard: 'Zur Übersicht',
  },
} as const;

/** Formats an ISO date as Swiss style date without forbidden characters. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}
