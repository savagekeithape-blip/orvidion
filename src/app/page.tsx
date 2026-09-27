import { Starfield } from "@/components/Starfield";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { Principle } from "@/components/sections/Principle";
import { Cases } from "@/components/sections/Cases";
import { Process } from "@/components/sections/Process";
import { Impact } from "@/components/sections/Impact";
import { Answers } from "@/components/sections/Answers";
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

      <Starfield />
      <ScrollProgress />

      <main className="relative z-10">
        <Hero />
        <Principle />
        <Cases />
        <Process />
        <Impact />
        <Answers />
        <Contact />
      </main>
    </>
  );
}
