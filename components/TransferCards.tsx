import { ChevronRight } from "lucide-react";
import { stations } from "../lib/stations";

export type TransferCard = {
  siteId: string;
  title: string;
  description: string;
  href: string;
};

/**
 * Transfer cards （乗り換え）: the shared network component placed at
 * the end of a page — one card per sister site, always pointing at an
 * individual page that matches the current content, never at a sister
 * site's top page.
 */
/**
 * Kicker labels on the top page follow the top page's own mock
 * (manapick-career_参照モック): license and company drop the
 * "manapick" prefix there, while the shared templates (T2) keep the
 * full station names.
 */
const TOP_KICKER_LABELS: Record<string, string> = {
  manapick: "manapick",
  ai: "manapick AI",
  license: "license",
  company: "company",
  career: "career",
  politics: "politics",
};

export function TransferCards({
  cards,
  labelStyle = "full",
}: {
  cards: TransferCard[];
  labelStyle?: "full" | "top";
}) {
  return (
    <div className="xrow">
      {cards.map((card) => {
        const station = stations.find((s) => s.id === card.siteId);
        if (!station) return null;
        const kickerName =
          labelStyle === "top"
            ? (TOP_KICKER_LABELS[station.id] ?? station.name)
            : station.name;
        return (
          <a
            key={card.siteId}
            className="xfer"
            data-site={station.id}
            style={{ "--c": station.color } as React.CSSProperties}
            href={card.href}
          >
            <span className="stn" style={{ "--c": station.color } as React.CSSProperties}>
              {station.code}
            </span>
            <span>
              <span className="k">TRANSFER → {kickerName}</span>
              <span className="t">{card.title}</span>
              <span className="d">{card.description}</span>
            </span>
            <span className="go" aria-hidden="true">
              <ChevronRight />
            </span>
          </a>
        );
      })}
    </div>
  );
}
