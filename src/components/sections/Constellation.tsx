"use client";

import { Reveal } from "@/components/Reveal";
import { DRAW_LENGTH, Scene } from "@/components/Scene";
import { STEPS } from "@/content";

/**
 * Konstellation — der Ablauf.
 *
 * Wird beim Scrollen buchstäblich gezeichnet: die Punkte erscheinen in
 * Reihenfolge, Haarlinien verbinden sie, und am Ende schließt eine Bahn die
 * Figur zurück zum Anfang. Der Ablauf endet nicht, er läuft weiter.
 *
 * Zwei Fassungen, bewusst: eine Sticky-Bühne ist genau eine Viewport-Höhe
 * hoch, und vier Schritte mit Text passen dort erst ab großen Fenstern hinein.
 * Unterhalb von `lg` läuft die Sektion deshalb normal durch, mit gestaffelten
 * Einblendungen statt Scroll-Scrubbing — statt Inhalt abzuschneiden.
 */

const P = [
  { x: 130, y: 430 },
  { x: 386, y: 168 },
  { x: 648, y: 474 },
  { x: 902, y: 196 },
];

const W = 1000;
const H = 620;

/** Die Figur. `scrub` bindet sie an den Scroll, sonst ist sie fertig gezeichnet. */
function Figure({ scrub }: { scrub: boolean }) {
  const win = (a: number, span: number) =>
    scrub
      ? ({ "--a": a, "--span": span } as React.CSSProperties)
      : ({} as React.CSSProperties);
  const cls = (base: string) => (scrub ? `${base} scrub` : base);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Verbindungen in Reihenfolge */}
      {P.slice(0, -1).map((p, i) => (
        <line
          key={`l-${i}`}
          x1={p.x}
          y1={p.y}
          x2={P[i + 1].x}
          y2={P[i + 1].y}
          className={cls("hair scrub-draw")}
          stroke="#d4af37"
          strokeOpacity="0.55"
          data-draw
          pathLength={DRAW_LENGTH}
          strokeDasharray={scrub ? DRAW_LENGTH : undefined}
          style={{ "--len": DRAW_LENGTH, ...win(0.16 + i * 0.15, 0.17) } as React.CSSProperties}
        />
      ))}

      {/* Rückbahn: der Kreis schließt sich */}
      <path
        d={`M ${P[3].x} ${P[3].y} Q ${W / 2} ${H + 140} ${P[0].x} ${P[0].y}`}
        className={cls("hair scrub-draw")}
        stroke="#f5f6f7"
        strokeOpacity="0.2"
        data-draw
        pathLength={DRAW_LENGTH}
        strokeDasharray={scrub ? DRAW_LENGTH : undefined}
        style={{ "--len": DRAW_LENGTH, ...win(0.62, 0.24) } as React.CSSProperties}
      />

      {/* Punkte */}
      {P.map((p, i) => (
        <g
          key={`p-${i}`}
          className={cls("scrub-move")}
          style={
            {
              "--s0": 0.3,
              "--s1": 1,
              "--o0": 0,
              "--o1": 1,
              transformOrigin: `${p.x}px ${p.y}px`,
              ...win(0.08 + i * 0.15, 0.14),
            } as React.CSSProperties
          }
        >
          <circle cx={p.x} cy={p.y} r="4" fill="#d4af37" />
          <circle cx={p.x} cy={p.y} r="15" className="hair" stroke="#d4af37" strokeOpacity="0.4" />
        </g>
      ))}
    </svg>
  );
}

function Header() {
  return (
    <div className="flex items-baseline justify-between gap-8">
      <Reveal kind="fade">
        <p className="t-label text-grey">04 — Ablauf</p>
      </Reveal>
      <Reveal kind="fade" delay={120}>
        <p className="t-label hidden text-grey sm:block">Vier Schritte, wiederkehrend</p>
      </Reveal>
    </div>
  );
}

const CLOSING = "Ein geschlossener Kreis — kein Projekt mit Enddatum.";

export function Constellation() {
  return (
    <>
      {/* Große Fenster: Sticky-Bühne, an den Scroll gebunden. */}
      <div className="hidden lg:block">
        <Scene vh={360} id="ablauf">
          <div className="flex h-full flex-col gap-10 px-(--space-gutter) py-(--space-gutter)">
            <Header />

            {/* Die Figur nimmt genau den Raum, der übrig bleibt — min-h-0
                ist hier entscheidend, sonst wächst sie aus der Bühne heraus. */}
            <div className="flex min-h-0 flex-1 items-center justify-center">
              {/* Exakt das Seitenverhältnis des viewBox: nur so decken sich
                  Prozentangaben der Beschriftungen und gezeichnete Geometrie.
                  Die Höhe führt — bei definierter Breite verwirft der Browser
                  das Seitenverhältnis und die Figur wird wieder eingepasst. */}
              <div
                className="relative h-full"
                style={{ aspectRatio: `${W} / ${H}` }}
              >
              <Figure scrub />

              {/* Titel an den Punkten */}
              <div aria-hidden="true" className="absolute inset-0">
                {P.map((p, i) => (
                  <div
                    key={`t-${i}`}
                    className="scrub scrub-fade absolute"
                    style={
                      {
                        left: `${(p.x / W) * 100}%`,
                        top: `${(p.y / H) * 100}%`,
                        "--a": 0.12 + i * 0.15,
                        "--span": 0.14,
                        "--o0": 0,
                        "--o1": 1,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className={`-translate-y-1/2 ${
                        i === P.length - 1 ? "-translate-x-full pr-7" : "pl-7"
                      }`}
                    >
                      <span className="t-label whitespace-nowrap text-white">
                        {STEPS[i].title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-4 gap-x-8">
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  className="scrub scrub-move"
                  style={
                    {
                      "--a": 0.12 + i * 0.15,
                      "--span": 0.18,
                      "--y0": "1.25rem",
                      "--y1": "0px",
                      "--o0": 0,
                      "--o1": 1,
                    } as React.CSSProperties
                  }
                >
                  <div className="hairline mb-4 h-px w-full" />
                  <p className="t-label text-gold">{s.n}</p>
                  <h3 className="t-h3 mt-3">{s.title}</h3>
                  <p className="t-body mt-2">{s.body}</p>
                </div>
              ))}
            </div>

            <div
              className="scrub scrub-fade flex shrink-0 items-start gap-6"
              style={{ "--a": 0.8, "--span": 0.18, "--o0": 0, "--o1": 1 } as React.CSSProperties}
            >
              <span className="hairline mt-[0.62em] h-px w-12 shrink-0 self-start" />
              <p className="t-h3 text-white">{CLOSING}</p>
            </div>
          </div>
        </Scene>
      </div>

      {/* Kleinere Fenster: läuft normal durch, gestaffelt eingeblendet. */}
      <section
        id="ablauf-kompakt"
        className="px-(--space-gutter) py-(--space-section) lg:hidden"
      >
        <Header />

        <Reveal kind="fade" delay={220} className="mt-14 h-[38vw] max-h-64 min-h-36 w-full">
          <Figure scrub={false} />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-10">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 130}>
              <div className="hairline mb-5 h-px w-full" />
              <p className="t-label text-gold">{s.n}</p>
              <h3 className="t-h3 mt-4">{s.title}</h3>
              <p className="t-body mt-3">{s.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-16 flex items-start gap-6">
            <span className="hairline mt-[0.62em] h-px w-12 shrink-0 self-start" />
            <p className="t-h3 text-white">{CLOSING}</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
