import { stations, stationHref } from "../lib/stations";

/**
 * Network rail: the shared top strip of the manapick network
 * （学びの路線図）. Six stations on one line; the current station is
 * filled with its line colour and carries the 現在地 chip.
 */
export function NetworkRail() {
  return (
    <div className="rail google-anno-skip">
      <span className="rail-lbl">manapick network</span>
      <nav className="rail-line" aria-label="manapick 6サイト">
        {stations.map((station) => (
          <a
            key={station.id}
            data-site={station.id}
            className={`rail-s${station.current ? " on" : ""}`}
            style={{ "--c": station.color } as React.CSSProperties}
            href={stationHref(station, "rail")}
            aria-label={station.current ? `${station.name} ${station.role} 現在地` : `${station.name} ${station.role}`}
            aria-current={station.current ? "page" : undefined}
          >
            <i aria-hidden="true" />
            <span className="rail-s-name">
              {station.short} <span className="rail-s-role">{station.role}</span>
            </span>
            {station.current ? <b>現在地</b> : null}
          </a>
        ))}
      </nav>
    </div>
  );
}
