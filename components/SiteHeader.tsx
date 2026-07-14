"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BookOpenText,
  BriefcaseBusiness,
  Compass,
  FileCheck2,
  GitCompareArrows,
  GraduationCap,
  Home,
  Info,
  Menu,
  Newspaper,
  ScrollText,
  Search,
  ShoppingBag,
  Trophy,
  X,
} from "lucide-react";
import { Brand } from "./Brand";

type NavItem = { href: string; label: string; description: string; icon: typeof Search };

const primary: NavItem[] = [
  { href: "/all/", label: "職業を探す", description: "公開中の職業を一覧", icon: Search },
  { href: "/route/", label: "入口案内", description: "3つの質問から候補へ", icon: Compass },
  { href: "/compare/", label: "比較", description: "仕事内容と学び方を比較", icon: GitCompareArrows },
  { href: "/guide/", label: "ガイド", description: "職業情報の読み方", icon: BookOpenText },
  { href: "/news/", label: "ニュース", description: "雇用・採用・学び直し", icon: Newspaper },
  { href: "/research/", label: "データ室", description: "統計の意味と限界", icon: BarChart3 },
  { href: "/shop/", label: "商店", description: "学び・面接・仕事準備の道具", icon: ShoppingBag },
];

const support: NavItem[] = [
  { href: "/ranking/", label: "人気アクセス", description: "公式の関心順位", icon: Trophy },
  { href: "/skills/", label: "スキル", description: "入口スキルから探す", icon: ScrollText },
  { href: "/glossary/", label: "用語集", description: "職業用語を確認", icon: BookOpenText },
  { href: "/about-method/", label: "編集方針", description: "出典と公開基準", icon: FileCheck2 },
  { href: "/faq/", label: "FAQ", description: "できることを確認", icon: Info },
];

const drawerGroups: Array<{ label: string; items: NavItem[] }> = [
  { label: "仕事を調べる", items: primary.slice(0, 3).concat(support.slice(0, 2)) },
  { label: "読む・確認する", items: primary.slice(3).concat(support.slice(2)) },
];

const network = [
  { href: "https://manapick.app/", label: "manapick", description: "動画で学ぶ", tone: "blue", icon: GraduationCap },
  { href: "https://ai.manapick.app/", label: "manapick AI", description: "仕事に使うAIを選ぶ", tone: "red", icon: Bot },
  { href: "https://license.manapick.app/", label: "manapick license", description: "資格・検定を確認", tone: "green", icon: BadgeCheck },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === "Tab") {
        const focusable = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return <>
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="primary-nav" aria-label="主要ナビゲーション">
          {primary.map((item) => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <nav className="network-nav" aria-label="manapick姉妹サイト">
          {network.map((item) => <a key={item.href} className={`network-pill ${item.tone}`} href={item.href} target="_blank" rel="noopener noreferrer"><span className="network-label">{item.label}</span><ArrowUpRight aria-hidden="true" /></a>)}
        </nav>
        <button ref={toggleRef} type="button" className="menu-toggle" aria-label={open ? "メニューを閉じる" : "メニューを開く"} aria-controls="site-menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>

    <button className={`menu-overlay${open ? " is-open" : ""}`} type="button" aria-label="メニューを閉じる" aria-hidden={!open} disabled={!open} tabIndex={open ? 0 : -1} onClick={close} />
    <nav ref={drawerRef} id="site-menu" className={`menu-drawer${open ? " is-open" : ""}`} aria-label="サイトメニュー" aria-hidden={!open} inert={!open}>
      <div className="menu-drawer-head">
        <span className="menu-drawer-icon" aria-hidden="true"><BriefcaseBusiness /></span>
        <div><strong>manapick career</strong><small>仕事内容から、学びの入口へ</small></div>
        <button ref={closeRef} type="button" className="menu-close" aria-label="メニューを閉じる" onClick={close}><X aria-hidden="true" /></button>
      </div>
      <Link className="menu-home" href="/" onClick={close}><Home aria-hidden="true" />トップへ戻る</Link>
      {drawerGroups.map((group) => <div className="menu-group" key={group.label}>
        <p className="menu-heading">{group.label}</p>
        <div className="menu-link-grid">
          {group.items.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={close}><Icon aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.description}</small></span></Link>; })}
        </div>
      </div>)}
      <p className="menu-heading">学びにつなぐ</p>
      <div className="menu-network-grid">
        {network.map((item) => { const Icon = item.icon; return <a key={item.href} className={item.tone} href={item.href} target="_blank" rel="noopener noreferrer" onClick={close}><Icon aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowUpRight aria-hidden="true" /></a>; })}
      </div>
      <div className="menu-policy"><BadgeCheck aria-hidden="true" /><p><strong>順位や適性を断定しません</strong><br />仕事内容・入口・注意点を公式情報から整理します。</p></div>
    </nav>
  </>;
}
