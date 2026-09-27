import { Atmosphere } from "@/components/Atmosphere";
import { Starfield } from "@/components/Starfield";
import { Header } from "@/components/Header";
import { Hero } from "@/components/sections/Hero";
import { Principle } from "@/components/sections/Principle";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Impact } from "@/components/sections/Impact";
import { Contact } from "@/components/sections/Contact";

/**
 * Ein Orbitalsystem, über die Seite hinweg.
 *
 * Der Hero zeigt es angeschnitten, die eine gescrubbte Szene baut es aus
 * verstreuten Punkten zusammen, der Ausklang zeigt es fertig und in Ruhe.
 * Dazwischen scrollt alles normal — nur eine Szene setzt sich fest, sonst
 * wäre keine davon ein Moment.
 */
export default function Page() {
  return (
    <>
      <a
        href="#prinzip"
        className="t-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-gold focus:px-5 focus:py-3 focus:text-ink"
      >
        Zum Inhalt
      </a>

      <Atmosphere />
      <Starfield />
      <Header />

      <main className="relative z-10">
        <Hero />
        <Principle />
        <Services />
        <Process />
        <Impact />
        <Contact />
      </main>
    </>
  );
}
