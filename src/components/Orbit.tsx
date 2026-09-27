/**
 * Das Orbitalsystem — das wiederkehrende Bild der Marke.
 *
 * Geometrie und Verläufe liegen hier an einer Stelle, damit Hero, Kernszene
 * und Ausklang dasselbe Objekt zeigen statt drei ähnliche. Die Bahnen werden
 * mit einem Verlauf gezeichnet, nicht mit gleichmäßiger Deckkraft: eine
 * Haarlinie, die zu den Rändern hin ausläuft, liest sich als Licht auf einer
 * Bahn — eine durchgehend gleich helle wirkt wie ein Drahtmodell.
 */

export const C = 500; // Mittelpunkt im viewBox 1000×1000

export type Orbit = {
  rx: number;
  ry: number;
  rot: number;
  /** Winkel in Radiant, an denen Knoten auf dieser Bahn sitzen. */
  at: number[];
  gold?: boolean;
};

/**
 * Die Winkel sind so gewählt, dass die acht Knoten rund um die Mitte
 * gleichmäßig alle 45° liegen. Vorher standen drei von ihnen innerhalb von
 * 40° beieinander, während zwei Viertel der Figur leer blieben — das sah
 * unausgewogen aus, und die Beschriftungen überlagerten sich zwangsläufig.
 */
export const ORBITS: Orbit[] = [
  { rx: 442, ry: 152, rot: -18, at: [1.79, 4.64, 5.73] },
  { rx: 328, ry: 286, rot: 26, at: [2.102, 4.545, 6.064] },
  { rx: 206, ry: 96, rot: -52, at: [1.757, 4.517], gold: true },
];

/** Punkt auf einer gedrehten Ellipse. */
export function pointOn(o: Orbit, t: number) {
  const th = (o.rot * Math.PI) / 180;
  const cx = Math.cos(t) * o.rx;
  const cy = Math.sin(t) * o.ry;
  return {
    x: C + cx * Math.cos(th) - cy * Math.sin(th),
    y: C + cx * Math.sin(th) + cy * Math.cos(th),
  };
}

export type Node = {
  key: string;
  x: number;
  y: number;
  orbit: number;
  gold: boolean;
};

export const NODES: Node[] = ORBITS.flatMap((o, oi) =>
  o.at.map((t, ti) => {
    const p = pointOn(o, t);
    return { key: `${oi}-${ti}`, x: p.x, y: p.y, orbit: oi, gold: !!o.gold };
  }),
);

/** Verläufe und der Kernschein. `id` trennt mehrere Instanzen auf einer Seite. */
export function OrbitDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-w`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f5f6f7" stopOpacity="0.04" />
        <stop offset="38%" stopColor="#f5f6f7" stopOpacity="0.34" />
        <stop offset="62%" stopColor="#f5f6f7" stopOpacity="0.34" />
        <stop offset="100%" stopColor="#f5f6f7" stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.1" />
        <stop offset="42%" stopColor="#d4af37" stopOpacity="0.72" />
        <stop offset="58%" stopColor="#d4af37" stopOpacity="0.72" />
        <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1" />
      </linearGradient>
      {/* Der Kern ist ein Stern, kein Leuchtfleck: ein einziger weicher
          Verlauf, nirgends sonst auf der Seite. */}
      <radialGradient id={`${id}-core`}>
        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.26" />
        <stop offset="45%" stopColor="#d4af37" stopOpacity="0.09" />
        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Der Kern: Schein, Ring, Punkt. */
export function OrbitCore({ id, r = 6 }: { id: string; r?: number }) {
  return (
    <g>
      <circle cx={C} cy={C} r="118" fill={`url(#${id}-core)`} />
      <circle
        cx={C}
        cy={C}
        r="26"
        className="hair-thin"
        stroke="#d4af37"
        strokeOpacity="0.5"
      />
      <circle cx={C} cy={C} r={r} fill="#d4af37" />
    </g>
  );
}

/**
 * Das fertige System. `spin` lässt es sehr langsam rotieren — eine Umdrehung
 * in vier Minuten, an der Wahrnehmungsgrenze.
 */
export function OrbitSystem({
  id,
  spin = false,
  className = "",
}: {
  id: string;
  spin?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true">
      <OrbitDefs id={id} />
      <g
        className={spin ? "spin motion-safe:animate-[slow-spin_240s_linear_infinite]" : ""}
        style={{ transformOrigin: "500px 500px" }}
      >
        {ORBITS.map((o, i) => (
          <ellipse
            key={i}
            cx={C}
            cy={C}
            rx={o.rx}
            ry={o.ry}
            className="hair"
            stroke={`url(#${id}-${o.gold ? "g" : "w"})`}
            transform={`rotate(${o.rot} ${C} ${C})`}
          />
        ))}
        {NODES.map((n) => (
          <g key={n.key}>
            {n.gold && (
              <circle
                cx={n.x}
                cy={n.y}
                r="11"
                className="hair-thin"
                stroke="#d4af37"
                strokeOpacity="0.55"
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.gold ? 3.8 : 3.2}
              fill={n.gold ? "#d4af37" : "#f5f6f7"}
              fillOpacity={n.gold ? 1 : 0.9}
            />
          </g>
        ))}
      </g>
      <OrbitCore id={id} />
    </svg>
  );
}
