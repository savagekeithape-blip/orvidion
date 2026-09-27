"use client";

import { useEffect, useRef, useState } from "react";
import { onScroll } from "@/lib/scroll";
import { CONTACT } from "@/content";

const NAV = [
  { href: "#prinzip", label: "Prinzip" },
  { href: "#anwendungsfaelle", label: "Anwendungsfälle" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#klartext", label: "Klartext" },
];

/**
 * Kopfzeile.
 *
 * Erscheint erst, wenn der Hero verlassen ist — im Hero steht die Marke
 * bereits groß, eine zweite Nennung wäre Verdopplung. Die goldene Haarlinie
 * am oberen Rand zeigt den Scroll-Fortschritt; sie ersetzt die Orientierung,
 * die auf einer langen Seite sonst fehlt.
 */
export function Header() {
  const [shown, setShown] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onScroll((damped) => {
      setShown(damped > window.innerHeight * 0.75);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const t = max > 0 ? Math.min(1, Math.max(0, damped / max)) : 0;
      bar.current?.style.setProperty("transform", `scaleX(${t.toFixed(4)})`);
    });
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-gold/70"
        ref={bar}
        style={{ transform: "scaleX(0)" }}
      />
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[opacity,transform] duration-700 ease-(--ease) ${
          shown
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        style={{
          background: "color-mix(in srgb, var(--color-ink) 78%, transparent)",
          backdropFilter: "blur(14px)",
          borderColor: "color-mix(in srgb, var(--color-white) 8%, transparent)",
        }}
      >
        <div className="shell flex h-16 items-center justify-between gap-8">
          <a href="#start" className="t-label text-white">
            ORVIDION
          </a>
          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="t-label text-grey transition-colors duration-500 ease-(--ease) hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href={`mailto:${CONTACT.email}`}
            className="t-label border-b border-gold/60 pb-1 text-gold transition-colors duration-500 ease-(--ease) hover:border-gold"
          >
            Get in Touch
          </a>
        </div>
      </header>
    </>
  );
}
