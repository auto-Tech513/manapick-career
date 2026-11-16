"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { stations, stationHref } from "../lib/stations";

const groups: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "職業を探す",
    links: [
      { href: "/all/", label: "職業一覧" },
      { href: "/employers/", label: "企業例のある職業" },
      { href: "/ranking/", label: "人気アクセス" },
      { href: "/skills/", label: "スキルから探す" },
    ],
  },
  {
    title: "くらべる・試算",
    links: [
      { href: "/compare/", label: "職業を比較" },
      { href: "/tools/net-income/", label: "手取りシミュレーター" },
      { href: "/route/", label: "迷ったら入口案内" },
    ],
  },
  {
    title: "読む",
    links: [
      { href: "/guide/", label: "ガイド" },
      { href: "/news/", label: "ニュース" },
      { href: "/research/", label: "データ室" },
    ],
  },
  {
    title: "このサイトについて",
    links: [
      { href: "/shop/", label: "manapi商店" },
      { href: "/about-method/", label: "編集方針" },
      { href: "/faq/", label: "FAQ" },
      { href: "/glossary/", label: "用語集" },
      { href: "/contact/", label: "お問い合わせ" },
    ],
  },
];

/** On the dark network box the politics dot uses the lighter violet from the design. */
const netlDotColor: Record<string, string> = { politics: "#A78BFA" };

/**
 * CE-01 header menu panel: a pill button in the header (and the SP tab
 * bar's メニュー, via the mp-open-menu event) opens a right-side panel
 * with search, the route entry card, four link groups and the network
 * station list. Design: career design-extra CE-01.
 */
export function MenuPanel({ occupationCount }: { occupationCount: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mp-open-menu", onOpen);
    return () => window.removeEventListener("mp-open-menu", onOpen);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [ open ]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="ce-menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} strokeWidth={2.4} aria-hidden="true" />
        <span>メニュー</span>
      </button>
      {open ? (
        <>
          <div className="ce-scrim" onClick={() => setOpen(false)} />
          <aside className="ce-panel" role="dialog" aria-modal="true" aria-label="メニュー">
            <div className="top">
              <span className="lbl">
                <b>MENU</b>メニュー
              </span>
              <button
                ref={closeRef}
                type="button"
                className="x"
                aria-label="メニューを閉じる"
                onClick={() => setOpen(false)}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <form className="ce-sf" action="/all/" method="get" role="search">
              <label className="vh" htmlFor="menu-job-search">職業を検索</label>
              <Search size={20} aria-hidden="true" />
              <input
                id="menu-job-search"
                type="search"
                name="q"
                placeholder="職業名・別名で検索"
              />
            </form>
            <Link className="ce-entry" href="/route/" onClick={() => setOpen(false)}>
              <span className="q">迷ったら</span>
              <b>3つの質問で入口案内</b>
              <span className="ar" aria-hidden="true">→</span>
            </Link>
            <div className="grp">
              {groups.map((group) => (
                <section key={group.title}>
                  <h4>{group.title}</h4>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} onClick={() => setOpen(false)}>
                          {link.href === "/all/"
                            ? `${link.label}（${occupationCount}職業）`
                            : link.label}
                          <span className="ar" aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <div className="netl">
              <h4>MANAPICK NETWORK</h4>
              {stations.map((station) => (
                <a
                  key={station.id}
                  href={stationHref(station, "menu-panel")}
                  aria-current={station.current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <i
                    aria-hidden="true"
                    style={{ "--c": netlDotColor[station.id] ?? station.color } as React.CSSProperties}
                  />
                  <b>{station.name}</b>
                  {station.current ? <em>現在地</em> : null}
                </a>
              ))}
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
