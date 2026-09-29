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

## 4. Synchronisation zwischen Geraeten

Der Lernstand kann automatisch zwischen MacBook, Handy und weiteren Geraeten abgeglichen werden. Dafuer braucht die Plattform eine kleine Datenablage in deinem Vercel Projekt. Sie wird einmalig eingerichtet und die Zugangsdaten werden automatisch hinterlegt, es muss nichts im Code eingetragen werden. Der kleinste Plan bei Upstash heisst Pay as you go und kostet 0.2 Dollar pro 100 000 Befehle. Ein Abgleich braucht nur ein bis zwei Befehle, darum bleiben die Kosten auch bei taeglichem Lernen auf mehreren Geraeten bei wenigen Rappen pro Jahr.

Einmalige Einrichtung

1. Im Vercel Dashboard das Projekt learning_platform oeffnen und oben den Reiter Storage waehlen.
2. Create Database anklicken und Upstash for Redis auswaehlen, je nach Ansicht heisst es auch Upstash KV oder Redis. Den Plan Pay as you go nehmen, das ist der kleinste, einen beliebigen Namen vergeben und die Datenbank mit dem Projekt learning_platform verbinden.
3. Danach einmal neu deployen, damit die Funktion die Zugangsdaten erhaelt. Unter Deployments beim obersten Eintrag das Menue mit den drei Punkten oeffnen und Redeploy waehlen. Alternativ genuegt auch der naechste Push auf main.

Geraete koppeln

1. Auf dem ersten Geraet die Einstellungen oeffnen und Synchronisation einschalten druecken. Es erscheint ein Geraetecode.
2. Kopplungslink kopieren druecken und den Link an dich selbst schicken, zum Beispiel per Nachricht oder Mail. Auf dem anderen Geraet den Link oeffnen, fertig. Alternativ kann dort auch der Code von Hand eingegeben werden.
3. Ab jetzt gleichen sich die Geraete automatisch ab, beim Oeffnen der Seite, beim Wechsel zurueck in den Browser und kurz nach jeder abgeschlossenen Lektion oder jedem Test. In den Einstellungen zeigt eine Statuszeile den letzten Abgleich, dort gibt es auch Jetzt abgleichen und Synchronisation ausschalten.

Gut zu wissen

* Der Geraetecode ist der Schluessel zu deinem Lernstand. Nur Geraete mit diesem Code sehen ihn. Wer die Webseite ohne Code oeffnet, sieht nichts von deinem Fortschritt.
* Synchronisiert werden Lernstand, Testversuche und die Anki Lernkarten samt Wiederholungsplan. Der Dunkelmodus bleibt bewusst pro Geraet einstellbar.
* Ohne eingerichtete Datenablage funktioniert die Plattform wie bisher, nur eben pro Geraet. Die Einstellungen zeigen in dem Fall einen Hinweis mit diesen Schritten.
* Lokal mit npm run dev gibt es den Abgleichdienst nicht, er laeuft nur auf der veroeffentlichten Seite.

## 5. Anki Lernkarten

Die Seite Anki wiederholt selbst erstellte Lernkarten nach einem festen Plan, so wie das gleichnamige Programm.

Karten erstellen

* In einer Lektion eine Textstelle markieren. Ueber der Markierung erscheint der Knopf Lernkarte erstellen, ein Klick darauf oeffnet den Editor mit einem fertigen Vorschlag aus der markierten Stelle.
* Auf der Seite Anki laesst sich mit Neue Karte jederzeit eine Karte von Grund auf anlegen, inklusive Wahl der Lektion.
* Drei Kartenarten stehen bereit. Ja oder Nein, Auswahl A B C und Lueckentext. Beim Lueckentext genuegt ein Tipp auf ein Wort, um es zur Luecke zu machen, ein Tipp auf ein weiteres Wort verlaengert die Luecke bis dorthin.

Wiederholungsplan

* Eine neue Karte ist noch am selben Tag faellig, danach nach 1 Tag, nach 3 Tagen und nochmals nach 7 Tagen. Nach der vierten richtigen Antwort gilt die Karte als gelernt.
* Die Seite zeigt jeden Tag die Anzahl faelliger Karten, aufgeteilt nach Durchgang 1 bis 4. Durchgang 1 ist die erste Wiederholung am Erstelltag.
* Beim Lernen prueft die Seite jede Antwort und zeigt bei einem Fehler die richtige Loesung. Eine falsch beantwortete Karte kommt am selben Tag so lange wieder, bis sie richtig beantwortet ist. Erst dann rueckt sie im Plan weiter.

Verwaltung

* Auf der Seite Anki sind alle Karten nach Woche und darunter nach Lektion gruppiert. Dort lassen sie sich bearbeiten und loeschen.
* Die Karten laufen ueber die gleiche Synchronisation wie der Lernstand und erscheinen damit automatisch auch auf dem anderen Geraet.

## 6. Notizen

Zu jeder Lektion gibt es ein eigenes Notizblatt im Stil eines Hefts, mit Linien und rotem Rand, aber in der Schrift der Plattform.

* In der Lektion den Knopf Notizen druecken. Auf grossen Bildschirmen teilt sich die Seite, links der Lernstoff, rechts das Heft. Auf dem Handy legt sich das Heft ueber die Lektion.
* Beim Schreiben stehen Titel, Untertitel, Fett, Kursiv, Unterstrichen, Aufzaehlung, nummerierte Liste, drei Schriftarten und vier Schriftgroessen bereit.
* Der Knopf Speichern sichert sofort, zusaetzlich sichert das Heft kurz nach dem Tippen automatisch. Die Notizen wandern ueber die Synchronisation mit auf die anderen Geraete.
* Die Seite Notizen sammelt alle Notizblaetter nach Woche und Lektion. Dort gibt es pro Notiz Kopieren fuer die Notizen App auf MacBook oder Handy, Teilen fuers Handy, Als PDF drucken sowie Loeschen, und oben Alle als PDF drucken.

## 7. Tests und Qualitaetslauf

    npm test            alle Vitest Tests, Parser, Inhalte, Speicher, Quiz, Suche
    npm run lint        ESLint ohne Warnungen
    npm run typecheck   TypeScript im strikten Modus
    npm run build       Produktion bauen, inklusive Service Worker

Der komplette Browserdurchlauf oeffnet jede Lektion in Chromium, prueft alle Visuals, macht jeden Test mit Zufallsantworten, prueft die Handyansicht mit 390 Pixel Breite und legt Screenshots in den Ordner screenshots. Der zweite Durchlauf prueft die Synchronisation mit zwei simulierten Geraeten und dem Kopplungslink. Der dritte Durchlauf prueft die Anki Karten, vom Markieren im Text ueber alle drei Kartenarten und eine Lernrunde mit Fehlversuch bis zu Bearbeiten, Loeschen und Neuladen. Der vierte Durchlauf prueft die Notizen, vom Schreiben und Formatieren im Heft ueber Speichern, Kopieren und den PDF Druck bis zu Bearbeiten, Loeschen und Neuladen.

    npm run build
    npm run preview
    node scripts/qa.mjs
    node scripts/qa-sync.mjs
    node scripts/qa-anki.mjs
    node scripts/qa-notes.mjs

Er meldet jeden Konsolenfehler und jede Warnung und bricht dann ab. Fuer die Lighthouse Messung auf dem Produktionsbuild

    npx lighthouse http://localhost:4173 --preset=desktop
    npx lighthouse http://localhost:4173

Die Resultate der letzten vollstaendigen Messung stehen im ABSCHLUSSBERICHT.md.
