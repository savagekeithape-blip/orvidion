"use client";

import { Reveal } from "@/components/Reveal";
import { Scene } from "@/components/Scene";
import { SERVICES } from "@/content";

/**
 * Bahnen — die Leistungen.
 *
 * Keine Cards. Man reist beim Scrollen entlang einer Bahn, und jede Leistung
 * erreicht als Knoten den Apex. Nur der Knoten im Apex ist gold, die anderen
 * bleiben grau. Der Bogen liegt weit rechts außerhalb des Bildes, auf dem
 * Schirm liest er deshalb als ruhige Vertikale mit leichter Krümmung.
 */

const CX = 1580; // Bogenmittelpunkt, außerhalb des viewBox
const CY = 500;
const R = 1040;
const STEP = 11; // Grad zwischen zwei Knoten
const SWEEP = 21.7; // Gesamtausschlag der Drehung

/** Punkt auf dem Bogen bei Winkelversatz `d` (Grad) von der Apex-Richtung. */
function onArc(d: number) {
  const th = ((180 + d) * Math.PI) / 180;
  return { x: CX + Math.cos(th) * R, y: CY + Math.sin(th) * R };
}

const NODES = SERVICES.map((_, i) => onArc((i - (SERVICES.length - 1) / 2) * STEP));

export function Orbits() {
  return (
    <Scene vh={480} id="leistungen">
      <div className="relative h-full">
        {/* Die Bahn */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <g
            className="scrub scrub-move scrub-linear"
            style={
              {
                "--a": 0,
                "--span": 1,
                "--r0": `${SWEEP}deg`,
                "--r1": `${-SWEEP}deg`,
                transformOrigin: `${CX}px ${CY}px`,
              } as React.CSSProperties
            }
          >
            <circle
              cx={CX}
              cy={CY}
              r={R}
              className="hair"
              stroke="#f5f6f7"
              strokeOpacity="0.14"
            />
            {NODES.map((n, i) => (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r="3" fill="#a7adb4" fillOpacity="0.55" />
                {/* Goldene Markierung nur, während dieser Knoten im Apex steht. */}
                <g
                  className="scrub scrub-pulse"
                  style={
                    {
                      "--a": i * 0.25 - 0.03,
                      "--span": 0.31,
                    } as React.CSSProperties
                  }
                >
                  <circle cx={n.x} cy={n.y} r="4" fill="#d4af37" />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="17"
                    className="hair"
                    stroke="#d4af37"
                    strokeOpacity="0.5"
                  />
                </g>
              </g>
            ))}
          </g>
        </svg>

        {/* Apex-Marke: eine feine Linie auf Höhe der Mitte */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 right-0 h-px w-[22vw] max-w-56 -translate-y-px bg-linear-to-l from-gold/45 to-transparent"
        />

        <div className="relative flex h-full flex-col justify-between px-(--space-gutter) py-(--space-gutter)">
          <Reveal kind="fade">
            <p className="t-label text-grey">03 — Bahnen</p>
          </Reveal>

          {/* Die Leistungen ziehen durch. Gestapelt, weil sie sich überlagern. */}
          <div className="relative h-[min(24rem,48vh)] max-w-[min(46rem,88vw)]">
            {SERVICES.map((s, i) => (
              <article
                key={s.n}
                className="scrub scrub-pass absolute inset-x-0 top-0"
                style={
                  {
                    "--a": i * 0.25 - 0.03,
                    "--span": 0.31,
                    "--pass": "2rem",
                  } as React.CSSProperties
                }
              >
                <div className="flex items-baseline gap-5">
                  <span className="t-label text-gold">{s.n}</span>
                  <span className="hairline h-px flex-1" />
                </div>
                <h3 className="t-h2 mt-7">{s.title}</h3>
                <p className="t-lead mt-6 max-w-[40ch]">{s.body}</p>
              </article>
            ))}
          </div>

          {/* Fortschrittsanzeige: vier Striche, der aktive in Gold */}
          <div aria-hidden="true" className="flex items-center gap-2">
            {SERVICES.map((s, i) => (
              <span key={s.n} className="relative block h-px w-10 bg-white/12">
                <span
                  className="scrub scrub-pulse absolute inset-0 block bg-gold"
                  style={
                    {
                      "--a": i * 0.25 - 0.03,
                      "--span": 0.31,
                    } as React.CSSProperties
                  }
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
