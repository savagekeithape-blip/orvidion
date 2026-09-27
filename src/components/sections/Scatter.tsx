"use client";

import { Reveal } from "@/components/Reveal";
import { Scene } from "@/components/Scene";

/**
 * Streuung — die Ausgangslage.
 *
 * Die einzige Sektion mit bewusst asymmetrischer Komposition: nichts ist auf
 * ein gemeinsames Zentrum ausgerichtet, und beim Scrollen driften die Knoten
 * weiter auseinander. Kein Gold auf dieser Seite — dadurch trifft der goldene
 * Kern in der nächsten Sektion als Auflösung.
 */

type Node = {
  label: string;
  /** Lage ab `sm`, in Prozent der Bühne. */
  x: number;
  y: number;
  /** Lage darunter. Schmale Fenster haben rechts keinen Platz für die
   *  Beschriftung, und der Textblock nimmt die untere Hälfte ein. Entfällt
   *  bei Knoten, die dort ohnehin ausgeblendet sind. */
  xs?: number;
  ys?: number;
  dx: number;
  dy: number;
  delay: number;
  /** Auf schmalen Fenstern ausgeblendet — sonst wird es gedrängt. */
  wide?: boolean;
};

/**
 * Die Knoten müssen zwei Dinge freihalten: den Textblock unten links und den
 * rechten Rand, hinter dem die Beschriftung abgeschnitten würde.
 */
const NODES: Node[] = [
  { label: "Angebote", x: 56, y: 13, xs: 8, ys: 10, dx: 34, dy: -26, delay: 0 },
  { label: "Stammdaten", x: 14, y: 17, xs: 40, ys: 20, dx: -30, dy: -22, delay: 90 },
  { label: "Freigaben", x: 33, y: 28, xs: 12, ys: 30, dx: -24, dy: -18, delay: 180 },
  { label: "Onboarding", x: 78, y: 31, xs: 36, ys: 40, dx: 40, dy: -8, delay: 270 },
  // Auf Höhe des Textblocks muss x rechts von dessen Spalte liegen: der
  // Überschriftenkasten ist so breit wie sein Container, nicht wie sein Text.
  { label: "Datenpflege", x: 67, y: 45, dx: 16, dy: 34, delay: 360, wide: true },
  { label: "Reporting", x: 80, y: 58, dx: 26, dy: 28, delay: 450, wide: true },
  { label: "Rechnungen", x: 70, y: 72, dx: 34, dy: 30, delay: 540, wide: true },
];

export function Scatter() {
  return (
    <Scene vh={260} id="ausgangslage">
      <div className="relative h-full px-(--space-gutter) py-(--space-gutter)">
        {/* Verstreute Knoten. Jeder driftet in seine eigene Richtung. */}
        <div aria-hidden="true" className="absolute inset-0">
          {NODES.map((n) => (
            <div
              key={n.label}
              className={`scrub scrub-move scatter-node absolute ${
                n.wide ? "hidden sm:block" : ""
              }`}
              style={
                {
                  "--nx": `${n.x}%`,
                  "--ny": `${n.y}%`,
                  "--nxs": `${n.xs ?? n.x}%`,
                  "--nys": `${n.ys ?? n.y}%`,
                  "--a": 0,
                  "--span": 1,
                  "--x0": "0px",
                  "--y0": "0px",
                  "--x1": `${n.dx}px`,
                  "--y1": `${n.dy}px`,
                  "--o0": 0.9,
                  "--o1": 0.42,
                } as React.CSSProperties
              }
            >
              <Reveal kind="fade" delay={n.delay} className="flex items-center">
                <span className="block size-[3px] rounded-full bg-grey" />
                <span className="hairline ml-3 block h-px w-8" />
                <span className="t-label ml-3 whitespace-nowrap text-grey">
                  {n.label}
                </span>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Text, unten links verankert — nicht zentriert, nicht ausgerichtet. */}
        <div className="relative flex h-full flex-col justify-end">
          <div className="max-w-[min(48rem,92vw)]">
            <Reveal kind="fade">
              <p className="t-label text-grey">01 — Ausgangslage</p>
            </Reveal>
            <Reveal delay={140}>
              <h2 className="t-h2 mt-7">
                Alles läuft.
                <br />
                Nur nichts zusammen.
              </h2>
            </Reveal>
            <Reveal delay={280}>
              <p className="t-lead mt-8 max-w-[46ch]">
                In den meisten Unternehmen funktioniert jeder Bereich für sich.
                Die Arbeit entsteht dazwischen: im Übertragen, Nachfragen und
                Doppeltpflegen. Sie ist über den Tag verteilt und fällt deshalb
                niemandem als Posten auf.
              </p>
            </Reveal>

            {/* Erscheint erst am Ende der Strecke. */}
            <div
              className="scrub scrub-fade mt-12 flex items-center gap-6"
              style={
                {
                  "--a": 0.62,
                  "--span": 0.3,
                  "--o0": 0,
                  "--o1": 1,
                } as React.CSSProperties
              }
            >
              <span className="hairline h-px w-12 shrink-0" />
              <p className="t-h3 max-w-[30ch] text-white">
                Kein Werkzeug fehlt. Die Verbindung fehlt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
