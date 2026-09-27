/**
 * Atmosphäre.
 *
 * Vorher lag alles auf reinem #0A0F17 — das wirkt platt, egal wie gut die
 * Typografie sitzt. Zwei sehr weiche Verläufe in der zweiten Markenfarbe
 * geben der Fläche Volumen, eine Randabdunklung fasst sie ein. Beides sind
 * dieselben fünf Farben in unterschiedlicher Deckkraft, keine Schatten.
 */
export function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(70rem 50rem at 78% 8%, color-mix(in srgb, var(--color-ink-2) 85%, transparent), transparent 62%)",
            "radial-gradient(60rem 46rem at 12% 74%, color-mix(in srgb, var(--color-ink-2) 58%, transparent), transparent 60%)",
          ].join(","),
        }}
      />
      {/* Randabdunklung: hält den Blick in der Mitte. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 50% 45%, transparent 42%, var(--color-ink) 100%)",
        }}
      />
    </div>
  );
}
