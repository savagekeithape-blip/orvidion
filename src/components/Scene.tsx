"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerSection } from "@/lib/scroll";

/**
 * Eine Sektion, die sich beim Scrollen festsetzt und durchläuft.
 *
 * Der äußere Block ist `vh` hoch — eine lange Strecke bedeutet wenig Bewegung
 * pro gescrolltem Pixel, und genau daraus entsteht die Ruhe. Die Bühne darin
 * klebt auf voller Viewport-Höhe. Der gedämpfte Fortschritt liegt als `--p`
 * auf dem äußeren Block und wird an die Bühne vererbt.
 */
export function Scene({
  vh = 340,
  id,
  className = "",
  stageClassName = "",
  children,
}: {
  vh?: number;
  id?: string;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerSection(el);
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`relative ${className}`}
      style={{ height: `${vh}vh` }}
    >
      <div className={`sticky top-0 h-screen overflow-hidden ${stageClassName}`}>
        {children}
      </div>
    </section>
  );
}

/**
 * Normierte Konturlänge für sich zeichnende Linien.
 *
 * Wird zugleich als `pathLength`, als `stroke-dasharray` und als `--len` für
 * den Endwert der Animation gesetzt. Unterstützt der Browser `pathLength` auf
 * Grundformen, rechnet er das Strichmuster exakt auf diesen Wert um. Tut er es
 * nicht, ist der Wert immer noch länger als jede Kontur auf dieser Seite —
 * dann liegt die ganze Kontur im ersten Strich, und Anfang wie Ende stimmen
 * ebenfalls. Nur die Zwischenschritte sind dann nicht ganz gleichmäßig.
 *
 * Wichtig: diese drei Werte müssen gleich bleiben. Weichen sie voneinander ab,
 * skaliert der Browser das Strichmuster im Verhältnis der beiden Längen — und
 * die Linie wird gestrichelt statt durchgezogen.
 */
export const DRAW_LENGTH = 4000;
