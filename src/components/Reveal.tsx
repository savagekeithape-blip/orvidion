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
/** Elemente, die beim Freischalten mehr tun als is-in zu setzen. */
const lighters = new WeakMap<Element, () => void>();
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
      const fn = lighters.get(el);
      if (fn) fn();
      else el.classList.add("is-in");
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

/**
 * Wie `Reveal`, schaltet aber zusätzlich alle `[data-reveal]` darunter frei.
 *
 * Nötig für SVG: dort sollen einzelne Linien und Punkte gestaffelt erscheinen,
 * aber ein eigener Observer je Linie wäre Unfug. Ohne das bleiben die Kinder
 * für immer auf ihrem Startwert stehen — genau das ist der Figur im Ablauf
 * passiert.
 */
export function RevealGroup({
  as: Tag = "div",
  delay = 0,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const light = () => {
      el.classList.add("is-in");
      for (const child of el.querySelectorAll("[data-reveal]")) {
        child.classList.add("is-in");
      }
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      light();
      return;
    }
    pending.add(el);
    lighters.set(el, light);
    bindGuard();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            light();
            pending.delete(el);
            io.unobserve(e.target);
          }
        }
      },
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
      data-reveal="fade"
      className={className}
      style={{ ...style, "--d": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
