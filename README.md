# ORVIDION

Website für ORVIDION. **Intelligent Systems. Real Business Impact.**

Next.js (App Router) · TypeScript · Tailwind v4 · keine Animations-Dependencies.

```bash
npm install
npm run dev          # Entwicklung
npm run build        # statischer Produktionsbau
npm start -- -p 4300 # Produktionsserver
npm run verify       # DOM-Prüfung gegen den laufenden Server
```

---

## Die Leitidee

Die Seite ist kein Stapel Sektionen mit Weltraum-Deko, sondern **ein einziges
Orbitalsystem, über Zeit betrachtet.** Scrollen bewegt nicht die Seite —
Scrollen bringt das System voran.

Oben verstreute, unverbundene Punkte. Unten ein geschlossenes System mit einem
Kern. Dazwischen findet es sich. Das ist der Firmensatz, gezeichnet statt
behauptet.

| # | Sektion | Datei | Strecke |
|---|---------|-------|---------|
| — | Ankunft | `sections/Arrival.tsx` | 190 vh |
| 01 | Streuung — die Ausgangslage | `sections/Scatter.tsx` | 260 vh |
| 02 | Der Kern — das Prinzip | `sections/Core.tsx` | 420 vh |
| 03 | Bahnen — die Leistungen | `sections/Orbits.tsx` | 480 vh |
| 04 | Konstellation — der Ablauf | `sections/Constellation.tsx` | 360 vh |
| 05 | Wirkung — Zielwerte | `sections/Impact.tsx` | läuft durch |
| 06 | Ausklang — Kontakt | `sections/Close.tsx` | läuft durch |

Die `vh`-Werte steuern das Tempo: **längere Strecke = langsamere Bewegung pro
gescrolltem Pixel.** Sie sind der eine Regler, an dem man die Ruhe der Seite
einstellt. Sie stehen jeweils im `<Scene vh={…}>` der Sektion.

---

## Wie die Bewegung funktioniert

### Der gedämpfte Scroll-Wert

`src/lib/scroll.ts` hält **eine** rAF-Schleife für die ganze Seite.

Das Scrollen selbst wird nicht angetastet — kein Smooth-Scroll-Hijacking, das
fühlt sich sofort billig an und zerstört Trackpad-Verhalten und
Barrierefreiheit. Stattdessen läuft ein zweiter, gedämpfter Wert dem rohen
Scroll-Fortschritt weich nach (Lerp pro Frame, frame-rate-normalisiert, damit
60 Hz und 120 Hz identisch aussehen).

Dieser gedämpfte Wert landet als CSS-Variable `--p` (0…1) auf der Sektion.
**Das ist der Kern des Gefühls:** Zittern verschwindet, Bewegung bekommt Masse
statt direkt am Finger zu kleben. Der Dämpfungsfaktor ist `DAMP` in
`scroll.ts` — höher heißt direkter, niedriger heißt träger.

### Scroll-gebundene Animation

Eine **pausierte** CSS-Animation mit negativem `animation-delay` springt an die
Stelle `--lp` ihrer Laufzeit und respektiert dabei ihre Timing-Funktion. So
gilt dieselbe Easing-Kurve auch für scroll-getriebene Bewegung:

```css
.scrub {
  --lp: clamp(0, calc((var(--p) - var(--a)) / var(--span)), 1);
  animation-play-state: paused;
  animation-delay: calc(var(--lp) * -1000ms);
}
```

`--a` ist der Anfang des Fensters, `--span` seine Länge — beides pro Element.
So staffeln sich Bahnen, Knoten und Text innerhalb einer Sektion.

### Einblendungen

Als CSS-Keyframes mit `animation-fill-mode: both`, ausgelöst durch eine Klasse
vom `IntersectionObserver` (`components/Reveal.tsx`). Scriptgesteuerte Werte
blieben bei gedrosselten Frames halbfertig stehen; diese können das nicht.

---

## Regeln, an die sich der Code hält

Die DOM-Prüfung (`npm run verify`) setzt jede davon durch.

| | |
|---|---|
| **Fünf Farben** | `#0A0F17` `#132033` `#D4AF37` `#A7ADB4` `#F5F6F7`. Abstufungen nur über Opazität derselben Werte, nie über neue Farbtöne. |
| **Gold ist selten** | Nur Haarlinien, Knoten, kleine Sternglyphen — nie als Fläche. Genau **ein** gefüllter goldener Knopf auf der ganzen Seite. |
| **Eine Kurve** | `cubic-bezier(0.16, 1, 0.3, 1)` überall. Einzige Ausnahme: `.scrub-linear` für die Bahn der Leistungen, die exakt am Scroll hängen muss — eine gekrümmte Kurve würde die Abstände der Ankünfte ungleich machen. |
| **Keine Schatten** | Tiefe entsteht durch Parallax-Geschwindigkeit und Opazitätsbänder, nicht durch Schatten. Radien nie über 2 px. |
| **Alles prozedural** | Sterne auf Canvas, Bahnen und Sternbilder als SVG. Keine Bilder, keine Illustrationen. |
| **Reduced Motion** | Alles landet sofort im Endzustand, Drift steht still. |

---

## Zwei Fallen, die schon zugeschnappt sind

Beide waren im Browser unsichtbar und nur über gemessene Werte zu finden.
Deshalb stehen sie hier — und als Test in `scripts/verify-dom.mjs`.

**1 · `pathLength`, `stroke-dasharray` und `--len` müssen übereinstimmen.**
Weichen sie voneinander ab, skaliert der Browser das Strichmuster im Verhältnis
der beiden Längen, und eine fertig gezeichnete Linie erscheint **gestrichelt** —
obwohl `stroke-dashoffset` korrekt auf 0 steht. Der gemeinsame Wert ist
`DRAW_LENGTH` in `components/Scene.tsx`. Er ist absichtlich größer als jede
Kontur der Seite, damit die Linie auch ohne `pathLength`-Unterstützung sauber
verdeckt startet.

**2 · Kein negativer `rootMargin` unten am Observer.**
In einer Sticky-Bühne sitzt der Fußbereich dauerhaft am unteren Viewport-Rand.
Eine Schwelle wie `-12%` könnte er nie überschreiten — er bliebe für immer auf
`opacity: 0`. Zusätzlich fängt ein gemeinsamer Wächter in `Reveal.tsx` alles ab,
was am Dokumentende hängenbleibt.

---

## Prüfung

`npm run verify` misst **den DOM-Zustand, nicht Screenshots** — Klassen,
berechnete Stile, CSS-Variablen, `stroke-dashoffset`, und an drei Stellen die
gerenderten Pixel. Screenshots verschweigen genau die Fehler, die hier zählen:
hängengebliebene Einblendungen, in der Sticky-Bühne abgeschnittener Text, und
Linien, die trotz korrektem DOM gestrichelt erscheinen.

Geprüft wird unter anderem: Farbpalette, Schattenfreiheit, eine Easing-Kurve,
`--p` über die volle Scrolltiefe jeder Szene, Vollständigkeit aller
Einblendungen, kein horizontaler Überlauf und kein abgeschnittener Text auf
sieben Viewports, Beschriftungen an ihren Knoten, Reduced Motion, Konsole.

Voraussetzung: ein laufender Server. Ziel-URL über `VERIFY_URL`,
Vorgabe `http://localhost:4300/`.

---

## Was noch fehlt

- **`kontakt@orvidion.de`** in `src/content.ts` ist ein Platzhalter.
- **Impressum und Datenschutz** (`src/app/impressum`, `src/app/datenschutz`)
  sind leere Hüllen. Für eine deutsche Unternehmensseite rechtlich nötig; der
  Inhalt muss von ORVIDION kommen, deshalb steht dort bewusst nichts Erfundenes.
- **Keine Kundenlogos, keine Testimonials, keine Fallzahlen.** Die Werte in
  Sektion 05 sind auf der Seite ausdrücklich als Zielkorridore der
  Projektplanung ausgewiesen. Wenn echte Messwerte vorliegen, gehören sie dorthin
  — mit derselben Deutlichkeit gekennzeichnet.
