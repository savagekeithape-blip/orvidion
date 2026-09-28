/**
 * Eine einzige rAF-Schleife für die ganze Seite.
 *
 * Kernidee: Das Scrollen selbst wird nicht angetastet. Stattdessen läuft ein
 * zweiter, gedämpfter Wert dem rohen Scroll-Fortschritt weich nach (Lerp pro
 * Frame). Die Animationen folgen diesem gedämpften Wert. Trackpad-Zittern und
 * Wheel-Sprünge verschwinden dadurch vollständig, und Bewegung bekommt Masse
 * statt direkt am Finger zu kleben.
 *
 * Dämpfung ist frame-rate-normalisiert, damit 60 Hz und 120 Hz identisch
 * aussehen. Gelesen wird gebündelt vor dem Schreiben, damit kein Layout-
 * Thrashing entsteht.
 */

// Eine Rad-Rastung sind rund 100px. Bei 0,085 hat die Figur davon nach dem
// ersten Frame schon 10px zurückgelegt — das liest sich als Ruck, nicht als
// Gleiten. Weicher gedämpft verteilt sich dieselbe Rastung auf mehr Frames;
// der Preis ist etwas mehr Nachlauf, und genau der soll hier teuer wirken.
const DAMP = 0.062; // pro 60Hz-Frame angestrebter Anteil der Restdistanz
const EPS = 0.0002; // unter dieser Änderung wird nicht geschrieben

type Target = {
  el: HTMLElement;
  /** Zusätzliche Scroll-Strecke der Sektion in Vielfachen der Viewport-Höhe. */
  raw: number;
  damped: number;
  written: number;
};

type Listener = (damped: number, raw: number) => void;

let targets: Target[] = [];
let listeners: Listener[] = [];
let frame = 0;
let last = 0;
let reduced = false;
let dampedScroll = 0;

function progressOf(el: HTMLElement): number {
  // Ausgeblendete Sektionen (andere Fassung aktiv) tragen nichts bei.
  if (el.offsetHeight === 0 && el.offsetWidth === 0) return 0;
  const rect = el.getBoundingClientRect();
  const travel = el.offsetHeight - window.innerHeight;
  if (travel <= 0) {
    // Sektion ist nicht höher als der Viewport: Fortschritt über Durchlauf.
    const t = (window.innerHeight - rect.top) / (window.innerHeight + el.offsetHeight);
    return Math.min(1, Math.max(0, t));
  }
  return Math.min(1, Math.max(0, -rect.top / travel));
}

function tick(now: number) {
  const dt = last ? Math.min(now - last, 64) : 16.667;
  last = now;

  // Frame-rate-normalisierter Lerp-Faktor.
  const k = reduced ? 1 : 1 - Math.pow(1 - DAMP, dt / 16.667);

  // 1) Lesen — alle Rects in einem Block.
  for (const t of targets) t.raw = progressOf(t.el);
  const scrollRaw = window.scrollY;

  // 2) Rechnen + Schreiben.
  for (const t of targets) {
    t.damped += (t.raw - t.damped) * k;
    // Endwerte exakt erreichen, damit nichts knapp vor 0 oder 1 hängenbleibt.
    if (Math.abs(t.raw - t.damped) < EPS) t.damped = t.raw;
    if (Math.abs(t.damped - t.written) >= EPS) {
      t.written = t.damped;
      t.el.style.setProperty("--p", t.damped.toFixed(5));
    }
  }

  dampedScroll += (scrollRaw - dampedScroll) * k;
  for (const fn of listeners) fn(dampedScroll, scrollRaw);

  frame = requestAnimationFrame(tick);
}

function start() {
  if (frame) return;
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  dampedScroll = window.scrollY;
  last = 0;
  frame = requestAnimationFrame(tick);
}

function stop() {
  if (!frame) return;
  cancelAnimationFrame(frame);
  frame = 0;
}

function sync() {
  // Nach Resize oder beim Registrieren: Startwert ohne Nachlauf setzen,
  // damit beim Laden mitten in der Seite nichts erst hereinfährt.
  for (const t of targets) {
    t.raw = progressOf(t.el);
    t.damped = t.raw;
    t.written = t.raw;
    t.el.style.setProperty("--p", t.raw.toFixed(5));
  }
  dampedScroll = window.scrollY;
}

let bound = false;
function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("resize", sync, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else {
      sync();
      start();
    }
  });
}

/** Registriert eine Sektion. Schreibt `--p` (0…1) als CSS-Variable auf sie. */
export function registerSection(el: HTMLElement): () => void {
  const t: Target = { el, raw: 0, damped: 0, written: -1 };
  targets.push(t);
  bind();
  sync();
  start();
  return () => {
    targets = targets.filter((x) => x !== t);
    if (!targets.length && !listeners.length) stop();
  };
}

/** Abonniert den gedämpften globalen Scroll-Wert (für Parallax im Canvas). */
export function onScroll(fn: Listener): () => void {
  listeners.push(fn);
  bind();
  start();
  return () => {
    listeners = listeners.filter((x) => x !== fn);
    if (!targets.length && !listeners.length) stop();
  };
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
