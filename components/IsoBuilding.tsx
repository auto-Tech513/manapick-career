/**
 * Isometric building for the occupation-page header (adopted design
 * package, 職業詳細）. One simple geometric building per occupation
 * category: the roof colour and the single feature mark follow the
 * package prompt's examples (士業＝縦格子の窓、医療＝赤十字、
 * 保育＝旗と緑の屋根）. No real buildings, no logos.
 */
const INK = "#172033";

type Variant = { roof: string; mark: React.ReactNode };

const SLITS = (
  <path d="M28 60v18M40 66v18M52 72v18M78 72v18M90 66v18M102 60v18" stroke={INK} strokeWidth="2" />
);
const CROSS = <path d="M58 40h14M65 33v14" stroke="#D93025" strokeWidth="5" />;
const FLAG = (
  <>
    <path d="M40 10l26 16-26 0z" fill="#FFD700" stroke={INK} strokeWidth="2" />
    <path d="M40 10v44" stroke={INK} strokeWidth="2.5" />
  </>
);
const CIRCLE = <circle cx="86" cy="76" r="8" fill="#FFD700" stroke={INK} strokeWidth="2" />;
const DOC = <path d="M30 62h24M30 72h24M30 82h16M76 66h22M76 76h22M76 86h14" stroke={INK} strokeWidth="2" />;
const DASH = <path d="M24 84h82" stroke="#FFD700" strokeWidth="5" strokeDasharray="9 9" />;
const TREE = (
  <>
    <path d="M92 52v-12" stroke={INK} strokeWidth="2.4" />
    <circle cx="92" cy="30" r="10" fill="#9AD0B0" stroke={INK} strokeWidth="2.2" />
  </>
);
const PEAK = <polygon points="92,26 108,44 76,44" fill="#FFD700" stroke={INK} strokeWidth="2" />;

const VARIANTS: Record<string, Variant> = {
  "professional-creative": { roof: "#FFD700", mark: SLITS },
  "medical-health": { roof: "#fff", mark: CROSS },
  "education-childcare": { roof: "#9AD0B0", mark: FLAG },
  "welfare-care": { roof: "#9AD0B0", mark: CROSS },
  "research-engineering": { roof: "#172033", mark: CIRCLE },
  management: { roof: "#172033", mark: CIRCLE },
  security: { roof: "#172033", mark: SLITS },
  office: { roof: "#FFD700", mark: DOC },
  sales: { roof: "#fff", mark: CIRCLE },
  service: { roof: "#FFD700", mark: CIRCLE },
  manufacturing: { roof: "#172033", mark: SLITS },
  construction: { roof: "#FFD700", mark: PEAK },
  transport: { roof: "#fff", mark: DASH },
  "logistics-cleaning": { roof: "#fff", mark: SLITS },
  agriculture: { roof: "#9AD0B0", mark: TREE },
};

export function IsoBuilding({ categoryKey }: { categoryKey: string }) {
  const variant = VARIANTS[categoryKey] ?? { roof: "#FFD700", mark: SLITS };
  return (
    <svg viewBox="0 0 130 120" width="300" height="240" aria-hidden="true">
      <polygon points="65,20 115,45 65,70 15,45" fill={variant.roof} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="15,45 65,70 65,108 15,83" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="65,70 115,45 115,83 65,108" fill="#E8E1C9" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {variant.mark}
    </svg>
  );
}
