"use client";
import Link from "next/link";
import NetworkBrand from "./NetworkBrand";
import { MenuPanel } from "./MenuPanel";
import type { ReactNode } from "react";
import config from "../content/network-site.json";

const mainNavHrefs = ["/all/", "/employers/", "/compare/", "/guide/", "/research/"];

export default function NetworkHeader({
  children,
  occupationCount,
}: {
  children?: ReactNode;
  occupationCount: number;
}) {
  const navItem = (href: string) => config.nav.find((item) => item.href === href);
  return (
    <header className="mp-header">
      <div className="mp-header-inner">
        <Link href="/" prefetch={false}>
          <NetworkBrand />
          <span className="sr-only"> トップへ</span>
        </Link>
        {children ? <div className="mp-header-search">{children}</div> : null}
        <nav className="mp-main-nav" aria-label="主要ナビゲーション">
          {mainNavHrefs.map((href) => {
            const item = navItem(href);
            return item ? (
              <a key={href} href={href}>
                {item.label}
              </a>
            ) : null;
          })}
        </nav>
        <div className="mp-header-actions">
          <a className="hd-btn" href="/tools/net-income/">手取りシミュレーター</a>
          <a className="hd-btn y" href="/route/">迷ったら入口案内</a>
        </div>
        <MenuPanel occupationCount={occupationCount} />
      </div>
    </header>
  );
}
