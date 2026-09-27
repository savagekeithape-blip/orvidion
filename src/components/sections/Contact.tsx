import { Reveal } from "@/components/Reveal";
import { OrbitSystem } from "@/components/Orbit";
import { CLAIM, CONTACT } from "@/content";

/**
 * Ausklang.
 *
 * Das fertige System dreht sich langsam für sich — eine Umdrehung in vier
 * Minuten, an der Wahrnehmungsgrenze. Hier steht der einzige gefüllte goldene
 * Knopf der ganzen Seite.
 */
export function Contact() {
  return (
    <section id="kontakt" className="relative overflow-hidden pt-(--section-y) pb-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[-18%] hidden aspect-square w-[min(108vh,70rem)] -translate-y-1/2 opacity-80 lg:block"
      >
        <OrbitSystem id="close" spin className="h-full w-full" />
      </div>

      {/* Auf schmalen Fenstern hinter dem Text statt daneben. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[46%] left-1/2 aspect-square w-[124vw] -translate-x-1/2 -translate-y-1/2 opacity-40 lg:hidden"
      >
        <OrbitSystem id="close-sm" spin className="h-full w-full" />
      </div>

      <div className="shell relative">
        <div className="grid12">
          <div className="col-span-12 lg:col-span-7">
            <Reveal kind="fade" className="flex items-baseline gap-5">
              <span className="t-ordinal">06</span>
              <span className="t-label text-grey">Kontakt</span>
            </Reveal>
            <Reveal delay={140}>
              <h2 className="t-display mt-9 text-balance">
                Sprechen wir über einen Ablauf, der Zeit kostet.
              </h2>
            </Reveal>
            <Reveal delay={300}>
              <p className="t-lead mt-9 max-w-[46ch]">
                Ein Gespräch, dreißig Minuten. Wir sehen uns einen konkreten
                Prozess an und sagen offen, ob und wo sich Automatisierung
                rechnet.
              </p>
            </Reveal>

            <Reveal delay={440}>
              <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-6">
                {/* Der einzige gefüllte goldene Knopf der Seite. */}
                <a
                  href={`mailto:${CONTACT.email}?subject=Gespr%C3%A4ch%20%C3%BCber%20Automatisierung`}
                  className="group t-label inline-flex items-center gap-4 bg-gold px-9 py-5 text-ink transition-opacity duration-700 ease-(--ease) hover:opacity-88"
                >
                  Start a Conversation
                  <span
                    aria-hidden="true"
                    className="block h-px w-6 bg-ink transition-[width] duration-700 ease-(--ease) group-hover:w-9"
                  />
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="t-body border-b border-white/25 pb-1 text-white transition-colors duration-700 ease-(--ease) hover:border-gold hover:text-gold"
                >
                  {CONTACT.email}
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal kind="line" delay={560} className="rule mt-28 h-px w-full" />

        <footer className="flex flex-col gap-6 pt-8 sm:flex-row sm:items-baseline sm:justify-between">
          <Reveal kind="fade" delay={620}>
            <p className="t-label text-white">ORVIDION</p>
          </Reveal>
          <Reveal kind="fade" delay={700}>
            <p className="t-label text-gold/70">{CLAIM}</p>
          </Reveal>
          <Reveal kind="fade" delay={780}>
            <nav className="t-label flex gap-7 text-grey">
              <a href="/impressum" className="hover:text-white">Impressum</a>
              <a href="/datenschutz" className="hover:text-white">Datenschutz</a>
            </nav>
          </Reveal>
        </footer>
      </div>
    </section>
  );
}
