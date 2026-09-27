/**
 * Atmosphäre.
 *
 * Bewusst sehr zurückhaltend: zwei kaum wahrnehmbare Verläufe in der zweiten
 * Markenfarbe und eine weiche Randabdunklung. Eine kräftigere Fassung wirkte
 * zu sehr nach Leuchten — die Galaxie soll ruhig bleiben, die Tiefe kommt aus
 * dem Sternenfeld und der Parallaxe, nicht aus dem Hintergrund.
 */
export function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(64rem 46rem at 78% 6%, color-mix(in srgb, var(--color-ink-2) 30%, transparent), transparent 66%)",
            "radial-gradient(56rem 42rem at 10% 78%, color-mix(in srgb, var(--color-ink-2) 18%, transparent), transparent 64%)",
          ].join(","),
        }}
      />
      {/* Randabdunklung: hält den Blick in der Mitte. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(130% 100% at 50% 45%, transparent 52%, var(--color-ink) 100%)",
        }}
      />
    </div>
  );
}
