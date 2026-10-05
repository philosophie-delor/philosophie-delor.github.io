# Eigene Anpassungen am Hugo-Book-Theme

## Styles

`assets/styles/index.yaml` legt die Reihenfolge der Styles fest. Hugo Book erzeugt daraus eine einzige minimierte CSS-Datei mit Fingerprint. Die Templates betten keine Kopien dieser Dateien mehr ein.

- `custom.css` enthält Farben, Glasflächen, Höhenlinien, Banner und äußere Abstände.
- `delor-overview.css` enthält Artikelübersichten, Beschreibungen, Metadaten und Kategorie-Schaltflächen.
- `delor-search.css` enthält Seitenleistensuche, Detailsuche und das Ergebnis-Dropdown der oberen Leiste.
- `delor-navigation.css` enthält obere Leiste, Seitenleisten, Overlays, Theme-Buttons und responsive Regeln.

Die Layoutvariablen stehen am Anfang des Hauptabschnitts in `delor-navigation.css`. Die bisherigen Werte bleiben erhalten. Das Hauptlayout ist höchstens 1440px breit, der Lesebereich höchstens 720px beziehungsweise 76ch. Die linke Seitenleiste wächst von 220px auf 300px, die rechte von 240px auf 360px.

Unter 1400 CSS-Pixeln wird die rechte Seitenleiste zum Overlay, unter 900 CSS-Pixeln zusätzlich die linke. Diese beiden Grenzen stehen auch in `assets/js/delor-navigation.js` und müssen bei späteren Änderungen übereinstimmen. Die Sichtbarkeit des Suchfelds ab 1120px wird zusätzlich in `delor-top-search.js` berücksichtigt.

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
