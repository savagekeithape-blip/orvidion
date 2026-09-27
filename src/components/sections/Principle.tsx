"use client";

import { Scene } from "@/components/Scene";
import {
  C,
  NODES,
  ORBITS,
  OrbitCore,
  OrbitDefs,
} from "@/components/Orbit";

/**
 * Streuung → Kern. Die einzige scroll-gescrubbte Szene der Seite.
 *
 * Vorher waren das zwei getrennte Sticky-Sektionen über 680 vh. Zusammengelegt
 * erzählen sie erst die Geschichte: die acht verstreuten Abläufe sind
 * dieselben acht Knoten, die danach auf den Bahnen sitzen. Man sieht nicht
 * zwei Bilder, sondern eine Auflösung.
 *
 * Weil nur diese eine Szene sich festsetzt, ist sie ein Moment statt eines
 * Dauerzustands — und der Rest der Seite scrollt normal.
 */

/**
 * Die Streulage ist von Hand gesetzt, nicht gewürfelt.
 *
 * Algorithmisch nach außen geschoben landeten Knoten in den Ecken: die
 * Beschriftungen liefen in die Überschrift und aus dem viewBox heraus.
 * Acht feste Punkte in einem sicheren Feld sehen beliebig aus, sind aber
 * komponiert — und der Sprung auf die Bahn bleibt trotzdem weit genug,
 * um gelesen zu werden.
 *
 * `right` bestimmt die Seite der Beschriftung; beide Richtungen bleiben
 * innerhalb von 0…1000.
 */
const SCATTER_AT = [
  { label: "ANGEBOTE", sx: 300, sy: 350, right: false },
  { label: "REPORTING", sx: 620, sy: 315, right: true },
  { label: "FREIGABEN", sx: 770, sy: 430, right: true },
  { label: "VERTRÄGE", sx: 245, sy: 505, right: false },
  { label: "ONBOARDING", sx: 515, sy: 470, right: true },
  { label: "RECHNUNGEN", sx: 700, sy: 620, right: true },
  { label: "STAMMDATEN", sx: 350, sy: 690, right: false },
  { label: "DATENPFLEGE", sx: 560, sy: 745, right: true },
];

const SCATTER = NODES.map((n, i) => ({
  ...n,
  ...SCATTER_AT[i % SCATTER_AT.length],
  delay: (i % 4) * 0.035,
}));

const ANNOTATIONS = [
  "Daten an einer Stelle",
  "Regeln statt Absprachen",
  "Übergaben laufen automatisch",
];

export function Principle() {
  return (
    <Scene vh={230} id="prinzip">
      <div className="relative h-full">
        {/* Das System füllt die Bühne. Der Text liegt darüber in den Ecken —
            vorher teilten sich beide die Höhe, und die Figur blieb winzig. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 1000 1000"
            className="aspect-square w-[min(86vh,58rem)] max-w-[94vw]"
            aria-hidden="true"
          >
            <OrbitDefs id="core" />

            {/* Bahnen — zeichnen sich nacheinander. */}
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
                style={
                  {
                    "--len": 4000,
                    "--a": 0.36 + i * 0.1,
                    "--span": 0.26,
                  } as React.CSSProperties
                }
              />
            ))}

            {/* Speichen vom Zentrum zu jedem Knoten. */}
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
                style={
                  { "--len": 4000, "--a": 0.66, "--span": 0.2 } as React.CSSProperties
                }
              />
            ))}

            {/* Die Knoten wandern von ihrer Streulage auf die Bahn. */}
            {SCATTER.map((n) => (
              <g
                key={n.key}
                className="scrub scrub-move"
                style={
                  {
                    "--a": 0.12 + n.delay,
                    "--span": 0.42,
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
                {/* Die Beschriftung reist mit und verlischt, sobald der Knoten
                    Teil des Systems ist — danach zählt nicht mehr der einzelne
                    Ablauf, sondern die Ordnung. */}
                <text
                  className="scrub scrub-fade"
                  x={n.x + (n.right ? 16 : -16)}
                  y={n.y + 5}
                  textAnchor={n.right ? "start" : "end"}
                  fill="#a7adb4"
                  fontSize="15"
                  letterSpacing="2.6"
                  style={
                    { "--a": 0.3, "--span": 0.2, "--o0": 1, "--o1": 0 } as React.CSSProperties
                  }
                >
                  {n.label}
                </text>
              </g>
            ))}

            {/* Das Zentrum. */}
            <g
              className="scrub scrub-move"
              style={
                {
                  "--a": 0.58,
                  "--span": 0.2,
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
        </div>

        {/* Überschrift — wechselt von der Ausgangslage zum Prinzip. */}
        <div className="absolute inset-x-0 top-0 pt-[12vh]">
          <div className="shell">
            <PhaseStack>
              <Phase a={0.02} span={0.12} out={0.42}>
                <p className="t-label mb-6 text-grey">01 — Ausgangslage</p>
                <h2 className="t-h2">
                  Alles läuft.
                  <br />
                  Nur nichts zusammen.
                </h2>
              </Phase>
              <Phase a={0.5} span={0.14}>
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

        {/* Fließtext — wechselt mit der Überschrift. */}
        <div className="absolute inset-x-0 bottom-0 pb-[7vh]">
          <div className="shell grid12">
            <PhaseStack
              align="end"
              className="col-span-12 lg:col-span-5 lg:col-start-8"
            >
              <Phase a={0.04} span={0.12} out={0.42}>
                <p className="t-lead">
                  In den meisten Unternehmen funktioniert jeder Bereich für
                  sich. Die Arbeit entsteht dazwischen: im Übertragen,
                  Nachfragen und Doppeltpflegen.
                </p>
              </Phase>
              <Phase a={0.52} span={0.14}>
                <p className="t-lead">
                  Wir stellen kein weiteres Werkzeug daneben. Wir definieren
                  die Mitte — Daten, Regeln, Verantwortlichkeiten — und führen
                  die bestehenden Abläufe darauf zurück.
                </p>
                <ul className="mt-7 flex flex-col gap-3">
                  {ANNOTATIONS.map((t) => (
                    <li key={t} className="t-label flex items-center gap-3 text-gold">
                      <span className="block h-px w-5 shrink-0 bg-gold/70" />
                      {t}
                    </li>
                  ))}
                </ul>
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
 * Als Raster mit beiden Kindern in derselben Zelle, nicht per `absolute`:
 * so bestimmt der höhere Stand die Höhe. Absolut gesetzt lag der zweite Stand
 * außerhalb des Flusses, der Container blieb auf der Höhe des ersten — und
 * der längere Text lief unten aus der Bühne heraus.
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
    <div className={`grid ${align === "end" ? "items-end" : "items-start"} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Ein Textstand. Blendet bei `a` ein und, wenn `out` gesetzt ist, dort wieder
 * aus. Liegt immer in derselben Rasterzelle wie seine Geschwister.
 */
function Phase({
  a,
  span,
  out,
  children,
}: {
  a: number;
  span: number;
  out?: number;
  children: React.ReactNode;
}) {
  const inner =
    out === undefined ? (
      children
    ) : (
      // Erst herein, dann wieder hinaus: zwei geschachtelte Fenster.
      <div
        className="scrub scrub-fade"
        style={{ "--a": out, "--span": 0.1, "--o0": 1, "--o1": 0 } as React.CSSProperties}
      >
        {children}
      </div>
    );
  return (
    <div
      className="scrub scrub-fade [grid-area:1/1]"
      style={{ "--a": a, "--span": span, "--o0": 0, "--o1": 1 } as React.CSSProperties}
    >
      {inner}
    </div>
  );
}
