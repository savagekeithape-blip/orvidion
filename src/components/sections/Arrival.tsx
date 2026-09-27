"use client";

import { Reveal } from "@/components/Reveal";
import { Scene } from "@/components/Scene";
import { CLAIM } from "@/content";

/**
 * Ankunft. Tiefes Feld, die Headline kommt zeilenweise hinter einer Maske
 * herein. Am unteren Rand beginnt ein einzelner goldener Bogen — das erste
 * Fragment einer Bahn, die erst im Kern geschlossen wird.
 */
export function Arrival() {
  return (
    <Scene vh={190} id="start">
      <div className="relative h-full">
        {/* Bahnfragmente. Sehr groß, sehr ruhig, hauchfein. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
        >
          <g
            className="scrub scrub-move"
            style={
              {
                "--a": 0,
                "--span": 1,
                "--y0": "0px",
                "--y1": "-70px",
                "--s0": 1,
                "--s1": 1.06,
                "--o0": 1,
                "--o1": 0.35,
                transformOrigin: "720px 1180px",
              } as React.CSSProperties
            }
          >
            <ellipse
              cx="720"
              cy="1180"
              rx="1180"
              ry="430"
              className="hair"
              stroke="#d4af37"
              strokeOpacity="0.5"
            />
            <ellipse
              cx="720"
              cy="1240"
              rx="920"
              ry="330"
              className="hair"
              stroke="#f5f6f7"
              strokeOpacity="0.09"
            />
            <ellipse
              cx="720"
              cy="1330"
              rx="1480"
              ry="560"
              className="hair"
              stroke="#f5f6f7"
              strokeOpacity="0.06"
            />
            {/* Knoten auf der goldenen Bahn */}
            <circle cx="248" cy="1004" r="2" fill="#d4af37" />
            <circle cx="1192" cy="1004" r="2" fill="#d4af37" />
          </g>
        </svg>

        {/* Inhalt */}
        <div
          className="scrub scrub-move relative flex h-full flex-col justify-between px-(--space-gutter) py-(--space-gutter)"
          style={
            {
              "--a": 0.34,
              "--span": 0.66,
              "--y0": "0px",
              "--y1": "-11vh",
              "--o0": 1,
              "--o1": 0,
            } as React.CSSProperties
          }
        >
          <header className="flex items-start justify-between gap-8">
            <Reveal kind="fade" delay={120}>
              <span className="t-label text-white">ORVIDION</span>
            </Reveal>
            <Reveal kind="fade" delay={220}>
              <span className="t-label hidden text-grey sm:inline">
                Struktur statt Werkzeuge
              </span>
            </Reveal>
          </header>

          <div className="max-w-[min(62rem,92vw)]">
            <Reveal kind="fade" delay={420}>
              <p className="t-label mb-8 text-gold sm:mb-10">{CLAIM}</p>
            </Reveal>

            <h1 className="t-display">
              {["Viele Teile.", "Ein System."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <Reveal
                    delay={560 + i * 130}
                    style={{ "--rise-from": "115%" } as React.CSSProperties}
                  >
                    <span className="block">
                      {i === 1 ? (
                        <>
                          Ein{" "}
                          {/* Als Textdekoration statt als positionierte Linie:
                              so gehört sie zum Textkasten und kann von der
                              Zeilenmaske nicht abgeschnitten werden. Die
                              Unterlänge des „y" wird automatisch ausgespart. */}
                          <span className="underline decoration-gold decoration-[1.5px] underline-offset-[0.13em]">
                            System
                          </span>
                          .
                        </>
                      ) : (
                        line
                      )}
                    </span>
                  </Reveal>
                </span>
              ))}
            </h1>

            <Reveal delay={900}>
              <p className="t-lead mt-10 max-w-[42ch]">
                ORVIDION verbindet die Abläufe in Ihrem Unternehmen zu einem
                Ganzen — mit KI-Automatisierung, die Handarbeit messbar
                ersetzt statt sie zu verschieben.
              </p>
            </Reveal>
          </div>

          <footer className="flex items-end justify-between gap-8">
            <Reveal kind="fade" delay={1200}>
              <span className="t-label text-grey">Scrollen</span>
            </Reveal>
            <Reveal
              kind="line"
              delay={1200}
              className="hairline hidden h-px w-[min(34vw,22rem)] sm:block"
            />
          </footer>
        </div>
      </div>
    </Scene>
  );
}
