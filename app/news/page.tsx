import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { newsItems } from "@/content/editorial";

export const metadata: Metadata = { title: "更新情報", description: "manapick careerの掲載範囲、編集、画面・導線の変更を記録します。", alternates: { canonical: "/news/" } };

export default function NewsIndex() { return <div className="page-shell editorial-index">
  <header className="page-heading"><span className="eyebrow">news &amp; updates</span><h1>掲載内容とサイトの更新情報</h1><p>職業情報の追加・確認と、画面や導線の変更を日付付きで記録します。</p></header>
  <div className="news-index-list">{newsItems.map((item) => <Link href={`/news/${item.slug}/`} key={item.slug}>
    <span className="editorial-card-icon"><Newspaper aria-hidden="true" /></span><span><small>{item.kind}</small><h2>{item.title}</h2><p>{item.summary}</p><em><CalendarDays aria-hidden="true" />{item.publishedAt}</em></span><ArrowRight aria-hidden="true" />
  </Link>)}</div>
</div> }
