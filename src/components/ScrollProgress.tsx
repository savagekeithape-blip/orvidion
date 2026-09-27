"use client";

import { useEffect, useRef } from "react";
import { onScroll } from "@/lib/scroll";

/**
 * Eine goldene Haarlinie am oberen Rand, die den Scroll-Fortschritt zeigt.
 *
 * An dieser Stelle stand eine Navileiste mit Wortmarke, mittigem Menü und
 * Weichzeichner. Sie war generisch und hat gegen die ruhige Seite gearbeitet.
 * Übrig bleibt die Orientierung, die auf einer langen Seite wirklich fehlt —
 * eine Linie, sonst nichts.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onScroll((damped) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const t = max > 0 ? Math.min(1, Math.max(0, damped / max)) : 0;
      bar.current?.style.setProperty("transform", `scaleX(${t.toFixed(4)})`);
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      ref={bar}
      className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-gold/55"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
