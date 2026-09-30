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

Auf Wunsch nachgeruestet. Eigene Notizen direkt neben dem Lernstoff.

* In jeder Lektion oeffnet der Knopf Notizen die Notizansicht, auf grossen Bildschirmen als geteilte Ansicht neben dem Text, auf dem Handy ueber der Lektion. Look und Schrift entsprechen dem Rest der Plattform
* Formatierung mit Titel, Untertitel, Fett, Kursiv, Unterstrichen, Aufzaehlung, nummerierter Liste, drei Schriftarten und vier Schriftgroessen
* Speichern per Knopf und zusaetzlich automatisch kurz nach dem Tippen, auch beim Verlassen der Ansicht geht nichts verloren. Die Notizen synchronisieren auf alle gekoppelten Geraete, Loeschungen setzen sich durch
* Die Seite Notizen gruppiert alle Blaetter nach Woche und Lektion, mit Kopieren fuer die Notizen App auf MacBook und Handy, Teilen ueber das Teilen Menue des Handys, PDF Druck pro Notiz oder fuer alles zusammen und Loeschen mit Rueckfrage
* Gespeicherte Notizen werden beim Laden bereinigt, sodass nur die Elemente des Editors im Speicher landen
* Abgesichert mit 23 neuen Tests und einem eigenen Browserdurchlauf fuer Schreiben, Formatieren, Speichern, Kopieren, Drucken, Bearbeiten, Loeschen und Neuladen, alles ohne Konsolenfehler. Lighthouse bleibt auf der Startseite bei 100 in allen Kategorien, die Seite Notizen erreicht 99 bei der Performance und sonst 100

## Nachtrag. Leuchtstift und fertige Kartenvorschlaege

Auf Wunsch nachgeruestet.

* Beim Markieren einer Textstelle erscheinen jetzt zwei Knoepfe. Markieren malt die Stelle dauerhaft mit dem gelben Leuchtstift an, Lernkarte macht daraus eine Karte. Markierungen ueberleben das Neuladen, synchronisieren auf alle Geraete und lassen sich per Tipp und Markierung entfernen wieder loeschen
* Der Karteneditor bringt fuer jede Kartenart einen fertigen Vorschlag aus der markierten Stelle mit. Bei Auswahl A B C wird das Schluesselwort zur Luecke in der Frage und zwei plausible falsche Antworten kommen aus dem Glossar, sodass die Karte ohne Tippen speicherbar ist
* Die geteilte Ansicht nutzt seit dem letzten Nachtrag die volle Bildschirmbreite, die Notizen tragen durchgehend den klaren Look der Plattform und die Auswahlfelder der Werkzeugleiste den Chip Stil der Seite
* Abgesichert mit 12 neuen Tests fuer Verankerung im Text, Zusammenfuehrung, Speicherung und Vorschlaege sowie erweiterten Browserdurchlaeufen fuer Leuchtstift und Vorschlaege, alles ohne Konsolenfehler

## Nachtrag. Fragekarten mit ehrlicher Selbsteinstufung

Auf Wunsch nachgeruestet. Die Kartenart Ja oder Nein ist durch Frage und Antwort ersetzt, dazu kommt eine strengere Regel im Plan.

* Aus einer markierten Stelle schreibt die Plattform automatisch eine Frage. Saetze wie X ist Y werden zu Was ist X, sonst fragt die Karte nach dem Schluesselwort, die markierte Stelle liegt als Antwort auf der Rueckseite
* Beim Lernen beantwortet man die Frage zuerst fuer sich, deckt mit Antwort zeigen auf und stuft mit Gewusst oder Nicht gewusst ehrlich ein
* Jede falsche oder nicht gewusste Antwort wirft die Karte zurueck auf Durchgang 1, egal bei welcher Kartenart. Sie bleibt am selben Tag in der Runde, bis sie sitzt, und laeuft den Plan mit 1, 3 und 7 Tagen von vorne
* Bereits gespeicherte Ja oder Nein Karten werden beim Laden automatisch in Fragekarten umgewandelt, es geht nichts verloren
* Abgesichert mit 6 neuen Tests fuer Rueckstufung, Umwandlung, Fragevorschlag und die Selbsteinstufung im Lauf sowie dem angepassten Browserdurchlauf, alles ohne Konsolenfehler

## Nachtrag. Klügere Vorschlaege, Bilder in den Notizen, sauberer Druck

Auf Wunsch nachgeruestet.

* Die Fragevorschlaege lesen jetzt den Zusammenhang mit. Sie erkennen gaengige Satzmuster wie X ist Y, X besteht aus Y, X liegt in Y, X entsteht durch Y oder X hat 20 Y und formen daraus praezise Fragen wie Was ist X, Woraus besteht X, Wo liegt X, Wie entsteht X oder Wie viele Y hat X. Ein kurz markierter Fachbegriff wird ueber seinen ganzen Satz erklaert. Auf der Rueckseite steht nur noch die kurze Antwort statt des ganzen Texts, das lernt sich schneller
* Die falschen Antworten der Auswahlkarten kommen bevorzugt aus dem Glossar derselben Lektion und sind damit deutlich plausibler
* Ein Tipp auf eine Zeichnung in der Lektion bietet Bild in die Notizen einfügen an. Die Zeichnung wird mit den echten Farben als Vektorbild in die Notiz gelegt, samt Bildunterschrift, synchronisiert mit und bleibt beim PDF Druck gestochen scharf. Ist die Notizansicht offen, landet das Bild direkt im Editor, ohne dass Getipptes verloren geht
* Der PDF Druck traegt jetzt ein sauberes Lernblatt Layout. Kopfzeile, unterstrichener Lektionstitel, Datumszeile, farbige Zwischentitel, kompakte Listen, Seitenraender von 18 Millimetern, Bilder mit Rahmen und Seitenumbrueche, die Titel nicht von ihrem Text trennen
* Abgesichert mit 7 neuen Tests fuer die Satzmuster, den Kontext, die Glossarauswahl, das Bild im Speicher und den Schnappschuss der Zeichnungen sowie dem erweiterten Browserdurchlauf samt echtem PDF, alles ohne Konsolenfehler

## Nachtrag. Mehrere Luecken pro Karte

Auf Wunsch nachgeruestet. Der Lueckentext kann jetzt mehrere getrennte Luecken halten, die Woerter dazwischen bleiben sichtbar.

* Im Editor gibt es zwei Wege, ueber zwei Knoepfe waehlbar. Einzelne Woerter, jedes angetippte Wort wird eine eigene Luecke und ein zweiter Tipp entfernt sie. Von Wort zu Wort, erstes und letztes Wort antippen und alles dazwischen wird eine Luecke, das erste Wort traegt bis dahin eine gestrichelte Markierung
* Beim Lernen steht fuer jede Luecke ein eigenes Feld mitten im Satz, geprueft wird alles zusammen, nach dem Pruefen faerben sich die Luecken einzeln gruen oder rot
* Bestehende Karten mit einer Luecke werden beim Laden automatisch ins neue Format uebernommen
* Abgesichert mit 4 neuen Tests fuer Zusammenlegen, Segmente, Mehrfachantworten und die Umwandlung sowie neuen Editor und Lernlauf Tests, alles ohne Konsolenfehler

## Nachtrag. Ausrichtung, Unterpunkte und Leuchtstift in den Notizen

Auf Wunsch nachgeruestet.

* Jeder Absatz laesst sich links, zentriert oder rechts ausrichten, ueber drei neue Knoepfe in der Werkzeugleiste
* Die Tab Taste macht aus einem Listenpunkt einen Unterpunkt und aus dem einen Unterunterpunkt, Shift und Tab hebt ihn wieder an. Fuers Handy gibt es dieselben zwei Einrueckknoepfe in der Leiste, die Ebenen tragen eigene Aufzaehlungszeichen
* Der gelbe Leuchtstift markiert die ausgewaehlte Stelle in der Notiz, ein Tipp in eine markierte Stelle plus Leuchtstift entfernt sie wieder. Nach dem Markieren schreibt es sich normal weiter, der Stift klebt nicht am Text
* Ausrichtung, verschachtelte Listen und Markierungen ueberleben Speichern, Synchronisation, die Seite Notizen und den PDF Druck, die Markerfarbe wird beim Drucken ausdruecklich mitgedruckt
* Abgesichert mit 6 neuen Tests fuer die Bereinigung von Ausrichtung, Marker und verschachtelten Listen sowie den Leuchtstift selbst, dazu der erweiterte Browserdurchlauf mit Tab, Marker und Zentrierung bis ins Druckblatt, alles ohne Konsolenfehler

## Nachtrag. Lernkarten aus den Notizen

Auf Wunsch nachgeruestet. Markierter Text in den eigenen Notizen bietet jetzt ebenfalls eine Lernkarte an.

* Im Schreibbereich neben der Lektion erscheint bei einer Auswahl der Knopf Lernkarte, die Karte gehoert zur Lektion der Notiz
* Auf der Seite Notizen genauso, dort erkennt der Editor die Lektion der angewaehlten Notiz und stellt sie im Auswahlfeld voreingestellt bereit
* Die fertigen Vorschlaege fuer alle drei Kartenarten funktionieren wie beim Markieren im Lernstoff, samt Satzmuster und Glossarantworten
* Abgesichert im Browserdurchlauf fuer beide Wege bis in den Kartenspeicher, ohne Konsolenfehler

## Nachtrag. Lernen wie am Kartentisch

Auf Wunsch nachgeruestet.

* Waehrend einer Lernrunde steht die Karte gross und mittig auf dem Bildschirm, der Seitenkopf tritt zurueck
* Die Leertaste oder ein Tipp auf die Karte geht voran. Frage, Antwort aufdecken, weiter. Bei Fragekarten zaehlt das als Gewusst, Nicht gewusst bleibt ein eigener Knopf, die Ziffern 1 und 2 funktionieren weiterhin, und waehrend des Tippens in eine Luecke bleibt die Leertaste ein normales Leerzeichen
* Die faelligen Karten kommen in jeder Runde in zufaelliger Reihenfolge statt in der Reihenfolge, in der sie geschrieben wurden
* Der Browserdurchlauf wurde so umgebaut, dass er jede zufaellige Reihenfolge meistert, und lief zweimal in Folge sauber durch, ohne Konsolenfehler

## Nachtrag. Sofortige Bewertung und grosszuegige Pruefung beim Lueckentext

Auf Wunsch nachgeruestet.

* Jede Luecke zeigt ihre Bewertung sofort. Ein passendes Wort faerbt das Feld schon beim Tippen gruen, ein falsches wird rot, sobald die Luecke verlassen wird, und beim Nachbessern springt die Farbe gleich wieder um
* Die Pruefung bewertet intelligent. Kleine Tippfehler gehen durch, ein Wort bis 4 Buchstaben muss exakt stimmen, bis 8 Buchstaben ist 1 Fehler erlaubt, bis 13 Buchstaben sind es 2 und darueber 3. Umlaute duerfen als ae, oe und ue geschrieben werden, die Woerter einer Antwort duerfen in anderer Reihenfolge stehen und zusammen oder getrennt geschrieben sein, und die richtigen Woerter zaehlen auch dann, wenn sie in vertauschten Luecken stehen
* Haelt die Pruefung eine Antwort faelschlich fuer falsch, steht im roten Feld neu der Knopf Meine Antwort war richtig. Er nimmt die Rueckstufung zurueck, die Karte zaehlt als gewusst und ihr Plan laeuft normal weiter
* Abgesichert mit 5 neuen Tests fuer Tippfehler, Umlautschreibweisen, Wortreihenfolge, vertauschte Luecken und den Ruecknahmeknopf samt erhaltenem Plan, dazu der erweiterte Browserdurchlauf, alles ohne Konsolenfehler

## Nachtrag. Karten wie geschrieben, zugeklappte Gruppen und Leuchtstift Reparatur

Auf Wunsch nachgeruestet.

* Die Lernkarte zeigt Frage und Antwort genau so, wie sie geschrieben wurden. Zeilenumbrueche und aufgezaehlte Zeilen bleiben beim Lernen erhalten, das Layout der Karte bleibt unveraendert
* Nach dem Pruefen einer Luecke bleibt die eigene Antwort im Satz stehen, gruen oder rot eingefaerbt, statt von der Loesung ueberschrieben zu werden. Die richtige Loesung steht darunter im Feld Richtig ist, neu auch dann, wenn eine grosszuegig gewertete Antwort leicht vom Original abweicht
* Auf der Seite Anki traegt jeder Lektionstitel einen Pfeil. Er klappt die Kartengruppe der Lektion zu und wieder auf, eine kleine Zahl zeigt die Karten darin. Auf der Seite Notizen klappt derselbe Pfeil jede Notiz zu und auf
* Der Leuchtstift in den Notizen laesst sich wieder entfernen. Ein zweiter Druck auf den Knopf bei angewaehlter markierter Stelle nimmt die Markierung weg. Das funktioniert jetzt auch, wenn die Auswahl knapp vor der Markierung beginnt oder knapp dahinter endet, wie es beim Ziehen mit der Maus praktisch immer passiert, und es entfernt mehrere Markierungen in einem Zug
* Abgesichert mit 5 neuen Tests fuer das Entfernen mit ungenauer Auswahl, mehrere Markierungen, gemischte Auswahl und die Klappgruppen beider Seiten, dazu die erweiterten Browserdurchlaeufe mit mehrzeiliger Antwort, stehen gebliebener eigener Antwort, Klappen und Leuchtstift Entfernung, alles ohne Konsolenfehler

## Nachtrag. Sicherungskopien und ein sicheres Zuruecksetzen

Nach einem Vorfall mit getrennten Synchronisationsablagen nachgeruestet, damit Lernstand nie mehr verloren gehen kann.

* Die Plattform legt auf jedem Geraet automatisch jeden Tag eine lokale Sicherungskopie des kompletten Lernstands an, zusaetzlich vor jedem Import und vor dem Zuruecksetzen. Die drei neuesten Kopien bleiben erhalten
* In den Einstellungen zeigt der neue Abschnitt Sicherungskopien jede Kopie mit Datum, Uhrzeit und Inhalt, etwa wie viele Lektionen, Lernkarten und Notizen darin stecken. Zusammenfuehren holt eine Kopie mit einem Klick zurueck und ergaenzt den aktuellen Stand, dabei geht nichts verloren
* Alles zuruecksetzen trennt jetzt zuerst die Synchronisation und wirkt nur noch auf das eigene Geraet. Vorher konnte ein Zuruecksetzen den leeren Stand in die Cloudablage schieben und so auch dort den Lernstand ueberschreiben, das ist damit ausgeschlossen
* Ein unlesbar gewordener Speicher wird nicht mehr stillschweigend durch einen frischen ersetzt, sondern unter einem Rettungsschluessel geparkt, damit nichts verloren geht
* Die Einstellungen sagen beim Einschalten der Synchronisation jetzt deutlich, dass nur das erste Geraet einschaltet und jedes weitere sich mit dem Kopplungslink oder dem Code verbindet, sonst entstehen getrennte Ablagen
* Abgesichert mit 6 neuen Tests fuer die Sicherungskopien, das Zusammenfuehren, das getrennte Zuruecksetzen und den Rettungsschluessel, insgesamt 168 Tests, dazu alle vier Browserdurchlaeufe, alles ohne Konsolenfehler

## Notizen zum Inhalt

Der Inhalt war vollstaendig und strukturell fehlerfrei, es musste nichts korrigiert werden. Die Beobachtungen und die Behandlung der Spezialfaelle stehen in NOTES_FOR_REVIEW.md.
