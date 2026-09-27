import { Reveal } from "@/components/Reveal";

/**
 * Sektionskopf.
 *
 * Vorher hatte jede Sektion ihre eigene Kopfzeile in eigener Breite und
 * eigener Position. Ein gemeinsames Bauteil ist der halbe Grund, warum eine
 * Seite zusammenhängend wirkt.
 */
export function SectionHead({
  ordinal,
  label,
  title,
  lead,
}: {
  ordinal: string;
  label: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
}) {
  return (
    <header className="grid12">
      <div className="col-span-12">
        <Reveal kind="fade" className="flex items-baseline gap-5">
          <span className="t-ordinal">{ordinal}</span>
          <span className="t-label text-grey">{label}</span>
        </Reveal>
        <Reveal kind="line" delay={120} className="rule mt-5 h-px w-full" />
      </div>

      <div className="col-span-12 mt-10 lg:col-span-6">
        <Reveal delay={200}>
          <h2 className="t-h2 text-balance">{title}</h2>
        </Reveal>
      </div>

      {lead ? (
        <div className="col-span-12 mt-6 lg:col-span-5 lg:col-start-8 lg:mt-10">
          <Reveal delay={320}>
            <p className="t-lead">{lead}</p>
          </Reveal>
        </div>
      ) : null}
    </header>
  );
}
