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
| 01/02 | Streuung → Kern | `sections/Principle.tsx` | 2,1 (gescrubbt) |
| 03 | Anwendungsfälle | `sections/Cases.tsx` | 1,8 |
| 04 | Ablauf | `sections/Process.tsx` | 1,4 |
| 05 | Wirkung | `sections/Impact.tsx` | 1,1 |
| 06 | Klartext | `sections/Answers.tsx` | 1,2 |
| 07 | Kontakt | `sections/Contact.tsx` | 1,0 |

Zusammen rund 8.500 px. **Nur eine Sektion setzt sich beim Scrollen fest.**
Das ist die eigentliche Entscheidung dieses Aufbaus: Wenn sich jede Sektion
festsetzt, ist keine davon ein Moment — dann ist Scrollen nur noch Leerlauf.

## Die Leitidee

Ein Orbitalsystem, über die Seite hinweg. Der Hero zeigt es angeschnitten,
die gescrubbte Szene baut es aus verstreuten Punkten zusammen, der Ausklang
zeigt es fertig und in Ruhe. Geometrie und Verläufe liegen gemeinsam in
`components/Orbit.tsx`, damit überall dasselbe Objekt erscheint.

In der Szene sind die acht verstreuten, beschrifteten Abläufe **dieselben**
acht Knoten, die danach auf den Bahnen sitzen. Man sieht nicht zwei Bilder,
sondern eine Auflösung. Die Namen bleiben bis zum Schluss stehen: am Ende
zeigt die Figur genau die Abläufe, mit denen sie angefangen hat, nur geordnet.

## Warum die Inhalte so stehen

Recherchiert an dem, was vergleichbare Anbieter tun, und bewusst anders, wo
Ehrlichkeit es verlangt:

- **Anwendungsfälle statt Leistungsliste.** Wer Automatisierung sucht, erkennt
  sich an der Beschreibung seines Alltags wieder, nicht an einer
  Technologieliste. Deshalb steht jedem Ablauf ein „Heute" gegenüber.
- **Klartext statt Versprechen.** Datenschutz, EU AI Act, Mitbestimmung nach
  § 87 BetrVG und Abhängigkeit sind die Gründe, an denen Projekte im
  Mittelstand tatsächlich hängenbleiben. Die Mitbestimmung spricht kaum
  jemand vorher an — genau deshalb steht sie da.
- **Zwei Einstiege.** Ein verbindlicher und ein unverbindlicher. Ein
  einzelner Knopf verliert alle, die erst schauen wollen.
- **Keine Logoleiste, keine Testimonials.** Fast alle Vergleichsseiten haben
  beides. Wir haben keine echten, und erfundene kommen nicht in Frage. Die
  Frage „Warum stehen hier keine Kundenlogos?" steht stattdessen offen im
  Klartext.

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

## Sechs Fallen, die schon zugeschnappt sind

Jede ist jetzt ein Test in `scripts/verify-dom.mjs`.

**1 · Der Grundton gehört auf `body` — und die Ebenen darüber.**
Diese Falle hat zweimal zugeschnappt, aus entgegengesetzten Richtungen.

Zuerst lagen Atmosphäre und Sternenfeld auf negativem `z-index`. Der
Hintergrund eines im Fluss liegenden Elements wird **nach** solchen
Nachfahren gemalt — `body { background }` hat beide Ebenen vollständig
verdeckt. Im DOM völlig unauffällig, beide waren „da".

Die naheliegende Korrektur — den Grundton von `body` nehmen und nur auf
`html` lassen — machte die Seite **weiß**, sobald sie in ein fremdes
Dokument eingebettet wurde: dessen Grundgerüst bringt oft ein helles
`body { background }` mit, das den html-Hintergrund übermalt.

Richtig ist beides zusammen: **`body` trägt den Grundton**, und die
Hintergrundebenen liegen auf `z-0` darüber, der Inhalt auf `z-10`.

Lehre fürs Prüfen: Eine Seite, die woanders eingebettet wird, muss **in
diesem Grundgerüst** geprüft werden, nicht nur unter einer nackten URL.

**2 · Ein Zeitfenster als `{ a, span }` geht stillschweigend verloren.**
Die Scrub-Fenster müssen als `{ "--a", "--span" }` ins `style` — mit
einfachen Schlüsseln verwirft React sie kommentarlos, das Element fällt auf
die Vorgabe 0…1 zurück und läuft über die ganze Strecke statt in seinem
Abschnitt. Im DOM sieht das unauffällig aus: sichtbar wird es nur daran,
dass am Anfang der Szene bereits alles gezeichnet ist. Dafür gibt es den
Helfer `win(a, span)` und einen Test, der genau das prüft.

**3 · `pathLength`, `stroke-dasharray` und `--len` müssen übereinstimmen.**
Weichen sie ab, skaliert der Browser das Strichmuster im Verhältnis der
Längen: eine fertig gezeichnete Linie erscheint **gestrichelt**, obwohl
`stroke-dashoffset` korrekt auf 0 steht.

**4 · Ein Observer auf dem Wrapper erreicht dessen Kinder nicht.**
SVG-Linien und -Punkte mit `data-reveal` blieben für immer auf ihrem
Startwert. Dafür gibt es `RevealGroup`.

**5 · Kein negativer `rootMargin` unten am Observer.**
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

**6 · Beschriftungen an einer Figur brauchen radiale Wege.**
Acht Punkte laufen beim Scrollen von einer Streulage auf ihre Bahn. Mit frei
gesetzten Streupunkten überlagerten sich die Beschriftungen **mitten in der
Bewegung**, obwohl Anfang und Ende sauber waren — die Wege kreuzten sich.
Liegt die Streulage auf demselben Strahl wie die Endlage, laufen alle Wege
radial nach innen und können sich nicht kreuzen. Zusätzlich sind die acht
Knoten gleichmäßig alle 45° verteilt statt gedrängt; vorher lagen drei
innerhalb von 40°, während zwei Viertel der Figur leer blieben.

Der Test dazu tastet die ganze Szene an 21 Stellen auf vier Bildschirmgrößen
ab. Ein Test, der nur Anfang und Ende prüft, lässt genau diese Klasse von
Fehlern durch — so ist sie ursprünglich durchgerutscht.

## Was bewusst nicht da ist

- **Keine Navileiste.** Sie war generisch und hat gegen die ruhige Seite
  gearbeitet. Übrig bleibt eine goldene Haarlinie als Fortschrittsanzeige.
- **Keine Atmosphäre-Verläufe.** Eine Fassung mit Farbverläufen im
  Hintergrund wirkte nach Leuchten. Die Tiefe kommt aus dem dünn besetzten
  Sternenfeld und der Parallaxe.
- **Kein Text über der Figur.** Text und Grafik haben getrennte Spalten. Über
  einer großen, hellen Figur wird Text schlechter lesbar und die Figur
  schlechter erkennbar.