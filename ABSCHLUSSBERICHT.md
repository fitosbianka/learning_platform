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

## Nachtrag. Synchronisation zwischen Geraeten

Auf Wunsch nachgeruestet. Der Lernstand gleicht sich automatisch zwischen allen gekoppelten Geraeten ab.

* Eine kleine Serverfunktion unter api/sync.ts speichert pro Geraetecode einen Datensatz in einer Upstash Redis Datenbank, die einmalig im Vercel Dashboard angelegt und mit dem Projekt verbunden wird. Die Schritte stehen im README unter Synchronisation
* Gekoppelt wird mit einem einmaligen Geraetecode oder noch einfacher mit einem Kopplungslink, den man auf dem anderen Geraet oeffnet
* Die App gleicht beim Oeffnen, beim Zurueckwechseln in den Browser, in einem sanften Intervall und kurz nach jeder Aenderung ab. Zusammenfuehren statt Ueberschreiben, Testversuche gehen nie verloren
* Ohne eingerichtete Datenablage laeuft alles wie bisher, die Einstellungen zeigen dann eine freundliche Anleitung
* Der Dunkelmodus bleibt bewusst eine Einstellung pro Geraet
* Abgesichert mit 10 neuen Tests fuer Codes, Datensaetze, Zusammenfuehrung und Transport sowie einem eigenen Browserdurchlauf mit zwei simulierten Geraeten, Kopplungslink und dem Fall ohne Datenablage, alles ohne Konsolenfehler. Lighthouse bleibt bei 100 in allen Kategorien

## Nachtrag. Anki Lernkarten

Auf Wunsch nachgeruestet. Eine eigene Seite Anki mit selbst erstellten Lernkarten und festem Wiederholungsplan, angelehnt an das gleichnamige Programm.

* In jeder Lektion laesst sich eine Textstelle markieren, darueber erscheint der Knopf Lernkarte erstellen. Der Editor oeffnet sich mit einem fertigen Vorschlag aus der markierten Stelle, beim Lueckentext ist das laengste Wort bereits als Luecke vorgeschlagen
* Drei Kartenarten. Ja oder Nein, Auswahl A B C und Lueckentext. Die Luecke wird durch einfaches Antippen eines Wortes gewaehlt, ein Tipp auf ein weiteres Wort verlaengert sie bis dorthin
* Fester Plan. Faellig am Erstelltag, dann nach 1, 3 und 7 Tagen, nach der vierten richtigen Antwort gilt die Karte als gelernt. Die Seite zeigt die faelligen Karten pro Tag, aufgeteilt nach Durchgang 1 bis 4
* Beim Lernen wird jede Antwort geprueft, bei einem Fehler zeigt die Seite die richtige Loesung und die Karte kommt am selben Tag so lange wieder, bis sie sitzt. Erst die richtige Antwort rueckt sie im Plan weiter
* Auf der Seite Anki sind die Karten nach Woche und Lektion gruppiert und lassen sich dort bearbeiten, loeschen oder komplett neu anlegen
* Die Karten wandern ueber die bestehende Synchronisation mit auf alle gekoppelten Geraete, geloeschte Karten bleiben geloescht, auch wenn ein anderes Geraet noch eine alte Kopie hat
* Abgesichert mit 19 neuen Tests fuer Plan, Luecken, Antwortpruefung, Zusammenfuehrung, Editor, Lernrunde und Seite sowie einem eigenen Browserdurchlauf, der das Markieren, alle drei Kartenarten, eine Lernrunde mit Fehlversuch, Speicherung, Bearbeiten, Loeschen und Neuladen prueft, alles ohne Konsolenfehler. Lighthouse bleibt auf der Startseite bei 100 in allen Kategorien, die Seite Anki erreicht 99 bei der Performance und sonst 100

## Nachtrag. Notizen

Auf Wunsch nachgeruestet. Ein Heft fuer eigene Notizen direkt neben dem Lernstoff.

* In jeder Lektion oeffnet der Knopf Notizen ein Notizblatt im Heftlook mit Linien und rotem Rand, auf grossen Bildschirmen als geteilte Ansicht neben dem Text, auf dem Handy als Blatt ueber der Lektion. Die Schrift bleibt die der Plattform
* Formatierung mit Titel, Untertitel, Fett, Kursiv, Unterstrichen, Aufzaehlung, nummerierter Liste, drei Schriftarten und vier Schriftgroessen
* Speichern per Knopf und zusaetzlich automatisch kurz nach dem Tippen, auch beim Verlassen der Ansicht geht nichts verloren. Die Notizen synchronisieren auf alle gekoppelten Geraete, Loeschungen setzen sich durch
* Die Seite Notizen gruppiert alle Blaetter nach Woche und Lektion, mit Kopieren fuer die Notizen App auf MacBook und Handy, Teilen ueber das Teilen Menue des Handys, PDF Druck pro Notiz oder fuer alles zusammen und Loeschen mit Rueckfrage
* Gespeicherte Notizen werden beim Laden bereinigt, sodass nur die Elemente des Editors im Speicher landen
* Abgesichert mit 23 neuen Tests und einem eigenen Browserdurchlauf fuer Schreiben, Formatieren, Speichern, Kopieren, Drucken, Bearbeiten, Loeschen und Neuladen, alles ohne Konsolenfehler. Lighthouse bleibt auf der Startseite bei 100 in allen Kategorien, die Seite Notizen erreicht 99 bei der Performance und sonst 100

## Notizen zum Inhalt

Der Inhalt war vollstaendig und strukturell fehlerfrei, es musste nichts korrigiert werden. Die Beobachtungen und die Behandlung der Spezialfaelle stehen in NOTES_FOR_REVIEW.md.
