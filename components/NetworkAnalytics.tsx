"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import config from "../content/network-site.json";
import { networkUrl } from "../lib/network-shared";
import { NETWORK_SOURCE_SITE, networkSiteOf } from "../lib/network-links";
const hosts = new Set(config.sites.map(site => new URL(site.url).hostname));
/**
 * 姉妹サイト宛てリンクのクリックを network_click として GA4 に送る。
 * 2026-11-24（決定キュー #74）：7サイト共通の引数（ai #43 と同じ）にそろえた。
 * - 共通の引数：source_site（自サイト）・destination_site（行き先のキー）・destination_path（行き先のパス。クエリは送らない）・placement（置き場所）
 * - placement の値は ai #43 と同じ語彙（rail／header_menu／bottom_sheet／footer_route／transfer_cards／header／footer／content／other）。
 * - 以前から送っていた source_path・destination_host・transport_type はそのまま並行して送る（切り替えの欠測を防ぐ）。
 * - 行き先の判定は lib/network-links.ts（ai #43 と同じホスト一覧。politics・サ印帳を含む）。
 */
const PLACEMENTS: Array<[string, string]> = [
  [".rail", "rail"],
  [".cm-drawer", "header_menu"],
  [".xfer-sheet", "bottom_sheet"],
  [".route-map", "footer_route"],
  [".xrow", "transfer_cards"]
];
function placementOf(anchor: HTMLAnchorElement): string {
  for (const [selector, name] of PLACEMENTS) {
    if (anchor.closest(selector)) return name;
  }
  if (anchor.closest("header")) return "header";
  if (anchor.closest("footer")) return "footer";
  if (anchor.closest("main")) return "content";
  return "other";
}
export default function NetworkAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    const decorate = (anchor: HTMLAnchorElement) => {
      const url = new URL(anchor.href, location.href);
      if (hosts.has(url.hostname) && url.hostname !== location.hostname) anchor.href = networkUrl(url.toString(), config.id, pathname);
    };
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(decorate);
    const click = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      const destinationSite = networkSiteOf(url.toString());
      if (!destinationSite) return;
      decorate(anchor);
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'network_click', { source_site: NETWORK_SOURCE_SITE, destination_site: destinationSite, destination_path: url.pathname, placement: placementOf(anchor), source_path: pathname, destination_host: url.hostname, transport_type: 'beacon' });
    };
    document.addEventListener('click', click, true);
    document.addEventListener('auxclick', click, true);
    return () => { document.removeEventListener('click', click, true); document.removeEventListener('auxclick', click, true); };
  }, [pathname]);
  return null;
}
