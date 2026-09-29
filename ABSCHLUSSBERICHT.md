# Abschlussbericht · Zahnmedizin Lernplattform

Stand 29.09.2026. Die Plattform ist fertig gebaut, getestet und auf GitHub gepusht.

## Was gebaut wurde

* Alle 21 Lektionen mit vollstaendigem Inhalt, Lernzielen, Callout, Zusammenfassung und Test, erzeugt aus den vier Markdown Dateien im Ordner content
* Alle 83 Visuals aus den Visualbeschreibungen, als eigene SVG Komponenten von Hand gezeichnet, inklusive interaktivem FDI Zahnschema mit Milchgebiss Umschalter und Uebungsmodus mit zehn Runden, Dosisvergleich mit Regler, Taxpunktrechner mit Regler, Schrittanimationen fuer Fuellung, Wurzelbehandlung, Krone, Autoklav und mehr
* Quiz mit gemischten Fragen und Antworten pro Versuch (seeded), Tastatursteuerung mit 1 bis 4 und Enter, Erklaerungen, Ergebnisseite, unbegrenzten Wiederholungen und Bestanden Logik fuer die Schlusspruefung ab 16 von 20
* Dashboard mit Fortschrittsring, drei Wochen, Haekchen, bester Punktzahl pro Lektion, "Als Naechstes" und direktem Einstieg in die Schlusspruefung
* Nachschlagen mit Glossarsuche ueber 176 Begriffe, Lektionslinks und fuenf Spickzetteln, im Zahnschema Spickzettel ist das interaktive Schema eingebettet
* Einstellungen mit Export und Import des Fortschritts als JSON, doppelt bestaetigtem Reset und Dunkelmodus, der beim ersten Besuch der Systemeinstellung folgt
* Speicherung in einem versionierten localStorage Schluessel mit Fallback in den Arbeitsspeicher, wenn der Browser kein Speichern erlaubt
* Offline Betrieb ueber einen generierten Service Worker, der nach dem Build alle Dateien inklusive der einzeln geladenen Lektionen vorlaedt
* vercel.json mit der Rewrite Regel auf index.html

## Lighthouse

Gemessen mit Lighthouse 12 auf dem Produktionsbuild (npm run build, vite preview), Chromium headless.

| Kategorie | Desktop | Mobile |
| --- | --- | --- |
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

Die Startseite laedt als Shell mit rund 84 Kilobyte gzip JavaScript, jede Lektion kommt als eigener Chunk von etwa 3 bis 10 Kilobyte gzip dazu, inklusive ihrer Visuals.

## Testresultate

* 65 Vitest Tests, alle gruen. Abgedeckt sind der Markdown Parser mit einer vollstaendigen und einer kaputten Fixture Lektion, die Validierung des echten Inhalts (21 Lektionen, Fragenzahlen, genau vier Antworten, eine richtige, Erklaerungen, keine doppelten Glossarbegriffe, Textregeln fuer Inhalt und Oberflaeche), der Shuffle mit Seed, das Speichermodul inklusive Fehlerfaellen, die Fortschrittslogik mit der Bestanden Schwelle, der komplette Quizablauf, die Fortschrittsanzeige des Dashboards und die Glossarsuche
* npm run build, npm run lint, npm run typecheck und npm test laufen alle ohne Fehler und ohne Warnungen durch
* Browserdurchlauf mit Playwright auf dem Produktionsbuild. Alle 21 Lektionen geoeffnet, bis unten gescrollt, alle 83 Visuals vorhanden, jede Lektion als gelesen markiert, jeder Test mit Zufallsantworten bis zur Ergebnisseite durchgespielt, Dashboard, Glossarsuche, Spickzettel und Einstellungen inklusive Dunkelmodus geprueft. Null Konsolenfehler, null Warnungen
* Gleicher Durchlauf zusaetzlich mit 390 Pixel Breite. Alle Lektionen und Visuals ohne horizontales Scrollen
* Screenshots aller 21 Lektionen, des Dashboards, der Spickzettel, der Einstellungen sowie Dunkelmodus und Handyansicht liegen im Ordner screenshots

## Entscheidungen

* Styling mit einer globalen Tokendatei (Farben, Typografie, Dunkelmodus) plus CSS Modules pro Komponente, kein Framework, keine Komponentenbibliothek
* Eigener kleiner Hash Router statt eines Routerpakets, jede Seite hat eine eigene Adresse
* Die Generierung schreibt pro Lektion eine eigene Datei, damit jede Lektion samt Visuals als eigener Chunk laedt. Die im Brief genannten Dateien lessons.ts, glossary.ts und cheatsheets.ts existieren unter src/content/generated, lessons.ts ist das Sammelmodul fuer Tests und Validierung. Zusaetzlich liegt dort content.json als Kontrollkopie
* Der Service Worker wird nach dem Build aus der fertigen Dateiliste erzeugt. Navigationen gehen zuerst ins Netz, damit eine neue Version sofort ankommt, Dateien mit Hash im Namen kommen aus dem Cache
* Systemschriften statt einer eingebetteten Schrift, dadurch keine Ladezeit und keine externen Anfragen
* Der Test einer Lektion ist erst nach "Lektion als gelesen markieren" sichtbar, wie im Brief beschrieben. Zusaetzlich gibt es den kleinen Knopf "Test schon jetzt machen", damit jeder Test jederzeit erreichbar bleibt, ebenfalls eine Vorgabe des Briefs
* Die Frage 1 in Lektion 9 verweist in einer Antwort auf die Buchstaben B und C. Nur diese Frage behaelt ihre Antwortreihenfolge, der Parser waecht darueber. Details in NOTES_FOR_REVIEW.md
* Bei Visualbeschreibungen, die Zahlen verlangen, die der Lektionstext nicht enthaelt, zeigen die Visuals nur die Angaben aus dem Text oder sind als Beispiel gekennzeichnet. Die vollstaendige Liste steht in NOTES_FOR_REVIEW.md
* Playwright liegt als Entwicklungsabhaengigkeit im Projekt, damit der Qualitaetslauf jederzeit wiederholbar ist. Der Ordner screenshots ist mit rund 11 Megabyte klein genug und liegt im Repository

## Deployment und Branch

Wichtig. Diese Arbeitsumgebung ist fest auf den Branch claude/eloquent-cray-syztyx eingestellt, direktes Pushen auf main ist hier nicht erlaubt. Der komplette Stand liegt auf diesem Branch auf GitHub.

Damit Vercel die Seite baut, den Branch auf main mergen, zum Beispiel auf GitHub ueber "Compare and pull request" und dann "Merge", oder lokal

    git checkout main
    git merge claude/eloquent-cray-syztyx
    git push origin main

Nach dem Merge erscheint das Deployment im Vercel Dashboard unter dem Projekt learning_platform. Die Live Adresse steht dort oben unter Domains. Falls der Build fehlschlaegt, zuerst die Build Logs des roten Deployments lesen, dann pruefen, dass das Framework Preset Vite ist, der Build Command npm run build und der Output Ordner dist.

## Notizen zum Inhalt

Der Inhalt war vollstaendig und strukturell fehlerfrei, es musste nichts korrigiert werden. Die Beobachtungen und die Behandlung der Spezialfaelle stehen in NOTES_FOR_REVIEW.md.
