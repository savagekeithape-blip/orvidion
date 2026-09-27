import { Reveal } from "@/components/Reveal";
import { TARGETS } from "@/content";

/**
 * Wirkung — ausgewiesene Zielkorridore.
 *
 * Nach vier langen Sticky-Strecken läuft diese Sektion normal durch. Der
 * Rhythmuswechsel ist beabsichtigt: er wirkt wie Ausatmen.
 *
 * Ehrlichkeit ist hier die Gestaltung: die Einordnung steht über den Zahlen,
 * nicht im Kleingedruckten darunter.
 */
export function Impact() {
  return (
    <section
      id="wirkung"
      className="relative px-(--space-gutter) py-(--space-section)"
    >
      <div className="mx-auto max-w-[min(78rem,94vw)]">
        <Reveal kind="fade">
          <p className="t-label text-grey">05 — Wirkung</p>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="t-h2 mt-7 max-w-[28ch]">Woran wir uns messen lassen.</h2>
        </Reveal>

        {/* Die Einordnung steht vor den Zahlen. */}
        <Reveal delay={240}>
          <div className="mt-10 flex max-w-[52ch] items-start gap-5">
            <span className="mt-[0.7em] h-px w-8 shrink-0 bg-gold" />
            <p className="t-body text-white/85">
              Die folgenden Werte sind{" "}
              <span className="text-gold">Zielkorridore aus unserer
              Projektplanung</span>{" "}
              — keine gemessenen Kundenergebnisse. Wir nennen sie, damit Sie
              wissen, worauf wir arbeiten, und woran Sie uns festhalten können.
            </p>
          </div>
        </Reveal>

        <Reveal kind="line" delay={420} className="mt-20 h-px w-full bg-gold/35" />

        <div className="grid grid-cols-1 sm:grid-cols-3">
          {TARGETS.map((t, i) => (
            <Reveal
              key={t.value}
              delay={520 + i * 140}
              className={`py-12 sm:px-10 sm:first:pl-0 ${
                i > 0 ? "border-t border-white/10 sm:border-t-0 sm:border-l" : ""
              }`}
            >
              <p className="t-num text-white">{t.value}</p>
              <p className="t-body mt-5 max-w-[24ch] text-white/80">{t.label}</p>
              <p className="t-label mt-4 text-grey normal-case tracking-normal opacity-80">
                {t.note}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal kind="line" delay={520} className="h-px w-full bg-white/10" />

        {/* Was wir nicht zeigen — und warum. */}
        <Reveal delay={700}>
          <div className="mt-24 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <h3 className="t-h3 max-w-[22ch] text-balance">
              Sie finden hier keine Logos und keine Testimonials.
            </h3>
            <p className="t-body max-w-[54ch]">
              Das ist eine Entscheidung, keine Auslassung. ORVIDION ist jung,
              und fremde Logos auf einer Startseite sagen ohnehin nichts über
              die Arbeit. Was wir belegen können, belegen wir im Gespräch — an
              einem Ihrer Abläufe, mit offenem Aufwand und offener Grenze. Wenn
              sich Automatisierung nicht lohnt, sagen wir das.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
