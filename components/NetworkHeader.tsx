"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NetworkBrand from "./NetworkBrand";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import config from "../content/network-site.json";
import { currentMenuItem, menuSections } from "../lib/menu";
import { stations, stationHref } from "../lib/stations";
import { MenuSearch } from "./MenuSearch";
import { PhraseText } from "./PhraseTitle";

/**
 * career のヘッダーとサイトメニュー。メニューは career のデザイン言語
 * （クリーム地・黄色・濃紺の太い線・角丸）で、番号付きの区分、各項目の短い説明、
 * 現在地、検索（候補つき）、姉妹サイトへの乗り換えをまとめる。
 */
export default function NetworkHeader({ children }: { children?: ReactNode }) {
  const pathname = usePathname() ?? "/";
  // 開いたときのパスを持ち、ページを移ったら自動で閉じた扱いにする
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = useCallback((value: boolean) => setOpenedAt(value ? pathname : null), [pathname]);
  const here = currentMenuItem(pathname);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  // SP の下部バーの「メニュー」から開いたときは、閉じた後にそのボタンへフォーカスを戻す（見えないときはヘッダーのボタンへ）
  const opener = useRef<HTMLElement | null>(null);
  const close = useCallback((restoreFocus = true) => {
    setOpenedAt(null);
    const from = opener.current;
    opener.current = null;
    if (restoreFocus) requestAnimationFrame(() => (from && document.contains(from) && from.getClientRects().length > 0 ? from : button.current)?.focus());
  }, []);
  useEffect(() => {
    const openMenu = () => { opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null; setOpen(true); };
    window.addEventListener("mp-open-menu", openMenu);
    return () => window.removeEventListener("mp-open-menu", openMenu);
  }, [setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab" && panel.current) {
        const focusable = [...panel.current.querySelectorAll<HTMLElement>("a[href],button,input")].filter((el) => !el.hasAttribute("disabled"));
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    document.body.classList.add("cm-lock");
    panel.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); html.style.overflow = previous; document.body.classList.remove("cm-lock"); };
  }, [open, close]);

  const mainNavHrefs = ["/all/", "/employers/", "/compare/", "/guide/", "/research/"];
  const navItem = (href: string) => config.nav.find((item) => item.href === href);
  const isCurrent = (href: string) => here?.href === href;
  return <>
    <header className="mp-header google-anno-skip"><div className="mp-header-inner">
      <Link href="/" prefetch={false}><NetworkBrand /><span className="sr-only"> トップへ</span></Link>
      {children ? <div className="mp-header-search">{children}</div> : null}
      <nav className="mp-main-nav" aria-label="主要ナビゲーション">{mainNavHrefs.map((href) => { const item = navItem(href); return item ? <a key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined}>{item.label}</a> : null; })}</nav>
      <div className="mp-header-actions"><a className="hd-btn" href="/tools/net-income/">手取りシミュレーター</a><a className="hd-btn y" href="/route/">迷ったら入口案内</a></div>
      <button ref={button} type="button" className={`mp-menu-btn${open ? " on" : ""}`} aria-expanded={open} aria-controls="site-menu" aria-haspopup="dialog" onClick={() => { if (open) close(); else { opener.current = null; setOpen(true); } }}>
        {open ? <X size={20} strokeWidth={2.4} aria-hidden="true" /> : <Menu size={20} strokeWidth={2.4} aria-hidden="true" />}<span>メニュー</span>
      </button>
    </div></header>
    {open ? <>
      <div className="cm-scrim" aria-hidden="true" onClick={() => close()} />
      <aside ref={panel} id="site-menu" className="cm-drawer google-anno-skip" role="dialog" aria-modal="true" aria-labelledby="cm-title" tabIndex={-1}>
        <div className="cm-top">
          <p id="cm-title"><span className="code">MENU</span><b>メニュー</b></p>
          <button type="button" className="cm-close" onClick={() => close()} aria-label="メニューを閉じる"><X aria-hidden="true" /></button>
        </div>
        <div className="cm-body">
          <p className="cm-here"><span className="stn" aria-hidden="true">CA</span><span><small>現在地</small><b>{here ? `${here.section.title} ／ ${here.label}` : "manapick career"}</b></span></p>
          <MenuSearch onNavigate={() => close(false)} />
          {menuSections.map((section) => (
            <section key={section.key} className={`cm-sec cm-sec--${section.key}`} aria-labelledby={`cm-sec-${section.key}`}>
              <h2 id={`cm-sec-${section.key}`}><span className="cm-no num">{section.no}</span>{section.title}</h2>
              <ul>
                {section.items.map((item) => {
                  const current = isCurrent(item.href);
                  return <li key={item.href}>
                    <Link href={item.href} prefetch={false} aria-current={current ? "page" : undefined} onClick={() => close(false)}>
                      <span className="cm-t"><b>{item.label}</b><small className="phrase-breaks"><PhraseText text={item.description} /></small></span>
                      {current ? <em className="cm-cur">現在地</em> : <span className="cm-go" aria-hidden="true"><ArrowRight /></span>}
                    </Link>
                  </li>;
                })}
              </ul>
            </section>
          ))}
          <section className="cm-net" aria-labelledby="cm-net-title">
            <h2 id="cm-net-title"><span className="cm-no num">05</span>姉妹サイトへ乗り換える</h2>
            <p className="cm-net-lead phrase-breaks"><PhraseText text={`${stations.map((station) => station.role).join("・")}の${stations.length}サイトがつながっています。`} /></p>
            <ul>
              {stations.map((station) => (
                <li key={station.id}>
                  <a href={stationHref(station, "menu")} aria-current={station.current ? "page" : undefined} onClick={() => close(false)}>
                    <i aria-hidden="true" style={{ "--c": station.color } as React.CSSProperties} />
                    <span className="cm-t"><b>{station.name}</b><small className="phrase-breaks"><PhraseText text={`${station.role} — ${station.description}`} /></small></span>
                    {station.current ? <em className="cm-cur">現在地</em> : <span className="cm-go" aria-hidden="true"><ArrowUpRight /></span>}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </> : null}
  </>;
}
