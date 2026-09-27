import { Reveal } from "@/components/Reveal";
import { SectionHead } from "@/components/SectionHead";
import { ANSWERS } from "@/content";

/**
 * Klartext.
 *
 * Die Fragen, die in jedem ersten Gespräch kommen — beantwortet, bevor sie
 * gestellt werden müssen. Für den deutschen Mittelstand sind Datenschutz,
 * AI Act, Mitbestimmung und Abhängigkeit die eigentlichen Blocker; sie vorher
 * auszuräumen wirkt stärker als jedes Versprechen.
 */
export function Answers() {
  return (
    <section id="klartext" className="py-(--section-y)">
      <div className="shell">
        <SectionHead
          ordinal="06"
          label="Klartext"
          title="Was Sie fragen würden."
          lead="Sechs Punkte, die in jedem ersten Gespräch kommen. Hier stehen sie, bevor Sie fragen müssen."
        />

        <dl className="grid12 mt-16 gap-y-12">
          {ANSWERS.map((x, i) => (
            <div key={x.q} className="col-span-12 md:col-span-6 lg:col-span-5 lg:[&:nth-child(odd)]:col-start-1 lg:[&:nth-child(even)]:col-start-8">
              <Reveal delay={(i % 2) * 90}>
                <div className="rule mb-5 h-px w-full" />
                <dt className="t-h3 text-balance">{x.q}</dt>
                <dd className="t-body mt-4 max-w-[52ch]">{x.a}</dd>
              </Reveal>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
