"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Sicherheitsnetz gegen die Totzone am Dokumentende.
 *
 * Der Observer löst absichtlich erst kurz nach dem Eintreten aus (negativer
 * rootMargin unten). Elemente in der letzten Viewport-Höhe des Dokuments
 * können diese Schwelle aber nie erreichen — der Footer wäre dauerhaft
 * unsichtbar geblieben. Ein gemeinsamer Wächter deckt genau diesen Fall ab.
 */
const pending = new Set<Element>();
let guardBound = false;

function bindGuard() {
  if (guardBound) return;
  guardBound = true;
  const sweep = () => {
    const atEnd =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4;
    if (!atEnd) return;
    for (const el of pending) {
      el.classList.add("is-in");
      pending.delete(el);
    }
  };
  window.addEventListener("scroll", sweep, { passive: true });
  window.addEventListener("resize", sweep, { passive: true });
  sweep();
}

/**
 * Setzt `is-in` einmalig, sobald das Element sichtbar wird. Die Animation
 * selbst liegt in CSS-Keyframes mit animation-fill-mode:both — sie kann
 * deshalb nicht halbfertig stehenbleiben, auch wenn Frames wegfallen.
 */
export function Reveal({
  as: Tag = "div",
  kind = "rise",
  delay = 0,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  kind?: "rise" | "fade" | "line";
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    pending.add(el);
    bindGuard();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            pending.delete(e.target);
            io.unobserve(e.target);
          }
        }
      },
      // Kein negativer unterer Rand: in einer Sticky-Bühne sitzt der
      // Fußbereich dauerhaft am unteren Viewport-Rand und könnte eine
      // solche Schwelle nie überschreiten — er bliebe für immer unsichtbar.
      { rootMargin: "0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => {
      pending.delete(el);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={kind}
      className={className}
      style={{ ...style, "--d": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
