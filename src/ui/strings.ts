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

  anki: {
    title: 'Anki',
    navLabel: 'Anki',
    subtitle: 'Deine Lernkarten aus dem Kurs, wiederholt in wachsenden Abständen. Erst am selben Tag, dann nach 1, 3 und 7 Tagen, danach gilt die Karte als gelernt.',
    dueToday: (n: number) => (n === 1 ? 'Heute 1 Karte zum Wiederholen' : `Heute ${n} Karten zum Wiederholen`),
    nothingDue: 'Für heute ist alles wiederholt.',
    reviewRound: (n: number) => `Durchgang ${n}`,
    startReview: 'Jetzt lernen',
    newCard: 'Neue Karte',
    totals: (total: number, learned: number) => `${total} Karten insgesamt, davon ${learned} gelernt`,
    empty: 'Noch keine Lernkarten. Markiere in einer Lektion eine Textstelle und tippe auf Lernkarte erstellen, oder lege hier mit Neue Karte selbst eine an.',
    learnedBadge: 'Gelernt',
    dueBadge: (n: number) => `Fällig, Durchgang ${n}`,
    plannedBadge: (date: string) => `Durchgang folgt am ${date}`,
    edit: 'Bearbeiten',
    delete: 'Löschen',
    deleteConfirmTitle: 'Lernkarte löschen?',
    deleteConfirmText: 'Die Karte verschwindet auf allen Geräten.',
    deleteYes: 'Ja, löschen',

    editorTitleNew: 'Neue Lernkarte',
    editorTitleEdit: 'Lernkarte bearbeiten',
    lessonLabel: 'Gehört zu Lektion',
    kindYesno: 'Ja oder Nein',
    kindChoice: 'Auswahl A B C',
    kindCloze: 'Lückentext',
    statementLabel: 'Aussage',
    statementHint: 'Beim Lernen fragt die Karte, ob diese Aussage stimmt.',
    correctAnswerLabel: 'Die Aussage stimmt',
    yes: 'Ja',
    no: 'Nein',
    questionLabel: 'Frage',
    optionLabel: (letter: string) => `Antwort ${letter}`,
    choiceCorrectLabel: 'Welche Antwort stimmt?',
    clozeTextLabel: 'Satz für die Lücke',
    clozeHint: 'Tippe unten das Wort an, das zur Lücke wird. Ein Tipp auf ein weiteres Wort verlängert die Lücke bis dorthin.',
    clozePreviewLabel: 'Lücke wählen',
    validation: 'Bitte fülle alle Felder aus und wähle die richtige Antwort.',
    validationGap: 'Wähle zuerst ein Wort für die Lücke.',
    save: 'Speichern',
    cancel: 'Abbrechen',

    highlightButton: 'Lernkarte erstellen',
    savedToast: 'Lernkarte gespeichert. Du findest sie auf der Anki Seite.',

    remaining: (n: number) => (n === 1 ? 'Noch 1 Karte heute' : `Noch ${n} Karten heute`),
    roundBadge: (n: number) => `Durchgang ${n} von 4`,
    check: 'Prüfen',
    next: 'Weiter',
    correctFeedback: 'Richtig!',
    wrongFeedback: 'Leider nicht richtig. Die Karte kommt heute gleich nochmals.',
    correctAnswerIs: 'Richtig ist',
    answerPlaceholder: 'Antwort eintippen',
    answerInputLabel: 'Deine Antwort für die Lücke',
    trueOrFalse: 'Stimmt diese Aussage?',
    sessionDoneTitle: 'Alles erledigt für heute!',
    sessionDoneText: (n: number) =>
      n === 1 ? 'Eine Karte wiederholt. Die nächste Wiederholung steht im Plan.' : `${n} Karten wiederholt. Die nächsten Wiederholungen stehen im Plan.`,
    backToOverview: 'Zur Übersicht',
    quit: 'Beenden',
  },

  sync: {
    title: 'Synchronisation zwischen Geräten',
    introOff:
      'Verbindet deine Geräte über eine kleine Cloudablage in deinem Vercel Projekt. Der Lernstand gleicht sich danach automatisch ab.',
    introOn: 'Dieses Gerät gleicht den Lernstand automatisch mit deinen anderen Geräten ab.',
    enable: 'Synchronisation einschalten',
    yourCode: 'Dein Gerätecode',
    codeHint: 'Öffne den Kopplungslink auf dem anderen Gerät oder gib dort diesen Code ein.',
    copyLink: 'Kopplungslink kopieren',
    linkCopied: 'Link kopiert. Schick ihn dir zum Beispiel per Nachricht aufs andere Gerät und öffne ihn dort.',
    linkManual: 'Kopieren klappt hier nicht automatisch. Markiere den Link unten von Hand.',
    joinTitle: 'Anderes Gerät verbinden',
    joinLabel: 'Code vom anderen Gerät',
    joinPlaceholder: 'zum Beispiel abcd efgh 2345',
    joinButton: 'Mit Code verbinden',
    joined: 'Verbunden. Der Lernstand beider Geräte wurde zusammengeführt.',
    invalidCode: 'Dieser Code stimmt so nicht. Prüfe die Eingabe.',
    unknownCode: 'Diesen Code gibt es nicht. Schalte die Synchronisation zuerst auf dem ersten Gerät ein und prüfe die Eingabe.',
    syncNow: 'Jetzt abgleichen',
    disable: 'Synchronisation ausschalten',
    statusOk: 'Alles abgeglichen.',
    lastSync: (time: string) => `Zuletzt abgeglichen um ${time} Uhr.`,
    neverSynced: 'Noch nie abgeglichen.',
    statusWorking: 'Wird gerade abgeglichen.',
    statusError: 'Gerade keine Verbindung zur Cloudablage. Es wird automatisch weiter versucht.',
    notConfigured:
      'Die Cloudablage ist noch nicht eingerichtet. Lege im Vercel Dashboard unter Storage eine Upstash Redis Datenbank an und verbinde sie mit dem Projekt learning_platform. Die genauen Schritte stehen im README unter Synchronisation.',
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
      'Persönliche Lernplattform für den Zahnmedizin Grundkurs. Deine Daten bleiben in deinem Browser. Nur wenn die Synchronisation eingeschaltet ist, liegt eine Kopie des Lernstands zusätzlich in der Cloudablage deines eigenen Vercel Projekts.',
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

/** Formats an ISO date as a time like 14.32, without forbidden characters. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getHours()}.${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Formats an ISO date as Swiss style date without forbidden characters. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}
