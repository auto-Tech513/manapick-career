import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, Bot, BriefcaseBusiness, GraduationCap, Newspaper, UsersRound } from "lucide-react";
import { newsItems } from "@/content/editorial";

const hubs = [
  { newsSlug: "job-openings-may-2026", href: "/news/job-openings-may-2026/", label: "転職市場", description: "求人倍率の意味を読む", icon: BarChart3 },
  { newsSlug: "manufacturing-midcareer-hiring-2026", href: "/news/manufacturing-midcareer-hiring-2026/", label: "採用動向", description: "企業調査から条件を見る", icon: UsersRound },
  { newsSlug: "reskilling-support-2026", href: "/news/reskilling-support-2026/", label: "学び直し", description: "公的支援の選び方", icon: GraduationCap },
  { newsSlug: "digital-skills-standard-v2-2026", href: "/news/digital-skills-standard-v2-2026/", label: "AI・DX人材", description: "公式標準の改訂を読む", icon: Bot },
  { href: "/research/", label: "データ室", description: "数字の意味と限界を読む", icon: BarChart3 },
  { href: "/guide/", label: "職業ガイド", description: "情報を判断に使う", icon: BookOpenCheck },
  { href: "/all/", label: "職業一覧", description: "作業と注意点を比べる", icon: BriefcaseBusiness },
];

export function CareerBriefing() {
  const lead = newsItems[0];
  const availableNewsSlugs = new Set(newsItems.map((item) => item.slug));
  const availableHubs = hubs.filter((hub) => !hub.newsSlug || availableNewsSlugs.has(hub.newsSlug));
  return <section className="career-briefing" aria-labelledby="career-briefing-title">
    <div className="briefing-head"><div><span className="eyebrow">career intelligence</span><h2 id="career-briefing-title">働く・学ぶを、一次情報から考える。</h2><p>大きな見出しだけで判断せず、数字の意味と限界、次に確認する条件まで編集部が整理します。</p></div><Link href="/news/">{lead ? "ニュースをすべて見る" : "公開準備状況を見る"} <ArrowRight aria-hidden="true" /></Link></div>
    <div className="briefing-grid">
      {lead
        ? <Link className="briefing-lead" href={`/news/${lead.slug}/`}><span><Newspaper aria-hidden="true" />注目の公式発表</span><small>{lead.kind}・{lead.publishedAt}</small><h3>{lead.title}</h3><p>{lead.answer}</p><em>解説を読む <ArrowRight aria-hidden="true" /></em></Link>
        : <Link className="briefing-lead" href="/news/"><span><Newspaper aria-hidden="true" />公開前確認中</span><small>自動公開はしません</small><h3>一次資料と全主張を、人が確認しています。</h3><p>確認を終えた記事だけを公開します。準備中は、データ室で数字の読み方と限界を確認できます。</p><em>公開基準を見る <ArrowRight aria-hidden="true" /></em></Link>}
      <nav className="briefing-hubs" aria-label="キャリア情報のテーマ">{availableHubs.map((hub) => { const Icon = hub.icon; return <Link href={hub.href} key={hub.href}><Icon aria-hidden="true" /><span><strong>{hub.label}</strong><small>{hub.description}</small></span><ArrowRight aria-hidden="true" /></Link>; })}</nav>
    </div>
  </section>;
}
