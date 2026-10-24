"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import config from "../content/network-site.json";
import { networkUrl } from "../lib/network-shared";
const hosts = new Set(config.sites.map(site => new URL(site.url).hostname));
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
      if (!hosts.has(url.hostname) || url.hostname === location.hostname) return;
      decorate(anchor);
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'network_click', { source_site: config.id, source_path: pathname, destination_host: url.hostname, destination_path: url.pathname, transport_type: 'beacon' });
    };
    document.addEventListener('click', click, true);
    document.addEventListener('auxclick', click, true);
    return () => { document.removeEventListener('click', click, true); document.removeEventListener('auxclick', click, true); };
  }, [pathname]);
  return null;
}
