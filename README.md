# Zahnmedizin Grundkurs · Lernplattform

Persoenliche Lernplattform fuer den dreiwoechigen Zahnmedizin Grundkurs mit 21 Lektionen, Tests, Glossar und Spickzetteln. Alles laeuft im Browser, ohne Backend, ohne Login. Der Fortschritt bleibt lokal im Browser gespeichert.

## 1. Lokal starten

Voraussetzung ist Node.js ab Version 20.

    npm install
    npm run dev

Danach laeuft die Plattform unter der Adresse, die im Terminal steht, normalerweise http://localhost:5173

Fuer einen Probelauf der fertigen Produktion

    npm run build
    npm run preview

Der Befehl build erzeugt den Ordner dist mit der fertigen Seite, preview zeigt genau diese Version im Browser.

## 2. Deployment ueber GitHub und Vercel

Das Vercel Projekt learning_platform ist mit diesem GitHub Repository verbunden. Jeder Push auf den Branch main baut und veroeffentlicht die Seite automatisch, es ist kein weiterer Schritt noetig.

Die Adresse der Live Seite findest du im Vercel Dashboard. Dort das Projekt learning_platform oeffnen, oben steht die Domain unter Domains, jede fertige Veroeffentlichung ist zusaetzlich unter Deployments mit einer eigenen Vorschau verlinkt.

Wenn ein Build fehlschlaegt

* Im Vercel Dashboard unter Deployments das rote Deployment oeffnen und die Build Logs lesen. Dort steht die gleiche Fehlermeldung, die auch npm run build lokal zeigen wuerde.
* In den Projekteinstellungen pruefen, dass das Framework Preset auf Vite steht, der Build Command npm run build ist und der Output Ordner dist.
* Den Fehler lokal mit npm run build nachstellen, beheben, committen und erneut auf main pushen. Vercel baut dann automatisch neu.

Die Datei vercel.json enthaelt eine Rewrite Regel, die jeden Pfad auf index.html leitet. Direkte Links und das Neuladen einer Unterseite funktionieren dadurch immer, auch wenn das Routing einmal von Hash Adressen auf Pfade umgestellt wuerde.

## 3. Inhalte aendern oder ergaenzen

Die vier Markdown Dateien im Ordner content sind die einzige Quelle der Wahrheit.

    content/01_kurs_woche1.md
    content/02_kurs_woche2.md
    content/03_kurs_woche3.md
    content/04_glossar_und_spickzettel.md

So gehst du vor

1. Die gewuenschte Datei im Ordner content bearbeiten. Der Aufbau jeder Lektion muss gleich bleiben, also Ueberschrift mit "## Lektion N · Titel", die Zeile mit Woche, Tag und Dauer, dann die Abschnitte Lernziele, Warum das fuer dich wichtig ist, Inhalt, Visuals, Zusammenfassung und Test. Fragen brauchen genau vier Antworten A) bis D), eine Zeile "Richtig ist X." und eine Zeile, die mit "Erklärung." beginnt.
2. npm run generate ausfuehren. Das Skript liest die Markdown Dateien und schreibt die typisierten Daten nach src/content/generated. Bei einem Strukturfehler bricht es mit Dateiname und Zeilennummer ab, dann die Stelle korrigieren und nochmals ausfuehren.
3. npm test ausfuehren. Die Tests pruefen unter anderem die Anzahl Lektionen und Fragen und die Textregeln, also kein Bindestrich, kein Doppelpunkt und kein Eszett im sichtbaren Text.
4. Die geaenderten Dateien committen, auch die generierten unter src/content/generated, und auf main pushen. Der naechste Vercel Build fuehrt npm run generate ohnehin nochmals aus, so wird jede Inhaltsaenderung sicher uebernommen.

Die Texte der Oberflaeche, also Knoepfe und Meldungen, liegen gesammelt in src/ui/strings.ts. Die Visuals liegen in src/visuals, pro Lektion ein Ordner, pro Visual eine Datei.

## 4. Tests und Qualitaetslauf

    npm test            alle Vitest Tests, Parser, Inhalte, Speicher, Quiz, Suche
    npm run lint        ESLint ohne Warnungen
    npm run typecheck   TypeScript im strikten Modus
    npm run build       Produktion bauen, inklusive Service Worker

Der komplette Browserdurchlauf oeffnet jede Lektion in Chromium, prueft alle Visuals, macht jeden Test mit Zufallsantworten, prueft die Handyansicht mit 390 Pixel Breite und legt Screenshots in den Ordner screenshots

    npm run build
    npm run preview
    node scripts/qa.mjs

Er meldet jeden Konsolenfehler und jede Warnung und bricht dann ab. Fuer die Lighthouse Messung auf dem Produktionsbuild

    npx lighthouse http://localhost:4173 --preset=desktop
    npx lighthouse http://localhost:4173

Die Resultate der letzten vollstaendigen Messung stehen im ABSCHLUSSBERICHT.md.
