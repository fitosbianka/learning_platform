# Plan · Zahnmedizin Lernplattform

Arbeitsplan nach dem Brief in 00_BRIEF_FUER_CLAUDE_CODE.md. Die vier Inhaltsdateien liegen im Ordner content und sind die einzige Quelle der Wahrheit.

## Ordnerstruktur

    content/                Vier Markdown Dateien, Quelle der Wahrheit
    scripts/
      parse.mjs             Reine Parserfunktionen, von den Tests direkt importiert
      textrules.mjs         Textregeln, kein Bindestrich, kein Doppelpunkt, kein Eszett
      generate.mjs          Liest content, schreibt src/content/generated, bricht bei Strukturfehlern laut ab
      build-sw.mjs          Erzeugt nach dem Build den Service Worker mit Precache Liste
    src/
      main.tsx, App.tsx
      styles/               Farbtokens, Typografie, Dunkelmodus, Layout
      router/               Kleiner eigener Hash Router als Hook plus Link Komponente
      storage/storage.ts    Ein Speichermodul, typisiert, versioniert, try catch, Fallback in Memory
      state/                React Context fuer Fortschritt, Versuche, Dunkelmodus
      lib/                  shuffle.ts mit Seed, progress.ts, Inline Renderer
      ui/strings.ts         Alle Oberflaechentexte an einem Ort, damit die Textregeln pruefbar sind
      pages/                DashboardPage, LessonPage, ReferencePage, SettingsPage
      components/           TopBar, Fortschrittsring, Wochenliste, Quiz, Ergebnis, Dialoge
      visuals/              Ein File pro Visual, pro Lektion ein Ordner, lazy geladen
      content/types.ts      Handgeschriebene Typen
      content/generated/    Generierte Module, pro Lektion eine Datei, plus JSON Kopie
    src/tests/              Vitest Tests und Fixtures
    screenshots/            Ergebnis des Browserdurchlaufs

## Datenmodell

Lesson mit id, title, week, day, durationMinutes, metaLine, goals, why, sections, visuals, summary, questions, isExam. Jede Section hat heading und blocks, ein Block ist Absatz, Punktliste, nummerierte Liste oder Label. VisualSpec hat id im Muster L03_V01, index und description. Question hat id, number, text, genau vier options, correctIndex, explanation und fixedOrder fuer Fragen, deren Antworten sich auf Buchstaben beziehen. Glossar als Gruppen mit Eintraegen aus Term, Text und Lektionsnummern. Spickzettel als Karten mit Titel und Bloecken. Speicher Schema Version 1 mit finishedLessons, attempts pro Lektion, theme und lastLesson unter einem versionierten Schluessel.

## Reihenfolge der Arbeit

1. Grundgeruest mit Vite, React, TypeScript strict, ESLint, Vitest. Erledigt
2. Content Pipeline mit Parser, Fixtures, Generierung und Validierungstests. Erledigt
3. Storage, Shuffle, Fortschrittslogik mit Tests. Erledigt
4. App Shell, Router, Dashboard, Lektionsseite mit Quiz und Tastatursteuerung, zuerst Lektion 3
5. FDI Zahnschema als wiederverwendbare Komponente samt Uebungsmodus, danach alle Visuals Lektion fuer Lektion
6. Nachschlagen mit Glossarsuche und Spickzetteln, Einstellungen, Export, Import, Reset, Dunkelmodus
7. Offline Support ueber generierten Service Worker mit Precache aller Chunks
8. Qualitaetslauf. Build, Lint, Typecheck, Tests, Browserdurchlauf aller 21 Lektionen mit Screenshots, Lighthouse
9. README, Abschlussbericht, NOTES_FOR_REVIEW

## Entscheidungen

* Styling mit CSS und CSS Variablen ohne Framework, keine Komponentenbibliothek
* Eigener Hash Router, kein Routerpaket
* Systemschriften, keine Netzanfragen zur Laufzeit
* Generierung pro Lektion eine Datei, damit jede Lektion als eigener Chunk lazy laedt
* Service Worker wird nach dem Build aus der fertigen dist Liste erzeugt, dadurch echtes Offline auch fuer lazy geladene Lektionen
* Diese Session ist auf den Branch claude/eloquent-cray-syztyx festgelegt, deshalb wird dorthin gepusht. Der Merge auf main loest danach das Vercel Deployment aus
