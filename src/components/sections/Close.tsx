import { Reveal } from "@/components/Reveal";
import { CLAIM, CONTACT } from "@/content";

/**
 * Ausklang.
 *
 * Das System ist fertig und dreht sich sehr langsam für sich — eine Umdrehung
 * in vier Minuten, an der Wahrnehmungsgrenze. Hier steht der einzige gefüllte
 * goldene Knopf der ganzen Seite.
 */
export function Close() {
  return (
    <section
      id="kontakt"
      className="relative overflow-hidden px-(--space-gutter) pt-(--space-section) pb-14"
    >
      {/* Das vollendete System, in Ruhe. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[min(150vh,170vw)] w-[min(150vh,170vw)] -translate-x-1/2 -translate-y-1/2"
      >
        <svg
          viewBox="0 0 1000 1000"
          className="h-full w-full motion-safe:animate-[slow-spin_240s_linear_infinite]"
        >
          <g transform="rotate(-16 500 500)">
            <ellipse cx="500" cy="500" rx="430" ry="148" className="hair" stroke="#f5f6f7" strokeOpacity="0.17" />
          </g>
          <g transform="rotate(24 500 500)">
            <ellipse cx="500" cy="500" rx="318" ry="268" className="hair" stroke="#f5f6f7" strokeOpacity="0.13" />
          </g>
          <g transform="rotate(-44 500 500)">
            <ellipse cx="500" cy="500" rx="196" ry="88" className="hair" stroke="#d4af37" strokeOpacity="0.32" />
          </g>
          <circle cx="500" cy="500" r="3.5" fill="#d4af37" fillOpacity="0.9" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[min(78rem,94vw)]">
        <div className="max-w-[min(50rem,92vw)]">
          <Reveal kind="fade">
            <p className="t-label text-grey">06 — Kontakt</p>
          </Reveal>
          <Reveal delay={140}>
            <h2 className="t-h2 mt-7 text-balance">
              Sprechen wir über einen Ablauf, der bei Ihnen Zeit kostet.
            </h2>
          </Reveal>
          <Reveal delay={280}>
            <p className="t-lead mt-9 max-w-[46ch]">
              Ein Gespräch, dreißig Minuten. Wir sehen uns einen konkreten
              Prozess an und sagen offen, ob und wo sich Automatisierung
              rechnet.
            </p>
          </Reveal>

          <Reveal delay={420}>
            <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-6">
              {/* Der einzige gefüllte goldene Knopf der Seite. */}
              <a
                href={`mailto:${CONTACT.email}?subject=Gespr%C3%A4ch%20%C3%BCber%20Automatisierung`}
                className="group t-label relative inline-flex items-center gap-4 bg-gold px-9 py-5 text-ink transition-opacity duration-700 ease-(--ease) hover:opacity-88"
              >
                Start a Conversation
                <span
                  aria-hidden="true"
                  className="block h-px w-6 bg-ink transition-[width] duration-700 ease-(--ease) group-hover:w-9"
                />
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="t-body border-b border-white/20 pb-1 text-white transition-colors duration-700 ease-(--ease) hover:border-gold hover:text-gold"
              >
                {CONTACT.email}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal kind="line" delay={560} className="mt-32 h-px w-full bg-white/10" />

        <footer className="flex flex-col gap-8 pt-10 sm:flex-row sm:items-baseline sm:justify-between">
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
