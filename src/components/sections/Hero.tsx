"use client";

import { Reveal } from "@/components/Reveal";
import { OrbitSystem } from "@/components/Orbit";
import { CLAIM } from "@/content";

const KEYWORDS = ["KI-Automatisierung", "Verbundene Abläufe", "Messbarer Effekt"];

/**
 * Ankunft.
 *
 * Eine Bildschirmhöhe, kein Scroll-Scrubbing. Das Orbitalsystem sitzt rechts
 * und läuft über den Rand hinaus — man sieht einen Ausschnitt von etwas
 * Größerem. Vorher stand hier Text links und rechts nichts; die Fläche wirkte
 * nicht großzügig, sondern unbespielt.
 */
export function Hero() {
  return (
    <section id="start" className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Das System, rechts angeschnitten. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[-26%] hidden aspect-square w-[min(112vh,80rem)] -translate-y-1/2 lg:block"
      >
        <OrbitSystem id="hero" spin className="h-full w-full" />
      </div>
      {/* Auf schmalen Fenstern hinter dem Text, deutlich zurückgenommen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[38%] left-1/2 aspect-square w-[130vw] -translate-x-1/2 -translate-y-1/2 opacity-45 lg:hidden"
      >
        <OrbitSystem id="hero-sm" spin className="h-full w-full" />
      </div>

      {/* Kopf */}
      <div className="relative pt-7">
        <div className="shell flex items-center justify-between gap-8">
          <Reveal kind="fade" delay={100}>
            <span className="t-label text-white">ORVIDION</span>
          </Reveal>
          <Reveal kind="fade" delay={200}>
            <span className="t-label hidden text-grey sm:inline">
              Struktur statt Werkzeuge
            </span>
          </Reveal>
        </div>
      </div>

      {/* Mitte */}
      <div className="relative flex flex-1 items-center py-16">
        <div className="shell grid12 w-full">
          <div className="col-span-12 lg:col-span-7">
            <Reveal kind="fade" delay={360}>
              <p className="t-label mb-9 text-gold">{CLAIM}</p>
            </Reveal>

            <h1 className="t-display">
              {["Viele Teile.", "Ein System."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <Reveal
                    delay={480 + i * 120}
                    style={{ "--rise-from": "115%" } as React.CSSProperties}
                  >
                    <span className="block">
                      {i === 1 ? (
                        <>
                          Ein{" "}
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

            <Reveal delay={800}>
              <p className="t-lead mt-9 max-w-[44ch]">
                ORVIDION verbindet die Abläufe in Ihrem Unternehmen zu einem
                Ganzen — mit KI-Automatisierung, die Handarbeit messbar ersetzt
                statt sie zu verschieben.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Fuß */}
      <div className="relative pb-9">
        <div className="shell">
          <Reveal kind="line" delay={1000} className="rule mb-6 h-px w-full" />
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {KEYWORDS.map((k, i) => (
                <Reveal key={k} kind="fade" delay={1100 + i * 90}>
                  <li className="t-label flex items-center gap-3 text-grey">
                    <span className="block size-[3px] rounded-full bg-gold" />
                    {k}
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal kind="fade" delay={1400}>
              <span className="t-label text-grey">Scrollen</span>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
