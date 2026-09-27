"use client";

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

/** Feste Seite je Beschriftung — an der Endlage ausgerichtet, damit sie
 *  unterwegs nicht springt. */
const MARKS = [
  { label: "Angebote", side: "r", sx: 300, sy: 330 },
  { label: "Reporting", side: "l", sx: 700, sy: 300 },
  { label: "Freigaben", side: "l", sx: 760, sy: 430 },
  { label: "Verträge", side: "r", sx: 250, sy: 520 },
  { label: "Onboarding", side: "l", sx: 620, sy: 545 },
  { label: "Rechnungen", side: "r", sx: 330, sy: 640 },
  { label: "Stammdaten", side: "l", sx: 780, sy: 690 },
  { label: "Datenpflege", side: "l", sx: 560, sy: 760 },
] as const;

const SCATTER = NODES.map((n, i) => ({
  ...n,
  ...MARKS[i % MARKS.length],
  delay: (i % 4) * 0.03,
}));

/**
 * Zeitplan der Szene.
 *
 * Die Textstände überlappen bewusst: läuft der erste vollständig aus, bevor
 * der zweite einsetzt, steht mitten im Scrollen ein leeres Bild.
 */
const T = {
  nodes: { a: 0.1, span: 0.42 },
  orbit: (i: number) => ({ a: 0.3 + i * 0.08, span: 0.26 }),
  core: { a: 0.52, span: 0.18 },
  spokes: { a: 0.62, span: 0.24 },
  /** Der zweite Stand setzt ein, bevor der erste ganz weg ist. */
  out: { a: 0.4, span: 0.08 },
  in: { a: 0.41, span: 0.08 },
};

export function Principle() {
  return (
    <Scene vh={205} id="prinzip">
      <div className="relative h-full">
        {/* Das System füllt die Bühne, der Text liegt darüber in den Ecken. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square w-[min(86vh,58rem)] max-w-[94vw]">
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

            {/* Die Beschriftungen wandern mit ihrem Knoten und bleiben stehen.
                Auf schmalen Fenstern ausgeblendet: dort ist die Figur zu klein,
                acht Namen wären nur noch Rauschen. */}
            <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
              {SCATTER.map((n) => (
                <div
                  key={`m-${n.key}`}
                  className="scrub scrub-place absolute"
                  style={
                    {
                      "--a": T.nodes.a + n.delay,
                      "--span": T.nodes.span,
                      "--lx0": `${n.sx / 10}%`,
                      "--ly0": `${n.sy / 10}%`,
                      "--lx1": `${n.x / 10}%`,
                      "--ly1": `${n.y / 10}%`,
                      left: `${n.x / 10}%`,
                      top: `${n.y / 10}%`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={`t-label absolute top-0 -translate-y-1/2 whitespace-nowrap text-grey ${
                      n.side === "r" ? "left-3.5" : "right-3.5"
                    }`}
                  >
                    {n.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Überschrift */}
        <div className="absolute inset-x-0 top-0 pt-[12vh]">
          <div className="shell">
            <PhaseStack>
              <Phase out={T.out}>
                <p className="t-label mb-6 text-grey">01 — Ausgangslage</p>
                <h2 className="t-h2">
                  Alles läuft.
                  <br />
                  Nur nichts zusammen.
                </h2>
              </Phase>
              <Phase in={T.in}>
                <p className="t-label mb-6 text-gold">02 — Prinzip</p>
                <h2 className="t-h2">
                  Ein Zentrum.
                  <br />
                  Verbundene Bahnen.
                </h2>
              </Phase>
            </PhaseStack>
          </div>
        </div>

        {/* Fließtext */}
        <div className="absolute inset-x-0 bottom-0 pb-[7vh]">
          <div className="shell grid12">
            <PhaseStack align="end" className="col-span-12 lg:col-span-5 lg:col-start-8">
              <Phase out={T.out}>
                <p className="t-lead">
                  Jeder Bereich funktioniert für sich. Die Arbeit entsteht
                  dazwischen: im Übertragen, Nachfragen und Doppeltpflegen —
                  über den Tag verteilt und deshalb in keiner Kalkulation.
                </p>
              </Phase>
              <Phase in={T.in}>
                <p className="t-lead">
                  Wir stellen kein weiteres Werkzeug daneben. Wir definieren die
                  Mitte — Daten, Regeln, Verantwortlichkeiten — und führen die
                  bestehenden Abläufe darauf zurück. Dieselben Abläufe, nur
                  verbunden.
                </p>
              </Phase>
            </PhaseStack>
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
