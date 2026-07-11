import Link from "next/link";
import { BriefcaseBusiness, Compass, GitCompareArrows, Menu } from "lucide-react";

export function BottomNav(){return <nav className="bottom-nav" aria-label="スマホ主要ナビゲーション">
  <Link href="/"><BriefcaseBusiness aria-hidden="true"/><span>ホーム</span></Link>
  <Link href="/route/"><Compass aria-hidden="true"/><span>入口案内</span></Link>
  <Link href="/compare/"><GitCompareArrows aria-hidden="true"/><span>比較</span></Link>
  <Link href="/all/"><Menu aria-hidden="true"/><span>一覧</span></Link>
</nav>}
