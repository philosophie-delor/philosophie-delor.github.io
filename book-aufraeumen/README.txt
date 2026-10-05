Hugo Book – Aufräum-Patch

Basis
Repository philosophie-delor/philosophie-delor.github.io
Branch test/hugo-book
Commit 1f3cf82f53142e034e50839f5f0e110a074e8c19

Installation
1. ZIP entpacken und den Ordner book-aufraeumen ins Hugo-Projekt legen.
2. Im Terminal im Hauptverzeichnis des Projekts ausführen:

   bash book-aufraeumen/install.sh

Alternativ lässt sich das Projekt als Argument übergeben:

   bash /Pfad/zu/book-aufraeumen/install.sh /Pfad/zum/Hugo-Projekt

Das Skript prüft zuerst, ob Git den Patch vollständig anwenden kann.
Es überschreibt keine Dateien per blindem Kopieren und führt weder Commit noch Push aus.
Nach der Anwendung prüft es einen vollständigen Hugo-Build in einem temporären Ordner.
Bei einem Buildfehler nimmt es den Patch wieder zurück, sofern die gepatchten Dateien
zwischenzeitlich nicht verändert wurden. Hugo Extended in der für das Projekt bereits
verwendeten Version muss im Terminal erreichbar sein.

Anschließend mit hugo server -D anschauen.
Bitte beide Sprachen, Hell/Dunkel/Auto, Suche und Fensterbreiten vergleichen.
Auch das Öffnen und Schließen der Overlays während des Lesens prüfen.

Änderungen ansehen
   git diff
   git status --short

Die neu angelegten Dateien sind zunächst untracked und gehören zum Patch.
Zum späteren Commit alle im Patch enthaltenen Änderungen einschließlich neuer Dateien
aufnehmen. Den entpackten Installationsordner danach entfernen oder außerhalb des
Projekts aufbewahren, damit er nicht versehentlich mitcommittet wird.

Manuell ohne Installationsskript
   git apply --check book-aufraeumen/book-aufraeumen.patch
   git apply book-aufraeumen/book-aufraeumen.patch

Rücknahme vor weiteren Änderungen an denselben Stellen
   git apply --reverse --check book-aufraeumen/book-aufraeumen.patch
   git apply --reverse book-aufraeumen/book-aufraeumen.patch

Umfang
- Ein CSS-Bundle mit eindeutiger Reihenfolge statt mehrfach eingebetteter Styles.
- Zusammengefasste Regeln und zentrale Variablen für die bestehenden Layoutbreiten.
- Eigene Zuständigkeiten für Grundgestaltung, Artikel, Suche und Navigation.
- Direkt gerenderte Symbolbuttons mit gemeinsamer Theme-Steuerung.
- Gemeinsamer Suchindex für obere Schnellsuche und Detailsuche.
- Gemeinsame Datum-/Kategorienausgabe und wiederverwendete Kategorie-Schaltflächen.
- Entfernte doppelte Sprachkonfiguration und ergänzte Wartungsdokumentation.

Inhalte, Übersetzungen, Bilder und Theme-Submodule werden nicht verändert.
Die ursprüngliche Book-Seitenleistensuche bleibt unverändert.
Die alten Stack-Einstellungen und Sicherungen bleiben für den Theme-Vergleich erhalten.

Prüfstand
JavaScript-Syntax sowie isolierte Funktionstests mit dem echten MiniSearch bestanden.
Geprüft wurden Theme-Synchronisation, Sprachvarianten, gesperrter Speicher, Tab-Abgleich,
gemeinsamer Suchindex, Sprachtrennung und Wiederholung nach Ladefehlern.
Patch-Anwendung, Rücknahme, Konfliktabbruch und Installationslogik wurden lokal geprüft.
Ein vollständiger Hugo-Build und ein gerenderter Vorher-Nachher-Vergleich konnten hier
nicht ausgeführt werden. Der Download der fehlenden Testwerkzeuge war nicht erreichbar.
Der Installer führt deshalb den Hugo-Build bei dir vor Abschluss der Installation aus.
