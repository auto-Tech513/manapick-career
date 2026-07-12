import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { newsItems } from "@/content/editorial";

export const metadata: Metadata = { title: "キャリアニュース", description: "雇用統計、採用動向、学び直し、デジタル人材の公式発表を、働く人の判断に使える形で独自解説します。", alternates: { canonical: "/news/" } };

export default function NewsIndex() {
  const [lead, ...rest] = newsItems;
  const kinds = [...new Set(newsItems.map((item) => item.kind))];
  return <div className="page-shell editorial-index news-index-page">
    <header className="page-heading"><span className="eyebrow">career newsroom</span><h1>働く人のための、キャリアニュース</h1><p>公的機関の統計・制度・調査を、そのまま転載せず独自に読み解きます。数字が示すこと、示さないこと、次に確認する条件まで整理します。</p></header>
    <nav className="news-kind-nav" aria-label="ニュースのテーマ">{kinds.map((kind) => <span key={kind}>{kind}</span>)}</nav>
    <Link className="news-featured" href={`/news/${lead.slug}/`}><span className="news-featured-badge"><Newspaper aria-hidden="true" />最新解説</span><small>{lead.kind}・{lead.publishedAt}</small><h2>{lead.title}</h2><p>{lead.answer}</p><ul>{lead.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul><em>全文を読む <ArrowRight aria-hidden="true" /></em></Link>
    <div className="news-index-list">{rest.map((item) => <Link href={`/news/${item.slug}/`} key={item.slug}><span className="editorial-card-icon"><Newspaper aria-hidden="true" /></span><span><small>{item.kind}</small><h2>{item.title}</h2><p>{item.summary}</p><em><CalendarDays aria-hidden="true" />{item.publishedAt}</em></span><ArrowRight aria-hidden="true" /></Link>)}</div>
  </div>;
}
