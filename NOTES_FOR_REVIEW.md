# Notizen fuer die Durchsicht

Beobachtungen aus dem Inhalt und Entscheidungen beim Bau der Visuals. Der Kursinhalt selbst wurde an keiner Stelle veraendert.

## Inhalt

### Lektion 9, Frage 1

Die Antwort D lautet "Beides, B und C, treffen zu" und bezieht sich auf die Buchstaben der anderen Antworten. Da die Plattform die Antworten bei jedem Versuch mischt, wuerden die Buchstaben nach dem Mischen auf falsche Antworten zeigen. Loesung in der Plattform. Genau diese Frage behaelt ihre Originalreihenfolge, alle anderen Fragen werden gemischt. Falls die Frage einmal ohne Buchstabenbezug umformuliert wird, kann die Ausnahme in scripts/parse.mjs (FIXED_ORDER_QUESTION_IDS) entfernt werden. Der Parser erkennt solche Bezuege und bricht ab, wenn eine neue Frage dieser Art dazukommt, ohne dass sie in der Liste steht.

### Lektion 18, Frage 5

Die Antwort B enthaelt "A für den Farbton". Das ist die Zahnfarbe A des Farbrings, kein Bezug auf eine Antwortmoeglichkeit. Diese Frage wird normal gemischt. Nur als Abgrenzung zur Notiz oben festgehalten.

## Visuals

An einigen Stellen verlangt die Visualbeschreibung Zahlen oder Details, die der Lektionstext nicht hergibt. Dort zeigen die Visuals bewusst nur, was der Inhalt deckt, oder sie sind als Beispiel gekennzeichnet.

* Lektion 2, Zahndurchbruch. Der Inhalt nennt Altersfenster pro Zahngruppe. Fuer den Schieberegler wurden die einzelnen Zaehne innerhalb dieser Fenster verteilt, damit die Animation fliessend wirkt. Die eingeblendeten Texte nennen nur die Angaben aus der Lektion.
* Lektion 7, DH Sitzung. Die Beschreibung wuenscht Minutenangaben pro Schritt, der Inhalt nennt nur die Gesamtdauer von 45 bis 60 Minuten. Das Visual zeigt deshalb die Gesamtdauer.
* Lektion 7, Recall Intervalle. Die Beschreibung nennt drei Risikostufen, die Lektion listet vier Gruppen (gesund, erhoehtes Risiko, Parodontitis, Implantate). Das Visual zeigt die vier Gruppen aus der Lektion.
* Lektion 8, Dosisvergleich. Die Balkenpositionen liegen innerhalb der im Text genannten Bereiche (wenige, 10 bis 30, einige Dutzend bis einige Hundert, einige Tausend Mikrosievert). Exakte Werte nennt der Text bewusst nicht, darum nennt auch das Visual nur die Bereiche.
* Lektion 11, Kronenrechnung. Die Anteile im gestapelten Balken sind illustrativ. Die Lektion sagt nur, dass der Laboranteil erheblich ist.
* Lektion 15, Reevaluation. Die Taschenwerte im Zahnschema sind als Beispielwerte gekennzeichnet.
* Lektion 20, Beispielrechnung. Positionen und Taxpunktzahlen sind fiktive Anschauungswerte und als solche beschriftet. Der Taxpunktwert im Beispiel betraegt 1.20 Franken.
* Lektion 21, Fallkarten. Die Karte laesst die Lernende zuerst ihre Einordnung waehlen und klappt dann die Denkweise aus der Lektion auf. Es gibt bewusst kein richtig oder falsch pro Klick, weil die Lektion die Einordnungen nicht als eindeutige Kategorien vorgibt. Die Falltexte kommen direkt aus den generierten Lektionsdaten, nichts ist doppelt gepflegt.

## Offene Punkte

Keine. Der Inhalt war vollstaendig, strukturell fehlerfrei und hielt alle Textregeln ein (kein Bindestrich, kein Doppelpunkt, kein Eszett im sichtbaren Text).
