# Astrocat Label Studio v1.0

Modulare React-/TypeScript-App für Produktdaten, Chargen und Etiketten mit **70 × 100 mm** im Hochformat.

## Lokal starten

Voraussetzung: Node.js 22 oder neuer.

```bash
npm install
npm run dev
```

Danach die angezeigte localhost-Adresse im Browser öffnen. Produktions-Build:

```bash
npm run build
npm run preview
```

## GitHub Pages

1. Ein neues GitHub-Repository erstellen und Projektdateien hochladen (einschließlich `.github/workflows/deploy.yml`).
2. Im Repository unter **Settings → Pages → Build and deployment → Source** `GitHub Actions` auswählen.
3. Code auf den Branch `main` pushen. Der Workflow baut `dist/` automatisch und veröffentlicht die Website.
4. Für Vite ist `base: './'` konfiguriert, sodass die Seite in GitHub-Projektpfaden geladen wird.

**Hinweis:** Die Einsatzbedingungen von GitHub Pages für geschäftliche Anwendungen eigenständig prüfen; als Alternative lässt sich dieselbe App auf einem anderen statischen Host bereitstellen.

## Funktionen

- Produktverwaltung mit editierbaren Nährwerten, Allergenen und vegan-Angabe
- CSV-Import (Semikolon oder Komma) sowie Produkt- und Chargenexport als CSV
- SKU-basierte Aktualisierung auf ausdrückliche Bestätigung
- Datensicherung / Wiederherstellung als JSON
- Chargennummern `L-<SKU-Ende>-<JJJJMMTT>-<NN>` automatisch pro Tag und Produkt
- Archivierte Chargen speichern eine unveränderliche Kopie der Produktdaten
- Etikettenvorschau und PDF-Export, eine physische 70×100-mm-Seite je Etikett
- Vorläufige Produktsperren für fehlende Daten und u. a. E171 sowie E120 bei veganem Produkt

## Vorsicht bei der Verwendung

Die Demo-Nährwerte sind **keine validierte Deklaration**. Die integrierte Prüfung bildet nur einzelne Regeln ab, keine rechtsverbindliche Prüfung. Zutaten, Herkunft, Allergene, Füllmenge, Nährwerte, MHD, Firmendaten, Druckauflösung und Lesbarkeit vor echtem Druck selbst prüfen. Die Anwendung ist ein erster MVP, keine vollständige Rückverfolgbarkeits- oder HACCP-Software.

**Lokale Daten:** Produkte/Chargen liegen in IndexedDB, Einstellungen in localStorage und werden nicht zwischen Geräten synchronisiert. Regelmäßig JSON-Backups sichern. Keine personenbezogenen oder vertraulichen Daten auf öffentlichen Hosts eingeben, wenn dies gegen interne Richtlinien verstößt.

## Wichtige Pfade

- `src/features/products` – Formular
- `src/features/batches` – Nummern und Charge
- `src/features/validation` – Regeln
- `src/features/labels` – Vorschau, Styling, PDF
- `src/lib/csv.ts` – Import/Export
- `src/lib/db.ts` – lokale Datenbank
- `src/types/models.ts` – Datenmodelle

## Geplante Erweiterungen

Echtes Grafiklogo als SVG, detaillierte Drucklayout-Prüfung und automatisierte Tests, weitere Etikettenvorlagen und dynamisches Layout für sehr lange Zutatenlisten, Versionsverwaltung für Regeln und verlässliche Freigabeprozesse.

## Version 1.1 – Neu

- Chargennummern werden nun produktübergreifend je Produktionstag erzeugt: `L211026-01`, `L211026-02`, usw. Vorhandene ältere Chargennummern bleiben zur Rückverfolgbarkeit erhalten.
- Neue interne Angaben bei der Chargenerstellung: Originalprodukt/Hersteller, Hersteller-Losnummer, Original-MHD, Notizen. Die Felder erscheinen im Chargenarchiv, CSV-Chargenexport und JSON-Backup, **nicht** auf dem Etikett.
- Das Etikett bleibt einheitlich 70 mm breit und 100 mm hoch. PDF-Abschnitte werden von oben nach unten berechnet, die Nährwerttabelle ist kompakter und der bisher am Rand abgeschnittene Werbe-Footer entfällt.
- Bei Platzmangel verweigert der PDF-Generator den Export statt Pflichtangaben abzuschneiden. Besonders lange Zutatenlisten bitte im Probedruck mit Mindestschriftgrößen kontrollieren. Die Software bietet keine rechtliche Kennzeichnungsfreigabe.

**Migration:** Das bestehende Dexie-Datenbankschema wird nicht geändert; `source` ist bei historischen Chargen optional. Unbedingt vor dem Update ein JSON-Backup in der alten App erstellen. Die Browserdaten bleiben nur bei gleichem Ursprung (Adresse/Port bzw. gleicher GitHub-Pages-Pfad) erhalten.

**Hinweis:** Für einen tatsächlichen Verkaufsdruck müssen korrekte Produktdaten, Nährwerte, Allergenkennzeichnung und ausreichende Schriftgröße geprüft werden. Die vereinfachte Chargennummer ist nur eindeutig, wenn alle Chargen im selben lokalen Datenbestand verwaltet werden.

## Etiketten-Schriftgrößen v1.2
Produktname 6,5 pt; Werbeslogan 7,0 pt; Website 5,5 pt; Produktdetails, Zutaten, Allergene, Nährwerttabelle (Überschrift fett), Lagerhinweise und Anschrift jeweils 5,5 pt. Bitte reale Druck-Schriftgrößen und gesetzlich erforderliche x-Höhe vor Produktionsdruck prüfen.

## Etikettenexport ab v1.4

Die **Live-Vorschau ist die einzige Layoutquelle**. Die Schaltflächen „Etiketten als PDF“ und „Vorschau als PNG“ nehmen die HTML-Etikettenvorschau als hochauflösendes Rasterbild auf. Die PDF-Datei enthält das Bild mit einer exakten Seitengröße von 70 × 100 mm, pro Etikett eine Seite. Dadurch entstehen keine abweichenden Zeilenumbrüche durch den bisherigen jsPDF-Textrenderer.

Die Aufzeichnung verwendet SVG/foreignObject und Canvas, funktioniert vollständig lokal ohne zusätzliche Abhängigkeiten und ist für aktuelle Chrome-/Edge-Versionen vorgesehen. Sollte ein Browser die Aufnahme blockieren, erscheint eine Fehlermeldung. Für druckfertige Nutzung müssen Druckmaßstab 100 %, die realen Schriftgrößen, ein vollständiger Label-Inhalt und der tatsächliche Munin-Druck überprüft werden. Das PDF enthält Rastertext und ist nicht textselektierbar.

**Logo:** Einstellungen → Eigenes Astrocat-Logo → PNG/JPG hochladen (max. 1 MB). Das Bild wird in der Vorschau und damit im Screenshot-PDF verwendet und im JSON-Backup gesichert.


## Version 1.5: Screenshot-Export
Der SVG-foreignObject-basierte Export der Version 1.4 wurde durch html2canvas ersetzt, weil foreignObject-SVGs beim Zeichnen auf Canvas Browser-Sicherheitsfehler (tainted canvas) verursachen können. Für HTML-Label, lokale Daten und als Data-URL gespeicherte PNG/JPG-Logos ist kein externer Bildserver erforderlich. Nach Update `npm install` ausführen.


## Version 1.6
- Alte Produktdatei `astrocat_model.json` über **Produkte → Alte Produktdaten als JSON importieren** importieren. Die Import-Vorschau meldet Prüfhinweise. `Batch`, `Inhalt` und das alte `Slogan`-Feld werden bewusst ignoriert.
- Bei jeder neuen Charge wird einer von fünf fest integrierten Slogans zufällig gewählt und dauerhaft in der Charge gespeichert. Alte Chargen behalten ihren bestehenden Kopftext.
- Zutaten werden anhand einer erweiterbaren Synonymliste auf mögliche Anhang-II-Allergene geprüft und die erkannten Wortbestandteile im Sticker fett gesetzt. Automatische Erkennung ist nicht vollständig; Herstellerdaten und Allergenangaben müssen vor Freigabe geprüft werden.
- Der PNG/PDF-Screenshot-Export mit 70 × 100 mm bleibt erhalten.
