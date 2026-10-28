import { ArrowUpRight } from "lucide-react";
import config from "../content/network-site.json";
import { networkUrl } from "../lib/network-shared";

/** Cross-site section: 学ぶ・選ぶ・証明する・仕事につなぐ. Uses only the four sites' own names, roles and descriptions from network-site.json. */
export function NetworkSites({ heading = "manapickの4サイトで、学びから仕事まで" }: { heading?: string }) {
  return <section className="mp-relations network-sites" aria-label="manapick 4サイト連携">
    <h2>{heading}</h2>
    <p>仕事を知るだけで終わらせず、動画で学び、AIツールを選び、資格で証明し、仕事につなぐ。各サイトは役割ごとに分かれています。</p>
    <ul>{config.sites.map(site => <li key={site.id}>
      <a href={site.id === config.id ? "/" : networkUrl(site.url, config.id, "network-sites")} aria-current={site.id === config.id ? "page" : undefined}>
        <span className={`mp-badge mp-badge--${site.id}`}>{site.short}<small>{site.role}</small></span>
        <strong>{site.name}</strong>
        <small className="network-sites-desc">{site.description}</small>
        {site.id === config.id ? <small className="network-sites-current">いま見ているサイトです</small> : <span className="network-sites-go">サイトへ <ArrowUpRight size={14} aria-hidden="true" /></span>}
      </a>
    </li>)}</ul>
  </section>;
}
