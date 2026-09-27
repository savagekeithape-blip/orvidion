"use client";

import { useEffect, useRef } from "react";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";

/**
 * Sternenfeld auf Canvas.
 *
 * Drei Ebenen, die sich beim Scrollen unterschiedlich schnell bewegen —
 * daraus entsteht die Tiefe. Keine Helligkeitsänderung, kein Blinken: die
 * Sterne driften nur.
 *
 * Gegenüber der ersten Fassung deutlich dichter und heller. Vorher war das
 * Feld bei diesen Deckkräften auf dem dunklen Grund praktisch unsichtbar und
 * hat zur Wirkung nichts beigetragen.
 */

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  gold: boolean;
};

// Dichte und Helligkeit sind gemessen, nicht geschätzt: mit der Atmosphäre
// im Rücken verschwanden 558 Sterne auf 1,3 Millionen Pixeln vollständig.
const DEPTHS = [
  { count: 620, speed: 0.05, rMin: 0.45, rMax: 0.95, aMin: 0.28, aMax: 0.5 },
  { count: 340, speed: 0.12, rMin: 0.6, rMax: 1.2, aMin: 0.4, aMax: 0.7 },
  { count: 130, speed: 0.24, rMin: 0.85, rMax: 1.7, aMin: 0.58, aMax: 1 },
];

/** Deterministisch, damit Server und Client nicht auseinanderlaufen. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function build(): Star[][] {
  const rand = rng(0x0a0f17);
  return DEPTHS.map((d, di) =>
    Array.from({ length: d.count }, () => ({
      x: rand(),
      y: rand(),
      // Quadratische Verteilung: viele schwache, wenige helle Sterne.
      r: d.rMin + Math.pow(rand(), 2) * (d.rMax - d.rMin),
      a: d.aMin + Math.pow(rand(), 1.6) * (d.aMax - d.aMin),
      gold: di === 2 && rand() > 0.945,
    })),
  );
}

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const layers = build();
    let w = 0;
    let h = 0;
    let offset = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const field = h * 2;
      for (let i = 0; i < DEPTHS.length; i++) {
        const shift = offset * DEPTHS[i].speed;
        for (const s of layers[i]) {
          let y = (s.y * field - shift) % field;
          if (y < 0) y += field;
          if (y < -2 || y > h + 2) continue;
          const x = s.x * w;
          ctx.globalAlpha = s.a;
          if (s.gold) {
            // Feines Kreuz statt Punkt — ein Stern, kein Leuchtfleck.
            ctx.fillStyle = "#d4af37";
            const L = s.r * 3;
            ctx.fillRect(x - L, y - 0.35, L * 2, 0.7);
            ctx.fillRect(x - 0.35, y - L, 0.7, L * 2);
          } else {
            ctx.fillStyle = "#f5f6f7";
            ctx.beginPath();
            ctx.arc(x, y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if (prefersReducedMotion()) {
      return () => window.removeEventListener("resize", resize);
    }

    const off = onScroll((damped) => {
      if (Math.abs(damped - offset) < 0.05) return;
      offset = damped;
      draw();
    });

    return () => {
      off();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
