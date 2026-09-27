import { Starfield } from "@/components/Starfield";
import { Arrival } from "@/components/sections/Arrival";
import { Scatter } from "@/components/sections/Scatter";
import { Core } from "@/components/sections/Core";
import { Orbits } from "@/components/sections/Orbits";
import { Constellation } from "@/components/sections/Constellation";
import { Impact } from "@/components/sections/Impact";
import { Close } from "@/components/sections/Close";

/**
 * Die Seite ist ein einziges Orbitalsystem, über Zeit betrachtet.
 *
 * Oben verstreute, unverbundene Punkte. Unten ein geschlossenes System mit
 * einem Kern. Dazwischen findet es sich — das ist der Firmensatz, gezeichnet
 * statt behauptet.
 */
export default function Page() {
  return (
    <>
      <a
        href="#leistungen"
        className="t-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-gold focus:px-5 focus:py-3 focus:text-ink"
      >
        Zum Inhalt
      </a>

      {/* Durchlaufendes Sternenfeld, drei Parallax-Ebenen. */}
      <Starfield />

      <main className="relative">
        <Arrival />
        <Scatter />
        <Core />
        <Orbits />
        <Constellation />

        {/* Zweite Fläche: eigene Ebene für den ruhigen Teil am Ende.
            Die Kanten laufen weich aus, damit keine harte Naht entsteht. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-ink-2/55 [mask-image:linear-gradient(to_bottom,transparent,black_12rem,black_calc(100%-12rem),transparent)]"
          />
          <div className="relative">
            <Impact />
            <Close />
          </div>
        </div>
      </main>
    </>
  );
}
