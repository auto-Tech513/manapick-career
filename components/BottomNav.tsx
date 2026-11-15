"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, House, Menu, Search, Star, X } from "lucide-react";
import { stations, stationHref } from "../lib/stations";

const links = [
  { href: "/", label: "ホーム", icon: House },
  { href: "/all/", label: "職業", icon: Search },
  { href: "/ranking/", label: "人気", icon: Star },
];

/**
 * SP bottom tab bar (manapick network shared design): a floating black
 * bar — ホーム / 職業 / 人気（yellow star) / 乗り換え / メニュー.
 * 乗り換え opens a bottom sheet with the five-station route map;
 * メニュー opens the site menu in the header (mp-open-menu event).
 */
export function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [sheetOpen]);

  return (
    <>
      <nav className="spbar" aria-label="スマホ主要ナビゲーション">
        {links.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "on" : undefined}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                aria-hidden="true"
                className={item.label === "人気" ? "spbar-star" : undefined}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={sheetOpen ? "on" : undefined}
          aria-expanded={sheetOpen}
          aria-haspopup="dialog"
          onClick={() => setSheetOpen((open) => !open)}
        >
          <ArrowLeftRight aria-hidden="true" />
          <span>乗り換え</span>
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("mp-open-menu"))}
        >
          <Menu aria-hidden="true" />
          <span>メニュー</span>
        </button>
      </nav>
      {sheetOpen ? (
        <div
          className="xfer-sheet-backdrop"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="xfer-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="manapick 6サイトへの乗り換え"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="xfer-sheet-head">
              <p>
                <span className="xfer-sheet-kicker">MANAPICK NETWORK</span>
                <span className="nw">学びは、</span>
                <span className="nw">6つの駅でつながっています。</span>
              </p>
              <button
                type="button"
                aria-label="乗り換え案内を閉じる"
                onClick={() => setSheetOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <ul className="xfer-sheet-list">
              {stations.map((station) => (
                <li key={station.id}>
                  <a
                    href={stationHref(station, "tabbar")}
                    aria-current={station.current ? "page" : undefined}
                    onClick={() => setSheetOpen(false)}
                  >
                    <i
                      aria-hidden="true"
                      style={{ "--c": station.color } as React.CSSProperties}
                      className={station.current ? "on" : undefined}
                    />
                    <span>
                      <b>{station.name}</b>
                      <small>
                        {station.role} — {station.description}
                      </small>
                    </span>
                    {station.current ? (
                      <em className="xfer-sheet-current">現在地</em>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
