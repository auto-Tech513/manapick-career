import map from "../content/network-map-shared.json";
import config from "../content/network-site.json";
import { networkUrl } from "../lib/network-shared";

export function NetworkRelations({ site, path }: { site: string; path: string }) {
  const current = `${map.sites[site as keyof typeof map.sites]}${path}`;
  const groups = map.relations.filter(group => group.nodes.some(node => node.url === current));
  const links = Array.from(new Map(groups.flatMap(group => group.nodes).filter(node => node.site !== site).map(node => [node.url, node])).values());
  const counts: Record<string, number> = {};
  const visibleLinks = links.filter(node => { counts[node.kind] = (counts[node.kind] ?? 0) + 1; return counts[node.kind] <= (node.kind === "career" ? 12 : 3); });
  if (!links.length) return null;
  return <section className="mp-relations"><h2>この内容から、次の学びへ</h2><p>対応する動画・AI・目的・資格・職業の詳細へ進みます。</p><ul>{visibleLinks.map(node => <li key={node.url}><a href={networkUrl(node.url, config.id, path)}><span className={`mp-badge mp-badge--${node.site}`}>{node.kindLabel}</span><strong>{node.label}</strong></a></li>)}</ul></section>;
}
