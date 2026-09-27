# ORVIDION

Website für ORVIDION. **Intelligent Systems. Real Business Impact.**

Next.js (App Router) · TypeScript · Tailwind v4 · keine Animations-Dependencies.

```bash
npm install
npm run dev          # Entwicklung
npm run build        # statischer Produktionsbau
npm start -- -p 4300 # Produktionsserver
npm run verify       # DOM- und Pixelprüfung gegen den laufenden Server
```

---

## Aufbau

| # | Sektion | Datei | Höhe |
|---|---------|-------|------|
| — | Hero | `sections/Hero.tsx` | 1,0 Bildschirm |
| 01/02 | Streuung → Kern | `sections/Principle.tsx` | 2,3 (gescrubbt) |
| 03 | Leistungen | `sections/Services.tsx` | 1,3 |
| 04 | Ablauf | `sections/Process.tsx` | 1,3 |
| 05 | Wirkung | `sections/Impact.tsx` | 1,3 |
| 06 | Kontakt | `sections/Contact.tsx` | 1,0 |

Zusammen rund 7.400 px. **Nur eine Sektion setzt sich beim Scrollen fest.**
Das ist die eigentliche Entscheidung dieses Aufbaus: Wenn sich jede Sektion
festsetzt, ist keine davon ein Moment — dann ist Scrollen nur noch Leerlauf.

## Die Leitidee

Ein Orbitalsystem, über die Seite hinweg. Der Hero zeigt es angeschnitten,
die gescrubbte Szene baut es aus verstreuten Punkten zusammen, der Ausklang
zeigt es fertig und in Ruhe. Geometrie und Verläufe liegen gemeinsam in
`components/Orbit.tsx`, damit überall dasselbe Objekt erscheint.

In der Szene sind die acht verstreuten, beschrifteten Abläufe **dieselben**
acht Knoten, die danach auf den Bahnen sitzen. Man sieht nicht zwei Bilder,
sondern eine Auflösung.

---

## Wie die Bewegung funktioniert

### Der gedämpfte Scroll-Wert

`src/lib/scroll.ts` hält eine einzige rAF-Schleife.

Das Scrollen selbst wird nicht angetastet — kein Smooth-Scroll-Hijacking.
Stattdessen läuft ein zweiter, gedämpfter Wert dem rohen Scroll-Fortschritt
weich nach (Lerp pro Frame, frame-rate-normalisiert). Er landet als
CSS-Variable `--p` (0…1) auf der Sektion. Zittern verschwindet, Bewegung
bekommt Masse. Der Dämpfungsfaktor ist `DAMP`.

### Scroll-gebundene Animation

Eine **pausierte** CSS-Animation mit negativem `animation-delay` springt an
die Stelle `--lp` ihrer Laufzeit und respektiert dabei ihre Timing-Funktion:

```css
.scrub {
  --lp: clamp(0, calc((var(--p) - var(--a)) / var(--span)), 1);
  animation-play-state: paused;
  animation-delay: calc(var(--lp) * -1000ms);
}
```

`--a` ist der Anfang des Fensters, `--span` seine Länge — je Element. So
staffeln sich Bahnen, Knoten und Text innerhalb der Szene.

### Einblendungen

CSS-Keyframes mit `animation-fill-mode: both`, ausgelöst durch eine Klasse
vom `IntersectionObserver` (`components/Reveal.tsx`). `RevealGroup` schaltet
zusätzlich alle `[data-reveal]` darunter frei — nötig für SVG.

---

## Regeln, an die sich der Code hält

`npm run verify` setzt jede davon durch.

| | |
|---|---|
| **Fünf Farben** | `#0A0F17` `#132033` `#D4AF37` `#A7ADB4` `#F5F6F7`. Abstufungen nur über Opazität derselben Werte. |
| **Gold ist selten** | Haarlinien, Knoten, Sternglyphen — nie als Fläche. Genau **ein** gefüllter goldener Knopf auf der Seite. |
| **Eine Kurve** | `cubic-bezier(0.16, 1, 0.3, 1)`. `linear` nur für die Dauerrotation des fertigen Systems. |
| **Keine Schatten** | Tiefe entsteht aus Parallax, Verläufen und Opazitätsbändern. Radien nie über 2 px. |
| **Ein Raster** | `.shell` und `.grid12`, ein Maß für alle Sektionen. |
| **Alles prozedural** | Sterne auf Canvas, Bahnen und Sternbilder als SVG. Keine Bilddateien. |
| **Reduced Motion** | Alles landet sofort im Endzustand. |

---

## Vier Fallen, die schon zugeschnappt sind

Alle vier waren im Browser unsichtbar und nur über gemessene Werte zu finden.
Jede ist jetzt ein Test in `scripts/verify-dom.mjs`.

**1 · `body` darf keinen deckenden Hintergrund haben.**
Der Hintergrund eines im Fluss liegenden Elements wird **nach** den
Nachfahren mit negativem `z-index` gemalt. Ein `background` auf `body`
verdeckt damit Atmosphäre und Sternenfeld vollständig — im DOM völlig
unauffällig, beide Ebenen sind „da". Der Grundton liegt deshalb nur auf `html`.

**2 · `pathLength`, `stroke-dasharray` und `--len` müssen übereinstimmen.**
Weichen sie ab, skaliert der Browser das Strichmuster im Verhältnis der
Längen: eine fertig gezeichnete Linie erscheint **gestrichelt**, obwohl
`stroke-dashoffset` korrekt auf 0 steht.

**3 · Ein Observer auf dem Wrapper erreicht dessen Kinder nicht.**
SVG-Linien und -Punkte mit `data-reveal` blieben für immer auf ihrem
Startwert. Dafür gibt es `RevealGroup`.

**4 · Kein negativer `rootMargin` unten am Observer.**
In einer Sticky-Bühne sitzt der Fußbereich dauerhaft am unteren Rand und
könnte eine solche Schwelle nie überschreiten. Ein gemeinsamer Wächter in
`Reveal.tsx` fängt zusätzlich alles ab, was am Dokumentende hängenbleibt.

---

## Prüfung

`npm run verify` misst den DOM-Zustand und an drei Stellen die gerenderten
Pixel — Screenshots allein verschweigen hängengebliebene Einblendungen und
in der Sticky-Bühne abgeschnittenen Text, der DOM allein verschweigt
gestrichelte Linien und verdeckte Hintergrundebenen.

Geprüft werden unter anderem: Farbpalette, Schattenfreiheit, eine
Easing-Kurve, Sichtbarkeit der Hintergrundebenen, `--p` über die volle
Scrolltiefe, Vollständigkeit aller Einblendungen inklusive der im SVG,
Kopfzeile und Fortschrittslinie, acht Viewports auf Beschnitt und Überlauf,
Reduced Motion, Konsole.

Voraussetzung: ein laufender Server. Ziel-URL über `VERIFY_URL`.

---

## Was noch fehlt

- **`kontakt@orvidion.de`** in `src/content.ts` ist ein Platzhalter.
- **Impressum und Datenschutz** sind leere Hüllen. Rechtlich nötig; der
  Inhalt muss von ORVIDION kommen, deshalb steht dort nichts Erfundenes.
- **Keine Kundenlogos, keine Testimonials, keine Fallzahlen.** Die Werte in
  Sektion 05 sind auf der Seite ausdrücklich als Zielkorridore der
  Projektplanung ausgewiesen.
