"use client";
import Link from "next/link";
import NetworkBrand from "./NetworkBrand";


import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight, BarChart3, BookA, BookOpen, BriefcaseBusiness, CircleHelp, Compass, FileText, GitCompareArrows, Home, Mail, Menu, Newspaper, Search, ShoppingBag, Sparkles, Trophy, X, type LucideIcon } from "lucide-react";
import config from "../content/network-site.json";
import { networkUrl } from "../lib/network-shared";

/** Short, page-grounded descriptions for the menu. Wording follows each page's own title. */
const navMeta: Record<string, { icon: LucideIcon; description: string }> = {
  "/all/": { icon: Search, description: "556職業の仕事内容・関連資格と出典付き解説" },
  "/employers/": { icon: BriefcaseBusiness, description: "企業・法人・公的機関の例を確認できた職業の一覧" },
  "/route/": { icon: Compass, description: "キャリア候補の入口案内" },
  "/compare/": { icon: GitCompareArrows, description: "職業を並べて比べる" },
  "/guide/": { icon: BookOpen, description: "職業ガイド" },
  "/news/": { icon: Newspaper, description: "キャリアニュース" },
  "/research/": { icon: BarChart3, description: "キャリアデータ室" },
  "/skills/": { icon: Sparkles, description: "仕事から見るスキル" },
  "/ranking/": { icon: Trophy, description: "人気職業アクセスランキング" },
  "/shop/": { icon: ShoppingBag, description: "学び直し・面接・仕事準備の道具" },
  "/about-method/": { icon: FileText, description: "作成方法・編集方針" },
  "/faq/": { icon: CircleHelp, description: "よくある質問" },
  "/glossary/": { icon: BookA, description: "キャリア用語集" },
  "/contact/": { icon: Mail, description: "訂正・お問い合わせ" },
};
const featureHrefs = ["/all/", "/route/", "/compare/", "/skills/"];
const readHrefs = ["/employers/", "/guide/", "/news/", "/research/", "/ranking/"];
const otherHrefs = ["/shop/", "/about-method/", "/faq/", "/glossary/", "/contact/"];

/** AI SiteHeader: header-inner, brand-mark, main-nav and menu layout, adapted for career without changing the reference repository. */
export default function NetworkHeader({ children }: { children?: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const open = () => { if (menu.current) { menu.current.open = true; menu.current.querySelector<HTMLAnchorElement>("nav a")?.focus(); } };
    const close = (event: KeyboardEvent) => { if (event.key === "Escape" && menu.current?.open) { menu.current.open = false; menu.current.querySelector<HTMLElement>("summary")?.focus(); } };
    window.addEventListener("mp-open-menu", open); document.addEventListener("keydown", close);
    return () => { window.removeEventListener("mp-open-menu", open); document.removeEventListener("keydown", close); };
  }, []);
  const navItem = (href: string) => config.nav.find(item => item.href === href);
  const renderCard = (href: string) => {
    const item = navItem(href); const meta = navMeta[href];
    if (!item || !meta) return null;
    const Icon = meta.icon;
    return <a key={href} href={href} className="mp-menu-card"><span className="mp-menu-card-icon"><Icon size={20} strokeWidth={2.2} aria-hidden="true" /></span><span className="mp-menu-card-text"><strong>{item.label}</strong><small>{meta.description}</small></span></a>;
  };
  const renderRow = (href: string) => {
    const item = navItem(href); const meta = navMeta[href];
    if (!item || !meta) return null;
    const Icon = meta.icon;
    return <a key={href} href={href} className="mp-menu-row"><span className="mp-menu-row-icon"><Icon size={18} strokeWidth={2.2} aria-hidden="true" /></span><span className="mp-menu-row-text"><strong>{item.label}</strong><small>{meta.description}</small></span><ArrowUpRight size={16} aria-hidden="true" className="mp-menu-row-arrow" /></a>;
  };
  return <header className="mp-header"><div className="mp-header-inner">
    <Link href="/" aria-label={`${config.name} トップへ`} prefetch={false}><NetworkBrand /></Link>
    {children ? <div className="mp-header-search">{children}</div> : null}
    <nav className="mp-main-nav" aria-label="主要ナビゲーション">{config.nav.slice(0, 5).map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
    <nav className="mp-switch" aria-label="manapick 5サイト切替">{config.sites.map(site => <a key={site.id} className={`mp-badge mp-badge--${site.id}`} aria-current={site.id === config.id ? "page" : undefined} href={site.id === config.id ? "/" : networkUrl(site.url, config.id, "header")}>{site.short}<small>{site.role}</small></a>)}</nav>
    <details ref={menu} className="mp-menu"><summary aria-label="サイトメニュー"><Menu size={20} strokeWidth={2.4} aria-hidden="true" className="mp-menu-open-icon" /><X size={20} strokeWidth={2.4} aria-hidden="true" className="mp-menu-close-icon" /><span>メニュー</span></summary><nav aria-label="サイトメニュー" onClick={() => { if (menu.current) menu.current.open = false; }}>
      <Link href="/" prefetch={false} className="mp-menu-home"><Home size={18} strokeWidth={2.2} aria-hidden="true" /><span><strong>トップ</strong><small>manapick career の入口</small></span></Link>
      <p className="mp-menu-label" id="mp-menu-search-label">職業を調べる</p>
      <div className="mp-menu-cards" role="group" aria-labelledby="mp-menu-search-label">{featureHrefs.map(renderCard)}</div>
      <p className="mp-menu-label" id="mp-menu-read-label">読む・知る</p>
      <div className="mp-menu-rows" role="group" aria-labelledby="mp-menu-read-label">{readHrefs.map(renderRow)}</div>
      <p className="mp-menu-label" id="mp-menu-other-label">その他</p>
      <div className="mp-menu-rows" role="group" aria-labelledby="mp-menu-other-label">{otherHrefs.map(renderRow)}</div>
      <p className="mp-menu-label" id="mp-menu-sites-label">学ぶ・選ぶ・証明する・仕事につなぐ・企業を読む</p>
      <div className="mp-menu-sites" role="group" aria-labelledby="mp-menu-sites-label">{config.sites.map(site => <a key={site.id} href={site.id === config.id ? "/" : networkUrl(site.url, config.id, "menu")} className="mp-menu-site" aria-current={site.id === config.id ? "page" : undefined}><span className={`mp-badge mp-badge--${site.id}`}>{site.short}</span><span className="mp-menu-site-text"><strong>{site.name}</strong><small>{site.role} — {site.description}</small></span>{site.id === config.id ? null : <ArrowUpRight size={16} aria-hidden="true" className="mp-menu-row-arrow" />}</a>)}</div>
    </nav></details>
  </div></header>;
}
