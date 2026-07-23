import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, CalendarDays, Newspaper, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { publishedNews } from "@/content/editorial";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "キャリアニュース", description: "雇用統計、採用動向、学び直し、デジタル人材の一次資料を確認し、人が全主張を確認した記事だけを公開します。", alternates: { canonical: "/news/" } };

export default function NewsIndex() {
  const [lead, ...rest] = publishedNews;
  const kinds = [...new Set(publishedNews.map((item) => item.kind))];
  const latestSourceDate = publishedNews.reduce((latest, item) => item.sourcePublishedAt > latest ? item.sourcePublishedAt : latest, "");
  const latestCheckedAt = publishedNews.reduce((latest, item) => item.checkedAt > latest ? item.checkedAt : latest, "");
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: "キャリアニュース", description: metadata.description, url: absoluteUrl("/news/"), inLanguage: "ja-JP", ...(publishedNews.length ? { mainEntity: { "@type": "ItemList", numberOfItems: publishedNews.length, itemListElement: publishedNews.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: absoluteUrl(`/news/${item.slug}/`) })) } } : {}) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "ニュース", item: absoluteUrl("/news/") }] },
  ] };
  if (!lead) return <><JsonLd data={graph}/><div className="page-shell editorial-index news-index-page"><header className="page-heading"><span className="eyebrow">career newsroom</span><h1>キャリアニュース</h1><p>公開条件を満たす記事を確認中です。自動取得した記事は、人が一次資料と全主張を確認するまで公開しません。</p></header><section className="news-freshness-panel" aria-label="ニュースの公開・確認状況"><div><Newspaper aria-hidden="true"/><span><small>公開中</small><strong>0記事</strong></span></div><div><CalendarDays aria-hidden="true"/><span><small>自動公開</small><strong>行いません</strong></span></div><div><CalendarCheck2 aria-hidden="true"/><span><small>公開条件</small><strong>人による全主張の確認</strong></span></div><p><ShieldCheck aria-hidden="true"/>一次資料、公表日、数字の対象範囲、関連リンクを確認し、条件を満たした記事だけを公開します。</p></section><section className="news-featured" aria-labelledby="news-empty-title"><span className="news-featured-badge"><Newspaper aria-hidden="true"/>公開前確認中</span><h2 id="news-empty-title">確認を終えた記事から、ここに掲載します。</h2><p>準備中は、ガイドで職業情報の読み方を、データ室で市場の数字が示すこと・示さないことを確認できます。</p><div className="hero-actions"><Link className="button primary" href="/guide/">読み方ガイドへ <ArrowRight aria-hidden="true"/></Link><Link className="button secondary" href="/research/">キャリアデータ室へ</Link></div></section></div></>;
  return <><JsonLd data={graph}/><div className="page-shell editorial-index news-index-page">
    <header className="page-heading"><span className="eyebrow">career newsroom</span><h1>働く人のための、キャリアニュース</h1><p>公的機関の統計・制度・調査を、そのまま転載せず独自に読み解きます。数字が示すこと、示さないこと、次に確認する条件まで整理します。</p></header>
    <section className="news-freshness-panel" aria-label="ニュースの公開・確認状況">
      <div><Newspaper aria-hidden="true"/><span><small>公開中</small><strong>{publishedNews.length}記事</strong></span></div>
      <div><CalendarDays aria-hidden="true"/><span><small>一次資料の最新公表日</small><strong>{latestSourceDate}</strong></span></div>
      <div><CalendarCheck2 aria-hidden="true"/><span><small>編集部の最終確認日</small><strong>{latestCheckedAt}</strong></span></div>
      <p><ShieldCheck aria-hidden="true"/>一次資料の公表日、サイトの公開日、内容確認日を分けて表示します。自動監査の候補は、人の確認前には公開しません。</p>
    </section>
    <nav className="news-kind-nav" aria-label="ニュースのテーマ">{kinds.map((kind) => <span key={kind}>{kind}</span>)}</nav>
    <Link className="news-featured" href={`/news/${lead.slug}/`}><span className="news-featured-badge"><Newspaper aria-hidden="true" />注目解説</span><small>{lead.kind}・資料公表 {lead.sourcePublishedAt}・公開 {lead.publishedAt}</small><h2>{lead.title}</h2><p>{lead.answer}</p><ul>{lead.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul><em>全文を読む <ArrowRight aria-hidden="true" /></em></Link>
    <div className="news-index-list">{rest.map((item) => <Link href={`/news/${item.slug}/`} key={item.slug}><span className="editorial-card-icon"><Newspaper aria-hidden="true" /></span><span><small>{item.kind}</small><h2>{item.title}</h2><p>{item.summary}</p><em><CalendarDays aria-hidden="true" />資料公表 {item.sourcePublishedAt}<span>公開 {item.publishedAt}</span></em></span><ArrowRight aria-hidden="true" /></Link>)}</div>
  </div></>;
}
