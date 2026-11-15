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
export function TransferCards({ cards }: { cards: TransferCard[] }) {
  return (
    <div className="xrow">
      {cards.map((card) => {
        const station = stations.find((s) => s.id === card.siteId);
        if (!station) return null;
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
              <span className="k">TRANSFER → {station.name}</span>
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
