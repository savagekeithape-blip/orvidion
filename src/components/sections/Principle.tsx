"use client";

import { useEffect, useRef } from "react";
import { Scene } from "@/components/Scene";
import { C, NODES, ORBITS, OrbitCore, OrbitDefs } from "@/components/Orbit";

/**
 * Streuung → Kern. Die einzige scroll-gescrubbte Szene der Seite.
 *
 * Die acht verstreuten, beschrifteten Abläufe sind dieselben acht Knoten, die
 * danach auf den Bahnen sitzen. Man sieht nicht zwei Bilder, sondern eine
 * Auflösung — und die Namen bleiben bis zum Schluss stehen: am Ende zeigt die
 * Figur genau die Abläufe, mit denen sie angefangen hat, nur geordnet.
 *
 * Die Beschriftungen sind HTML, nicht SVG-Text. Als Teil der Figur skalierten
 * sie mit ihr und waren auf schmalen Fenstern unleserlich klein; so behalten
 * sie überall dieselbe Größe. Weil der viewBox quadratisch ist und der Kasten
 * ebenfalls, decken sich Prozentangaben und Figurenkoordinaten exakt.
 */

/**
 * Die acht Abläufe, in der Reihenfolge der Knoten.
 *
 * Die Streulage liegt auf demselben Strahl wie die Endlage, nur weiter außen:
 * dadurch laufen alle Wege radial nach innen und können sich nicht kreuzen.
 * Mit frei gesetzten Streupunkten überlagerten sich die Beschriftungen mitten
 * in der Bewegung, auch wenn Anfang und Ende sauber waren.
 *
 * Die Radien sind unterschiedlich, damit die Streulage nicht wie ein
 * gleichmäßiger Kranz wirkt — sie soll ungeordnet aussehen.
 */
const LABELS = [
  "Angebote",
  "Reporting",
  "Freigaben",
  "Verträge",
  "Onboarding",
  "Rechnungen",
  "Stammdaten",
  "Datenpflege",
];

/**
 * Die Streuradien bleiben unter etwa 350: weiter außen läuft die Beschriftung
 * eines waagerecht liegenden Knotens aus dem Bild — der Platz, den ein Wort
 * neben dem Punkt braucht, wächst nicht mit der Figur mit.
 */
const SCATTER_R = [345, 330, 352, 318, 340, 306, 348, 326];

const SCATTER = NODES.map((n, i) => {
  const vx = n.x - C;
  const vy = n.y - C;
  const d = Math.hypot(vx, vy) || 1;
  const r = SCATTER_R[i % SCATTER_R.length];
  const sx = C + (vx / d) * r;
  const sy = C + (vy / d) * r;
  return {
    ...n,
    label: LABELS[i % LABELS.length],
    /** Nach außen beschriftet, weg vom Zentrum. */
    side: n.x >= C ? ("r" as const) : ("l" as const),
    sx,
    sy,
    /** Versatz als Anteil der Figurbreite — mit `--fig` wird daraus ein
     *  Pixelwert für eine Transformation. */
    dx: (sx - n.x) / 1000,
    dy: (sy - n.y) / 1000,
    delay: (i % 4) * 0.03,
  };
});

/**
 * Zeitplan der Szene.
 *
 * Die Textstände überlappen bewusst: läuft der erste vollständig aus, bevor
 * der zweite einsetzt, steht mitten im Scrollen ein leeres Bild.
 */
/** Ein Zeitfenster als CSS-Variablen. Als einfache Schlüssel `a` und `span`
 *  geschrieben verwirft React sie stillschweigend, und das Element läuft
 *  über die ganze Strecke statt in seinem Abschnitt. */
const win = (a: number, span: number) =>
  ({ "--a": a, "--span": span }) as React.CSSProperties;

const T = {
  /** Früh, damit die Figur sofort auf die erste Rad-Rastung reagiert. Bei
   *  0,1 lagen rund 110px Scroll vor der ersten Bewegung — die Szene fühlte
   *  sich in ihren ersten Frames tot an. */
  nodes: { a: 0.05, span: 0.42 },
  orbit: (i: number) => win(0.3 + i * 0.08, 0.26),
  core: win(0.52, 0.18),
  spokes: win(0.62, 0.24),
  /** Der zweite Stand setzt ein, bevor der erste ganz weg ist. */
  out: { a: 0.4, span: 0.08 },
  in: { a: 0.41, span: 0.08 },
};

export function Principle() {
  const fig = useRef<HTMLDivElement>(null);

  // Die Figurbreite als CSS-Variable, damit der Streu-Versatz der
  // Beschriftungen in Pixeln ausgedrückt werden kann.
  useEffect(() => {
    const el = fig.current;
    if (!el) return;
    const set = () => el.style.setProperty("--fig", `${el.clientWidth}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Scene vh={240} id="prinzip">
      {/* Text links, Figur rechts — getrennte Spalten.
          Vorher lag der Text über der Figur. Auf einer kleinen, blassen
          Grafik geht das; auf dieser nicht: die Überschrift lag direkt auf
          einer Ellipse, und beides wurde dadurch schlechter lesbar. */}
      <div className="shell grid h-full grid-cols-1 content-center gap-y-4 py-[5vh] lg:grid-cols-12 lg:items-center lg:gap-x-8 lg:gap-y-0 lg:py-[8vh]">
        <div className="col-span-12 lg:col-span-5">
          <PhaseStack>
            <Phase out={T.out}>
              <p className="t-label mb-6 text-grey">01 — Ausgangslage</p>
              <h2 className="t-h2">
                Alles läuft.
                <br />
                Nur nichts zusammen.
              </h2>
              <p className="t-lead mt-8 max-w-[38ch]">
                Jeder Bereich funktioniert für sich. Die Arbeit entsteht
                dazwischen: im Übertragen, Nachfragen und Doppeltpflegen —
                über den Tag verteilt und deshalb in keiner Kalkulation.
              </p>
            </Phase>
            <Phase in={T.in}>
              <p className="t-label mb-6 text-gold">02 — Prinzip</p>
              <h2 className="t-h2">
                Ein Zentrum.
                <br />
                Verbundene Bahnen.
              </h2>
              <p className="t-lead mt-8 max-w-[38ch]">
                Wir stellen kein weiteres Werkzeug daneben. Wir definieren die
                Mitte — Daten, Regeln, Verantwortlichkeiten — und führen die
                bestehenden Abläufe darauf zurück. Dieselben Abläufe, nur
                verbunden.
              </p>
            </Phase>
          </PhaseStack>
        </div>

        {/* Rund um die Figur bleibt Platz für die Beschriftungen frei. Ohne
            diese Reserve liefen sie aus dem Bild, sobald die Figur die Spalte
            ausfüllte — deshalb waren sie vorher unterhalb von 1280px ganz
            ausgeblendet und fehlten genau dort, wo man die Seite ansieht.

            Gestapelt sitzt oben im Kasten eine leere Krone: der äußerste
            Streupunkt liegt bei etwa 0,69 des Halbmessers, der Kasten ist aber
            quadratisch. Ohne den Zug nach oben klafft zwischen Text und Figur
            ein totes Band. */}
        <div className="-mt-[7%] flex justify-center lg:mt-0 lg:col-span-6 lg:col-start-7">
          <div
            ref={fig}
            className="relative aspect-square w-full max-w-[min(56vh,34rem)] sm:max-w-[min(56vh,34rem,calc(100%-8rem))] lg:max-w-[min(64vh,40rem,calc(100%-8rem))]"
          >
            <svg viewBox="0 0 1000 1000" className="h-full w-full" aria-hidden="true">
              <OrbitDefs id="core" />

              {ORBITS.map((o, i) => (
                <ellipse
                  key={i}
                  cx={C}
                  cy={C}
                  rx={o.rx}
                  ry={o.ry}
                  className="hair scrub scrub-draw"
                  stroke={`url(#core-${o.gold ? "g" : "w"})`}
                  transform={`rotate(${o.rot} ${C} ${C})`}
                  pathLength={4000}
                  strokeDasharray={4000}
                  style={{ "--len": 4000, ...T.orbit(i) } as React.CSSProperties}
                />
              ))}

              {NODES.map((n) => (
                <line
                  key={`s-${n.key}`}
                  x1={C}
                  y1={C}
                  x2={n.x}
                  y2={n.y}
                  className="hair-thin scrub scrub-draw"
                  stroke="#d4af37"
                  strokeOpacity="0.26"
                  pathLength={4000}
                  strokeDasharray={4000}
                  style={{ "--len": 4000, ...T.spokes } as React.CSSProperties}
                />
              ))}

              {SCATTER.map((n) => (
                <g
                  key={n.key}
                  className="scrub scrub-move"
                  style={
                    {
                      "--a": T.nodes.a + n.delay,
                      "--span": T.nodes.span,
                      "--x0": `${n.sx - n.x}px`,
                      "--y0": `${n.sy - n.y}px`,
                      "--x1": "0px",
                      "--y1": "0px",
                      "--o0": 0.85,
                      "--o1": 1,
                    } as React.CSSProperties
                  }
                >
                  <circle cx={n.x} cy={n.y} r="3.4" fill="#f5f6f7" fillOpacity="0.92" />
                </g>
              ))}

              <g
                className="scrub scrub-move"
                style={
                  {
                    ...T.core,
                    "--s0": 0.3,
                    "--s1": 1,
                    "--o0": 0,
                    "--o1": 1,
                    transformOrigin: "500px 500px",
                  } as React.CSSProperties
                }
              >
                <OrbitCore id="core" />
              </g>
            </svg>

            {/* Die Beschriftungen wandern mit ihrem Knoten und bleiben stehen. */}
            <div aria-hidden="true" className="absolute inset-0 hidden sm:block">
              {SCATTER.map((n) => (
                <div
                  key={`m-${n.key}`}
                  data-mark=""
                  className="scrub scrub-move absolute"
                  style={
                    {
                      "--a": T.nodes.a + n.delay,
                      "--span": T.nodes.span,
                      // Bewegung als Transformation, nicht über left/top:
                      // sonst rechnet der Browser in jedem Frame das Layout
                      // für acht Elemente neu.
                      "--x0": `calc(${n.dx} * var(--fig, 0px))`,
                      "--y0": `calc(${n.dy} * var(--fig, 0px))`,
                      "--x1": "0px",
                      "--y1": "0px",
                      left: `${n.x / 10}%`,
                      top: `${n.y / 10}%`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={`t-label absolute top-0 -translate-y-1/2 whitespace-nowrap text-grey ${
                      n.side === "r" ? "left-3" : "right-3"
                    }`}
                  >
                    {n.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

/**
 * Zwei Textstände, die sich denselben Platz teilen.
 *
 * Als Raster mit beiden Kindern in derselben Zelle, nicht per `absolute`: so
 * bestimmt der höhere Stand die Höhe. Absolut gesetzt lag der zweite außerhalb
 * des Flusses, und der längere Text lief unten aus der Bühne heraus.
 */
function PhaseStack({
  align = "start",
  className = "",
  children,
}: {
  align?: "start" | "end";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid ${align === "end" ? "items-end" : "items-start"} ${className}`}
    >
      {children}
    </div>
  );
}

type Window = { a: number; span: number };

/**
 * Ein Textstand. Entweder von Anfang an sichtbar und bei `out` verschwindend,
 * oder bei `in` erscheinend. Der erste Stand hat bewusst keine Einblendung —
 * beim Festsetzen der Bühne steht er schon auf dem Schirm.
 */
function Phase({
  in: fadeIn,
  out,
  children,
}: {
  in?: Window;
  out?: Window;
  children: React.ReactNode;
}) {
  const w = fadeIn ?? out;
  if (!w) return <div className="[grid-area:1/1]">{children}</div>;
  return (
    <div
      className={`scrub [grid-area:1/1] ${fadeIn ? "phase-in" : "phase-out"}`}
      style={{ "--a": w.a, "--span": w.span } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
