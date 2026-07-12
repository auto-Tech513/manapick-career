"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Compass, GitCompareArrows, Menu } from "lucide-react";

const items = [
  { href: "/", label: "ホーム", icon: BriefcaseBusiness },
  { href: "/all/", label: "職業一覧", icon: Menu },
  { href: "/route/", label: "入口案内", icon: Compass },
  { href: "/compare/", label: "比較", icon: GitCompareArrows },
];

export function BottomNav(){
  const pathname = usePathname();
  return <nav className="bottom-nav" aria-label="スマホ主要ナビゲーション">{items.map(item => {
    const Icon = item.icon;
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}><Icon aria-hidden="true"/><span>{item.label}</span></Link>;
  })}</nav>;
}
