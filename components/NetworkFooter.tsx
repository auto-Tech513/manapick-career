import config from "../content/network-site.json";
import { networkUrl } from "../lib/network-shared";

/** AI Footer network links: roles, order and destinations adapted to the career specification. */
export default function NetworkFooter() {
  return <section className="mp-network-footer" aria-label="manapick公式5サイト"><h2>学びを、仕事につなぐ。</h2><nav>{config.sites.map((site,index) => <a key={site.id} href={site.id === config.id ? "/" : networkUrl(site.url, config.id, "footer")} aria-current={site.id === config.id ? "page" : undefined}><span className={`mp-badge mp-badge--${site.id}`}>{String(index+1).padStart(2,"0")} {site.role}</span><strong>{site.name}</strong><small>{site.description}</small></a>)}</nav></section>;
}
