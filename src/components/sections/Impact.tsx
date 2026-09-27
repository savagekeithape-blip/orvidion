import { Reveal } from "@/components/Reveal";
import { SectionHead } from "@/components/SectionHead";
import { TARGETS } from "@/content";

/**
 * Wirkung — ausgewiesene Zielkorridore.
 *
 * Die Einordnung steht über den Zahlen, nicht im Kleingedruckten darunter.
 * Ehrlichkeit ist hier die Gestaltung.
 *
 * Erste Verwendung der zweiten Markenfarbe als echte Fläche: die Werte liegen
 * auf einer eigenen Ebene statt frei im Schwarzen. Das gibt der Sektion Halt,
 * ohne Cards, Rundungen oder Schatten einzuführen.
 */
export function Impact() {
  return (
    <section id="wirkung" className="py-(--section-y)">
      <div className="shell">
        <SectionHead
          ordinal="05"
          label="Wirkung"
          title="Woran wir uns messen lassen."
        />

        {/* Die Einordnung kommt vor den Zahlen. */}
        <Reveal delay={200} className="mt-14">
          <div className="grid12">
            <div className="col-span-12 flex items-start gap-5 lg:col-span-7">
              <span className="mt-[0.72em] h-px w-8 shrink-0 bg-gold" />
              <p className="t-body text-white/85">
                Die folgenden Werte sind{" "}
                <span className="text-gold">
                  Zielkorridore aus unserer Projektplanung
                </span>{" "}
                — keine gemessenen Kundenergebnisse. Wir nennen sie, damit Sie
                wissen, worauf wir arbeiten und woran Sie uns festhalten können.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={320} className="plane mt-12">
          <div className="grid12">
            {TARGETS.map((t, i) => (
              <div
                key={t.value}
                className={`col-span-12 p-8 sm:col-span-4 lg:p-12 ${
                  i > 0
                    ? "border-t border-white/8 sm:border-t-0 sm:border-l"
                    : ""
                }`}
              >
                <p className="t-num text-white">{t.value}</p>
                <p className="t-body mt-5 max-w-[22ch] text-white/80">{t.label}</p>
                <p className="mt-4 max-w-[26ch] text-[0.8125rem] leading-[1.55] text-grey/80">
                  {t.note}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  );
}
