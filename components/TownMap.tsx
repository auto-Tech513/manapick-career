/**
 * Isometric "town of jobs" illustration for the career top hero.
 * Ported from the adopted design package's reference mock: simple
 * geometric boxes, roads with a yellow centre line and round trees,
 * generated deterministically as inline SVG (no image files, no real
 * buildings or logos).
 */
const INK = "#172033";

type Pt = [number, number];

function iso(x: number, y: number, z: number): Pt {
  return [450 + (x - y) * 0.866 * 30, 120 + (x + y) * 0.5 * 30 - z * 30];
}

function points(pts: Pt[]): string {
  return pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

type Shape =
  | { kind: "poly"; pts: Pt[]; fill: string; sw?: number }
  | { kind: "line"; a: Pt; b: Pt }
  | { kind: "tree"; x: number; y: number };

function buildShapes(): Shape[] {
  const shapes: Shape[] = [];
  const poly = (pts: Pt[], fill: string, sw = 2.4) =>
    shapes.push({ kind: "poly", pts, fill, sw });
  const tile = (x: number, y: number, w: number, d: number, fill: string) =>
    poly([iso(x, y, 0), iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x, y + d, 0)], fill, 2);
  const box = (
    x: number, y: number, w: number, d: number, h: number,
    top: string, left = "#fff", right = "#E8E1C9",
  ) => {
    poly([iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)], left);
    poly([iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)], right);
    poly([iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)], top);
  };
  const dash = (a: [number, number, number], b: [number, number, number]) =>
    shapes.push({ kind: "line", a: iso(...a), b: iso(...b) });
  const tree = (x: number, y: number) => shapes.push({ kind: "tree", x, y });

  tile(-2, -2, 18, 18, "#F3EEDD");
  tile(-2, 6, 18, 2, "#FFFFFF");
  tile(6, -2, 2, 18, "#FFFFFF");
  dash([-2, 7, 0], [16, 7, 0]);
  dash([7, -2, 0], [7, 16, 0]);
  box(0, 0, 4, 4, 4, "#FFD700");
  box(1, 1, 2, 2, 6, "#fff");
  box(9, 0, 5, 3, 3, "#fff");
  poly([iso(9, 0, 3), iso(14, 0, 3), iso(11.5, 1.5, 5)], "#FFD700");
  box(9, 9, 3, 5, 2.5, "#9AD0B0");
  box(12.5, 10, 2.5, 3, 5, "#172033", "#fff", "#E8E1C9");
  box(0, 9, 4, 3, 2, "#fff");
  box(1, 12.5, 3, 2.5, 3.5, "#FFD700");
  tree(4.8, 4.8); tree(15, 4.5); tree(-1, 13); tree(5, 15); tree(15, 15); tree(8.6, 12.5); tree(4.7, -1);
  return shapes;
}

const SHAPES = buildShapes();

export function TownMap() {
  return (
    <svg viewBox="0 0 900 780" role="img" aria-label="仕事が建物として建ち並ぶ、しごとの街の地図イラスト">
      {SHAPES.map((shape, index) => {
        if (shape.kind === "poly") {
          return (
            <polygon
              key={index}
              points={points(shape.pts)}
              fill={shape.fill}
              stroke={INK}
              strokeWidth={shape.sw ?? 2.4}
              strokeLinejoin="round"
            />
          );
        }
        if (shape.kind === "line") {
          return (
            <line
              key={index}
              x1={shape.a[0]} y1={shape.a[1]} x2={shape.b[0]} y2={shape.b[1]}
              stroke="#FFD700" strokeWidth={5} strokeDasharray="10 10"
            />
          );
        }
        const [cx, cy] = iso(shape.x, shape.y, 0);
        return (
          <g key={index}>
            <path d={`M${cx} ${cy}v-16`} stroke={INK} strokeWidth={2.4} />
            <circle cx={cx} cy={cy - 26} r={13} fill="#9AD0B0" stroke={INK} strokeWidth={2.4} />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Small isometric vignette used inside the white "photo" frames of the
 * hero. Career holds no rights-cleared workplace photographs, so the
 * frames carry illustrations instead of photographs.
 */
export function TownScene({ variant }: { variant: "office" | "care" | "it" }) {
  const top = variant === "office" ? "#FFD700" : variant === "care" ? "#9AD0B0" : "#172033";
  const mark =
    variant === "office" ? (
      <path d="M52 62v16M64 68v16M76 74v16" stroke={INK} strokeWidth={2.4} />
    ) : variant === "care" ? (
      <path d="M60 58h10M65 53v10" stroke="#D93025" strokeWidth={4} />
    ) : (
      <circle cx={88} cy={76} r={7} fill="#FFD700" stroke={INK} strokeWidth={2} />
    );
  return (
    <svg viewBox="0 0 130 120" aria-hidden="true">
      <polygon points="65,22 115,47 65,72 15,47" fill={top} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points="15,47 65,72 65,106 15,81" fill="#fff" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points="65,72 115,47 115,81 65,106" fill="#E8E1C9" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {mark}
    </svg>
  );
}
