import Link from "next/link";

export const metadata = { title: "Datenschutz — ORVIDION" };

/**
 * Platzhalter. Diese Seite ist für eine deutsche Unternehmenswebsite
 * rechtlich erforderlich, der Inhalt muss aber von ORVIDION kommen — hier
 * steht bewusst nichts Erfundenes.
 */
export default function Page() {
  return (
    <main className="mx-auto max-w-[min(48rem,92vw)] px-(--space-gutter) py-(--space-section)">
      <p className="t-label text-grey">ORVIDION</p>
      <h1 className="t-h2 mt-7">Datenschutz</h1>
      <p className="t-lead mt-9">
        Dieser Inhalt fehlt noch. Angaben zu Anbieter, Vertretung, Kontakt und
        Verantwortlichkeit werden von ORVIDION geliefert — hier stehen bewusst
        keine erfundenen Daten.
      </p>
      <Link
        href="/"
        className="t-label mt-14 inline-block border-b border-white/20 pb-1 text-white hover:border-gold hover:text-gold"
      >
        Zurück
      </Link>
    </main>
  );
}
