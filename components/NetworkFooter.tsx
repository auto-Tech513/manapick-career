import Link from "next/link";
import { stations, stationHref } from "../lib/stations";
import { NewsletterForm } from "./NewsletterForm";

/**
 * Footer of the manapick network: the newsletter form, then the route
 * map （学びの路線図） — five stations joined by the line-colour
 * gradient, the current station filled. Station data comes from
 * lib/stations (content/network-site.json), so a sixth station is a
 * data-only addition.
 */
export default function NetworkFooter() {
  return (
    <>
      <section className="mp-newsletter-band" aria-label="manapick メルマガ登録">
        <NewsletterForm context="footer" />
      </section>
      <footer className="route" aria-label="manapick公式6サイト">
        <p className="route-kick">MANAPICK NETWORK</p>
        <p className="route-lead">
          <span className="nw">学びは、</span>
          <span className="nw">6つの駅でつながっています。</span>
        </p>
        <div className="route-map">
          {stations.map((station) => (
            <a
              key={station.id}
              className={`route-st${station.current ? " on" : ""}`}
              style={{ "--c": station.color } as React.CSSProperties}
              href={stationHref(station, "footer")}
              aria-current={station.current ? "page" : undefined}
            >
              <i aria-hidden="true" />
              <em>{station.code}</em>
              <b>{station.name}</b>
              <span>
                {station.role} — {station.description}
              </span>
            </a>
          ))}
        </div>
        <div className="route-legal">
          <Link href="/about-method/">作成方法</Link>
          <Link href="/operator/">運営者</Link>
          <Link href="/privacy/">プライバシー</Link>
          <Link href="/affiliate/">広告・PR</Link>
          <span>© manapick career</span>
        </div>
      </footer>
    </>
  );
}
