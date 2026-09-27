import { Reveal, RevealGroup } from "@/components/Reveal";
import { SectionHead } from "@/components/SectionHead";
import { STEPS } from "@/content";

/**
 * Ablauf.
 *
 * Die Konstellation zeichnet sich einmal beim Erscheinen, nicht am Scroll —
 * für eine Figur mit vier Punkten lohnt keine eigene Sticky-Strecke.
 *
 * Die Beschriftungen liegen als SVG-Text im selben Koordinatensystem wie die
 * Punkte. Als HTML über dem Bild mussten sie vorher mühsam nachgerechnet
 * werden und sind trotzdem verrutscht, sobald preserveAspectRatio die Figur
 * eingepasst hat.
 */

const W = 1200;
const H = 420;
const P = [
  { x: 110, y: 300 },
  { x: 430, y: 96 },
  { x: 760, y: 322 },
  { x: 1086, y: 126 },
];

/** Länge einer Strecke, für das Zeichnen per stroke-dashoffset. */
const len = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(b.x - a.x, b.y - a.y);

export function Process() {
  return (
    <section id="ablauf" className="py-(--section-y)">
      <div className="shell">
        <SectionHead
          ordinal="04"
          label="Ablauf"
          title="Vier Schritte, die wiederkehren."
          lead="Kein Projekt mit Enddatum. Nach dem Betrieb beginnt die nächste Analyse — deshalb schließt sich die Figur."
        />

        <RevealGroup delay={200} className="mt-14">
          <div
            className="relative mx-auto w-full"
            style={{ aspectRatio: `${W} / ${H}` }}
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-full w-full overflow-visible"
              aria-hidden="true"
            >
              {/* Verbindungen in Reihenfolge */}
              {P.slice(0, -1).map((p, i) => (
                <line
                  key={i}
                  x1={p.x}
                  y1={p.y}
                  x2={P[i + 1].x}
                  y2={P[i + 1].y}
                  data-reveal="draw"
                  className="hair"
                  stroke="#d4af37"
                  strokeOpacity="0.62"
                  strokeDasharray={len(p, P[i + 1])}
                  style={
                    {
                      "--len": len(p, P[i + 1]),
                      "--d": `${300 + i * 260}ms`,
                    } as React.CSSProperties
                  }
                />
              ))}

              {/* Rückbahn: der Kreis schließt sich */}
              <path
                d={`M ${P[3].x} ${P[3].y} Q ${W / 2} ${H + 210} ${P[0].x} ${P[0].y}`}
                data-reveal="draw"
                className="hair-thin"
                stroke="#f5f6f7"
                strokeOpacity="0.24"
                pathLength={4000}
                strokeDasharray={4000}
                style={{ "--len": 4000, "--d": "1150ms" } as React.CSSProperties}
              />

              {/* Punkte und Beschriftung */}
              {P.map((p, i) => (
                <g
                  key={`p-${i}`}
                  data-reveal="fade"
                  style={{ "--d": `${200 + i * 260}ms` } as React.CSSProperties}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="17"
                    className="hair-thin"
                    stroke="#d4af37"
                    strokeOpacity="0.45"
                  />
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#d4af37" />
                  <text
                    x={p.x}
                    y={p.y - 34}
                    textAnchor="middle"
                    fill="#f5f6f7"
                    fontSize="17"
                    letterSpacing="3"
                  >
                    {STEPS[i].title.toUpperCase()}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </RevealGroup>

        <ol className="grid12 mt-16 gap-y-12">
          {STEPS.map((s, i) => (
            <li key={s.n} className="col-span-12 sm:col-span-6 lg:col-span-3">
              <Reveal delay={i * 110}>
                <div className="rule mb-5 h-px w-full" />
                <span className="t-ordinal">{s.n}</span>
                <h3 className="t-h3 mt-4">{s.title}</h3>
                <p className="t-body mt-3">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
