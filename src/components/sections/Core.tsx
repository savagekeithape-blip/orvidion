"use client";

import { Reveal } from "@/components/Reveal";
import { DRAW_LENGTH, Scene } from "@/components/Scene";

/**
 * Der Kern — das Herzstück der Seite.
 *
 * Die verstreuten Punkte werden auf Bahnen gezogen, die Bahnen schließen sich,
 * Speichen verbinden die Knoten mit einem einzelnen goldenen Zentrum. Alles
 * 1:1 an den gedämpften Scroll-Fortschritt gebunden, nichts abgespielt: die
 * Bahnen vollenden sich zu unterschiedlichen Anteilen, das System baut sich
 * in Schichten auf.
 */

const C = 500; // Zentrum im viewBox 1000×1000

type Orbit = {
  rx: number;
  ry: number;
  rot: number;
  /** Winkel in Radiant, an denen Knoten auf dieser Bahn sitzen. */
  at: number[];
  /** Scroll-Fenster, in dem sich die Bahn zeichnet. */
  a: number;
  span: number;
  op: number;
};

const ORBITS: Orbit[] = [
  { rx: 432, ry: 148, rot: -16, at: [0.45, 2.25, 4.3], a: 0.18, span: 0.3, op: 0.22 },
  { rx: 318, ry: 268, rot: 24, at: [1.05, 3.4, 5.25], a: 0.3, span: 0.32, op: 0.17 },
  { rx: 196, ry: 88, rot: -44, at: [0.2, 3.05], a: 0.42, span: 0.3, op: 0.3 },
];

/** Punkt auf einer gedrehten Ellipse. */
function pointOn(o: Orbit, t: number) {
  const th = (o.rot * Math.PI) / 180;
  const cx = Math.cos(t) * o.rx;
  const cy = Math.sin(t) * o.ry;
  return {
    x: C + cx * Math.cos(th) - cy * Math.sin(th),
    y: C + cx * Math.sin(th) + cy * Math.cos(th),
  };
}

/** Alle Knoten mit ihrer Startversetzung: von wo sie hereingezogen werden. */
const NODES = ORBITS.flatMap((o, oi) =>
  o.at.map((t, ti) => {
    const p = pointOn(o, t);
    // Startpunkt liegt weiter außen auf demselben Strahl — die Punkte fallen
    // nach innen auf ihre Bahn, statt beliebig zu fliegen.
    const vx = p.x - C;
    const vy = p.y - C;
    const k = 0.62;
    return {
      key: `${oi}-${ti}`,
      x: p.x,
      y: p.y,
      dx: vx * k,
      dy: vy * k,
      a: 0.06 + oi * 0.05 + ti * 0.03,
      span: 0.34,
    };
  }),
);

/**
 * Die Annotationen müssen um zwei Textblöcke herum: Überschrift oben links,
 * Fließtext unten rechts. Deshalb links auf mittlerer Höhe, rechts oben und
 * links unten — dort ist die Fläche frei.
 */
const ANNOTATIONS = [
  { text: "Daten an einer Stelle", a: 0.62, pos: "left-0 top-[47%]" },
  { text: "Regeln statt Absprachen", a: 0.7, pos: "right-0 top-[27%] text-right" },
  { text: "Übergaben laufen automatisch", a: 0.78, pos: "left-0 bottom-[22%]" },
];

export function Core() {
  return (
    <Scene vh={420} id="prinzip">
      <div className="relative h-full">
        {/* Das System */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 1000"
            className="h-[min(128vh,142vw)] w-[min(128vh,142vw)] shrink-0"
          >
            {/* Sehr leichte Eigendrehung des ganzen Systems über die Strecke. */}
            <g
              className="scrub scrub-move"
              style={
                {
                  "--a": 0,
                  "--span": 1,
                  "--r0": "-2.2deg",
                  "--r1": "2.2deg",
                  transformOrigin: "500px 500px",
                } as React.CSSProperties
              }
            >
              {/* Bahnen — zeichnen sich über stroke-dashoffset */}
              {ORBITS.map((o, i) => (
                <g key={i} transform={`rotate(${o.rot} ${C} ${C})`}>
                  <ellipse
                    cx={C}
                    cy={C}
                    rx={o.rx}
                    ry={o.ry}
                    className="hair scrub scrub-draw"
                    stroke="#f5f6f7"
                    strokeOpacity={o.op}
                    data-draw
                    pathLength={DRAW_LENGTH}
                    strokeDasharray={DRAW_LENGTH}
                    style={
                      {
                        "--len": DRAW_LENGTH,
                        "--a": o.a,
                        "--span": o.span,
                      } as React.CSSProperties
                    }
                  />
                </g>
              ))}

              {/* Speichen: Zentrum zu jedem Knoten */}
              {NODES.map((n) => (
                <line
                  key={`s-${n.key}`}
                  x1={C}
                  y1={C}
                  x2={n.x}
                  y2={n.y}
                  className="hair scrub scrub-draw"
                  stroke="#d4af37"
                  strokeOpacity="0.3"
                  data-draw
                  pathLength={DRAW_LENGTH}
                  strokeDasharray={DRAW_LENGTH}
                  style={
                    {
                      "--len": DRAW_LENGTH,
                      "--a": 0.58,
                      "--span": 0.26,
                    } as React.CSSProperties
                  }
                />
              ))}

              {/* Knoten — fallen von außen auf ihre Bahn */}
              {NODES.map((n) => (
                <g
                  key={`n-${n.key}`}
                  className="scrub scrub-move"
                  style={
                    {
                      "--a": n.a,
                      "--span": n.span,
                      "--x0": `${n.dx}px`,
                      "--y0": `${n.dy}px`,
                      "--x1": "0px",
                      "--y1": "0px",
                      "--o0": 0.3,
                      "--o1": 1,
                    } as React.CSSProperties
                  }
                >
                  <circle cx={n.x} cy={n.y} r="3.2" fill="#f5f6f7" fillOpacity="0.85" />
                </g>
              ))}

              {/* Das Zentrum. Der einzige gefüllte goldene Punkt hier. */}
              <g
                className="scrub scrub-move"
                style={
                  {
                    "--a": 0.5,
                    "--span": 0.24,
                    "--s0": 0.2,
                    "--s1": 1,
                    "--o0": 0,
                    "--o1": 1,
                    transformOrigin: "500px 500px",
                  } as React.CSSProperties
                }
              >
                <circle cx={C} cy={C} r="5.5" fill="#d4af37" />
                <circle
                  cx={C}
                  cy={C}
                  r="26"
                  className="hair"
                  stroke="#d4af37"
                  strokeOpacity="0.45"
                />
              </g>
            </g>
          </svg>
        </div>

        {/* Text */}
        <div className="relative flex h-full flex-col justify-between px-(--space-gutter) py-(--space-gutter)">
          <div className="max-w-[min(40rem,90vw)]">
            <Reveal kind="fade">
              <p className="t-label text-grey">02 — Prinzip</p>
            </Reveal>
            <Reveal delay={140}>
              <h2 className="t-h2 mt-7">
                Ein Zentrum.
                <br />
                Verbundene Bahnen.
              </h2>
            </Reveal>
          </div>

          <div className="flex justify-end">
            <Reveal delay={280}>
              <p className="t-lead max-w-[42ch] text-balance">
                Wir stellen kein weiteres Werkzeug daneben. Wir definieren die
                Mitte — Daten, Regeln, Verantwortlichkeiten — und führen die
                bestehenden Abläufe darauf zurück.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Annotationen erscheinen gestaffelt am Ende der Strecke */}
        {/* Absolut positionierte Kinder beziehen sich auf die Polsterbox —
            die schließt den Innenabstand mit ein. Ein eigener Kasten im
            Satzspiegel verhindert, dass die Annotationen aus dem Bild laufen. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 px-(--space-gutter)"
        >
          <div className="relative h-full w-full">
            {ANNOTATIONS.map((an) => (
              <div
                key={an.text}
                className={`scrub scrub-fade absolute ${an.pos}`}
                style={
                  {
                    "--a": an.a,
                    "--span": 0.16,
                    "--o0": 0,
                    "--o1": 1,
                  } as React.CSSProperties
                }
              >
                <span
                  className={`flex items-center gap-4 ${
                    an.pos.includes("right-0") ? "flex-row-reverse" : ""
                  }`}
                >
                  <span className="block h-px w-6 shrink-0 bg-gold/70" />
                  <span className="t-label whitespace-nowrap text-gold">{an.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
