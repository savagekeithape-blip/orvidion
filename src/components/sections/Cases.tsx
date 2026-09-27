import { Reveal } from "@/components/Reveal";
import { SectionHead } from "@/components/SectionHead";
import { CAPABILITIES, CASES } from "@/content";

/**
 * Anwendungsfälle.
 *
 * Ersetzt die frühere Leistungsliste. Wer Automatisierung sucht, erkennt sich
 * an der Beschreibung seines Alltags wieder, nicht an einer Technologieliste —
 * deshalb steht jedem Ablauf das „Heute" gegenüber, bevor das „Danach" kommt.
 *
 * Die vier Arbeitsbereiche stehen kompakt darunter. Sie beschreiben, wie
 * gearbeitet wird; die Anwendungsfälle, woran.
 */

/** Ein kleines Bahnzeichen je Ablauf — je Position ein Knoten mehr. */
function Glyph({ index }: { index: number }) {
  const pts = Array.from({ length: index + 1 }, (_, i) => {
    const t = Math.PI * (0.18 + (i / Math.max(index, 1)) * 0.64);
    return { x: 30 + Math.cos(t) * 26, y: 30 + Math.sin(t) * 26 };
  });
  return (
    <svg viewBox="0 0 60 60" className="size-[56px]" aria-hidden="true">
      <circle cx="30" cy="30" r="26" className="hair-thin" stroke="#f5f6f7" strokeOpacity="0.16" />
      <circle cx="30" cy="30" r="1.8" fill="#d4af37" />
      {pts.map((p, i) => (
        <g key={i}>
          <line x1="30" y1="30" x2={p.x} y2={p.y} className="hair-thin" stroke="#d4af37" strokeOpacity="0.28" />
          <circle cx={p.x} cy={p.y} r="2.4" fill="#f5f6f7" fillOpacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

export function Cases() {
  return (
    <section id="anwendungsfaelle" className="py-(--section-y)">
      <div className="shell">
        <SectionHead
          ordinal="03"
          label="Anwendungsfälle"
          title="Es fängt nie mit der Technik an."
          lead="Sondern mit einem Ablauf, der messbar Zeit kostet. Diese vier kommen am häufigsten vor — und eignen sich, weil sie klare Regeln haben und täglich anfallen."
        />

        <ul className="mt-16">
          {CASES.map((c, i) => (
            <li key={c.n}>
              <Reveal kind="line" delay={i * 80} className="rule h-px w-full" />
              <Reveal delay={i * 80 + 70}>
                <article className="grid12 items-start gap-y-6 py-10 lg:py-12">
                  <div className="col-span-2 lg:col-span-1">
                    <span className="t-ordinal">{c.n}</span>
                  </div>

                  <div className="col-span-10 lg:col-span-3">
                    <h3 className="text-[clamp(1.3125rem,1.9vw,1.75rem)] leading-[1.15] tracking-[-0.026em]">
                      {c.title}
                    </h3>
                  </div>

                  <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-6">
                    <p className="t-label mb-3 text-grey/70">Heute</p>
                    <p className="t-body">{c.today}</p>
                  </div>

                  <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-9">
                    <p className="t-label mb-3 text-gold">Danach</p>
                    <p className="t-body text-white/80">{c.after}</p>
                  </div>

                  <div className="col-span-12 hidden justify-end lg:col-span-1 lg:col-start-12 lg:flex">
                    <Glyph index={i} />
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
          <Reveal kind="line" delay={340} className="rule h-px w-full" />
        </ul>

        {/* Die Arbeitsbereiche, kompakt. */}
        <div className="grid12 mt-16 gap-y-10">
          <div className="col-span-12 lg:col-span-2">
            <Reveal kind="fade">
              <p className="t-label text-grey">Womit wir arbeiten</p>
            </Reveal>
          </div>
          {CAPABILITIES.map((c, i) => (
            <div key={c.title} className="col-span-12 sm:col-span-6 lg:col-span-2 lg:col-start-auto">
              <Reveal delay={i * 90}>
                <h3 className="t-h3">{c.title}</h3>
                <p className="t-body mt-3">{c.body}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
