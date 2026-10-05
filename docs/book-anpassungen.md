# Eigene Anpassungen am Hugo-Book-Theme

## Styles

`assets/styles/index.yaml` legt die Reihenfolge der Styles fest. Hugo Book erzeugt daraus eine einzige minimierte CSS-Datei mit Fingerprint. Die Templates betten keine Kopien dieser Dateien mehr ein.

- `custom.css` enthält Farben, Glasflächen, Höhenlinien, Banner und äußere Abstände.
- `delor-overview.css` enthält Artikelübersichten, Beschreibungen, Metadaten und Kategorie-Schaltflächen.
- `delor-search.css` enthält Seitenleistensuche, Detailsuche und das Ergebnis-Dropdown der oberen Leiste.
- `delor-navigation.css` enthält Seitenleisten, Overlays, Theme-Buttons und responsive Regeln.
- `delor-topbar.css` enthält die obere Leiste und ihre aufklappbaren Menüs.

Die Layoutvariablen stehen am Anfang des Hauptabschnitts in `delor-navigation.css`. Die bisherigen Werte bleiben erhalten. Das Hauptlayout ist höchstens 1440px breit, der Lesebereich höchstens 720px beziehungsweise 76ch. Die linke Seitenleiste wächst von 220px auf 300px, die rechte von 240px auf 360px.

Unter 1400 CSS-Pixeln wird die rechte Seitenleiste zum Overlay, unter 900 CSS-Pixeln zusätzlich die linke. Diese beiden Grenzen stehen auch in `assets/js/delor-navigation.js` und müssen bei späteren Änderungen übereinstimmen. Die obere Leiste misst ihren verfügbaren Platz selbst. Für die Suche gibt es keine feste Ausblendgrenze mehr.

Hugo Book verwendet für seine ursprüngliche mobile Navigation 56rem. Die entsprechend markierten Fallback-Regeln erhalten dieses Verhalten, solange das eigene Navigationsskript noch nicht initialisiert ist. Sie sind kein zweiter Satz Regeln für die aktive eigene Navigation.

Beim Aktualisieren des Book-Themes die eigene `assets/styles/index.yaml` mit der gleichnamigen Datei im Theme vergleichen. Neu hinzukommende Theme-Styles müssen dort ebenfalls aufgenommen werden.

## Theme-Steuerung

`docs/inject/head.html` stellt die gespeicherte Auswahl vor dem ersten Seitenaufbau wieder her. `delor-theme.js` steuert danach alle Theme-Buttons und ihre Synchronisation. Die Auswahl bleibt unter dem bisherigen Schlüssel `book-ayu-theme` gespeichert.

Die drei Seitenleistenbuttons werden unmittelbar im Template `docs/inject/menu-after.html` ausgegeben. Es gibt keine versteckten Vorgängerbuttons und keine nachträgliche Ersetzung mehr. Die Symbole für beide Positionen stammen aus `delor/theme-icon.html`.

`delor-theme-images.js` behält seine Aufgabe für Hell-/Dunkel-Bildvarianten. Die Banner-URLs werden weiterhin durch `delor/theme-images-head.html` pro Build aufgelöst.

## Suche

`delor-search-index.js` lädt MiniSearch und die Suchdaten für die obere Schnellsuche und die Detailsuche. Beide teilen sich innerhalb einer Seite denselben Index. Verschiedene Sprachindizes bleiben getrennt. Fehlgeschlagene Ladevorgänge können erneut versucht werden.

`delor-top-search.js` und `delor-full-search.js` enthalten die jeweilige Bedienung und Ergebnisdarstellung. Die ursprüngliche Book-Seitenleistensuche bleibt beim Suchskript des Themes.

Die eigenen Skripte werden mit `defer` in definierter Reihenfolge aus `docs/inject/head.html` eingebunden. Das Skript der Detailsuche wird nur auf Seiten mit dem Layout `delor-search` geladen.

## Artikelinformationen

Alle Artikel verwenden `docs/post-meta.html` für Datum und Kategorien. `delor/article-categories.html` liefert die Kategorie-Schaltflächen auch für die Vorschaukarten. Die bisherigen Datumsformate bleiben erhalten. Die Ausgabe von Beschreibung und Lesezeit bleibt im Artikelheader.

## Umfang der Aufräumarbeiten

Inhalte, Übersetzungen, Bilder, Theme-Submodule und Deployment bleiben unverändert. In `hugo.yaml` wurde die doppelte Schreibweise von `defaultContentLanguage` entfernt. Die übrigen Stack-Einstellungen und Sicherungsdateien bleiben erhalten, damit sie für den getrennten Stack-Vergleich verfügbar sind.

## Obere Leiste

`delor-topbar.js` misst die tatsächlichen Breiten einschließlich Beschriftungen und Steuerelementen. Das Suchfeld wird zwischen 160 und 300px breit. Bei Platzmangel werden zuerst zusätzliche Menüpunkte, danach Sprach- und Theme-Schalter ausgeblendet. Diese Funktionen bleiben in der Seitenleiste verfügbar. Erst danach wird der Titel gekürzt und das Suchfeld bei Bedarf über das Suchsymbol aufgeklappt.

Der Titel steht links, direkt hinter dem Menübutton, falls dieser eingeblendet ist. Danach folgen die Hauptabschnitte. Suche und weitere Bedienelemente bleiben rechts. Die visuelle Reihenfolge und die Tab-Reihenfolge stimmen überein.

Die Leiste zeigt höchstens drei sichtbare Hauptabschnitte nach ihrer Gewichtung. `params.DelorTopMenuLimit` kann diese Anzahl ändern. Unterseiten werden rekursiv als aufklappbare Menüs ausgegeben. Jeder aufgeklappte Abschnitt enthält einen Link zu seiner Übersicht. Ausgeblendete Hauptabschnitte bleiben im Hauptmenü erreichbar.

Die Suchseiten müssen unter dem aktiven `content`-Verzeichnis liegen. In `content_org` archivierte Dateien werden von Hugo nicht als Seiten gebaut. Der Patch stellt die vorhandenen deutschen und englischen Suchseiten in `content/detailsuche` wieder her. `delor/search-page.html` findet die Detailsuche auch dann noch, wenn sie später verschoben wird und das Layout `delor-search` behält.

## Rechte Seitenleiste

`delor/right-sidebar.html` liefert die Seitenleiste für Startseite, Abschnittsübersichten, Artikel, Kategorieansichten und Detailsuche. Unter dem Inhaltsverzeichnis stehen die Kategorien der aktuellen Sprachfassung. `bookToC: false` blendet nur das Inhaltsverzeichnis aus, die Kategorien bleiben verfügbar.

Ab 1400 CSS-Pixeln bleibt die rechte Spalte reserviert, auch wenn sie ausnahmsweise leer ist. Leere Flächen werden dann unsichtbar gehalten. Auf schmaleren Fenstern gilt weiterhin das Overlay-Verhalten. Ein vollständig leeres Overlay hat keinen Öffnen-Button.
