"use client";

import { useEffect, useRef } from "react";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";

type Star = {
  x: number; // 0…1 relativ zur Breite
  y: number; // 0…1 relativ zur Feldhöhe
  r: number;
  a: number; // Opazität, konstant — kein Blinken
  gold: boolean;
};

const DEPTHS = [
  { count: 190, speed: 0.055, rMin: 0.35, rMax: 0.7, aMin: 0.16, aMax: 0.34 },
  { count: 120, speed: 0.13, rMin: 0.5, rMax: 0.95, aMin: 0.26, aMax: 0.5 },
  { count: 54, speed: 0.26, rMin: 0.7, rMax: 1.25, aMin: 0.4, aMax: 0.72 },
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
      r: d.rMin + rand() * (d.rMax - d.rMin),
      a: d.aMin + rand() * (d.aMax - d.aMin),
      // Gold ist selten: nur in der vordersten Ebene, und dort kaum.
      gold: di === 2 && rand() > 0.87,
    })),
  );
}

/**
 * Sternenfeld auf Canvas. Drei Ebenen, die sich beim Scrollen unterschiedlich
 * schnell bewegen — daraus entsteht die Tiefe. Keine Schatten, kein Glow,
 * keine Helligkeitsänderung: die Sterne driften nur.
 */
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
    let dpr = 1;
    let offset = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Feldhöhe größer als der Viewport, damit die Ebenen Raum zum Wandern
      // haben; y wird modulo gewrappt.
      const field = h * 2;
      for (let i = 0; i < DEPTHS.length; i++) {
        const speed = DEPTHS[i].speed;
        const shift = offset * speed;
        for (const s of layers[i]) {
          let y = (s.y * field - shift) % field;
          if (y < 0) y += field;
          if (y > h + 2) continue;
          const x = s.x * w;
          ctx.globalAlpha = s.a;
          if (s.gold) {
            ctx.fillStyle = "#d4af37";
            // Feines Kreuz statt Punkt — ein Stern, kein Leuchtfleck.
            const L = s.r * 2.6;
            ctx.fillRect(x - L, y - 0.3, L * 2, 0.6);
            ctx.fillRect(x - 0.3, y - L, 0.6, L * 2);
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
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
