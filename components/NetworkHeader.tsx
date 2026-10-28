"use client";
import Link from "next/link";
import NetworkBrand from "./NetworkBrand";


import { useEffect, useRef, type ReactNode } from "react";
import config from "../content/network-site.json";
import { networkUrl } from "../lib/network-shared";

/** AI SiteHeader: header-inner, brand-mark, main-nav and menu layout, adapted for career without changing the reference repository. */
export default function NetworkHeader({ children }: { children?: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const open = () => { if (menu.current) { menu.current.open = true; menu.current.querySelector<HTMLAnchorElement>("nav a")?.focus(); } };
    const close = (event: KeyboardEvent) => { if (event.key === "Escape" && menu.current?.open) { menu.current.open = false; menu.current.querySelector<HTMLElement>("summary")?.focus(); } };
    window.addEventListener("mp-open-menu", open); document.addEventListener("keydown", close);
    return () => { window.removeEventListener("mp-open-menu", open); document.removeEventListener("keydown", close); };
  }, []);
  return <header className="mp-header"><div className="mp-header-inner">
    <Link href="/" aria-label={`${config.name} トップへ`} prefetch={false}><NetworkBrand /></Link>
    {children ? <div className="mp-header-search">{children}</div> : null}
    <nav className="mp-main-nav" aria-label="主要ナビゲーション">{config.nav.slice(0, 5).map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
    <nav className="mp-switch" aria-label="manapick 4サイト切替">{config.sites.map(site => <a key={site.id} className={`mp-badge mp-badge--${site.id}`} aria-current={site.id === config.id ? "page" : undefined} href={site.id === config.id ? "/" : networkUrl(site.url, config.id, "header")}>{site.short}<small>{site.role}</small></a>)}</nav>
    <details ref={menu} className="mp-menu"><summary aria-label="サイトメニュー">メニュー</summary><nav aria-label="サイトメニュー" onClick={() => { if (menu.current) menu.current.open = false; }}><Link href="/" prefetch={false}>トップへ戻る</Link>{config.nav.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}<strong>学ぶ・選ぶ・証明する・仕事につなぐ</strong>{config.sites.map(site => <a key={site.id} href={site.id === config.id ? "/" : networkUrl(site.url, config.id, "menu")}>{site.name} — {site.role}</a>)}</nav></details>
  </div></header>;
}
