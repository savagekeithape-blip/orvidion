import { Reveal } from "@/components/Reveal";
import { SectionHead } from "@/components/SectionHead";
import { SERVICES } from "@/content";

/**
 * Leistungen.
 *
 * Vorher eine Sticky-Reise über 480 vh für vier kurze Absätze — fast fünf
 * Bildschirme Scrollen ohne neuen Inhalt. Jetzt eine gesetzte Liste, die man
 * in einem Blick überschaut. Keine Cards: nur Haarlinien, Ziffern und Raster.
 */

/** Ein kleines Bahnzeichen je Leistung — je Position ein Knoten mehr. */
function Glyph({ index }: { index: number }) {
  const pts = Array.from({ length: index + 1 }, (_, i) => {
    const t = Math.PI * (0.18 + (i / Math.max(index, 1)) * 0.64);
    return { x: 30 + Math.cos(t) * 26, y: 30 + Math.sin(t) * 26 };
  });
  return (
    <svg viewBox="0 0 60 60" className="size-[60px]" aria-hidden="true">
      <circle
        cx="30"
        cy="30"
        r="26"
        className="hair-thin"
        stroke="#f5f6f7"
        strokeOpacity="0.16"
      />
      <circle cx="30" cy="30" r="1.8" fill="#d4af37" />
      {pts.map((p, i) => (
        <g key={i}>
          <line
            x1="30"
            y1="30"
            x2={p.x}
            y2={p.y}
            className="hair-thin"
            stroke="#d4af37"
            strokeOpacity="0.28"
          />
          <circle cx={p.x} cy={p.y} r="2.4" fill="#f5f6f7" fillOpacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

export function Services() {
  return (
    <section id="leistungen" className="py-(--section-y)">
      <div className="shell">
        <SectionHead
          ordinal="03"
          label="Leistungen"
          title="Vier Bahnen um dieselbe Mitte."
          lead="Wir verkaufen keine Technologie, sondern Struktur. Die vier Bereiche greifen ineinander — einzeln bringen sie wenig."
        />

        <ul className="mt-16">
          {SERVICES.map((s, i) => (
            <li key={s.n}>
              <Reveal kind="line" delay={i * 90} className="rule h-px w-full" />
              <Reveal delay={i * 90 + 80}>
                <article className="grid12 group items-start gap-y-4 py-10 lg:py-12">
                  <div className="col-span-2 lg:col-span-1">
                    <span className="t-ordinal">{s.n}</span>
                  </div>
                  <div className="col-span-10 lg:col-span-4">
                    <h3 className="text-[clamp(1.375rem,2.1vw,1.9rem)] leading-[1.15] tracking-[-0.026em]">
                      {s.title}
                    </h3>
                  </div>
                  <div className="col-span-12 lg:col-span-5 lg:col-start-7">
                    <p className="t-body max-w-[52ch]">{s.body}</p>
                  </div>
                  <div className="col-span-12 hidden justify-end lg:col-span-1 lg:col-start-12 lg:flex">
                    <Glyph index={i} />
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
          <Reveal kind="line" delay={360} className="rule h-px w-full" />
        </ul>
      </div>
    </section>
  );
}
