import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, Newspaper } from "lucide-react";
import { guides, newsItems } from "@/content/editorial";

export function EditorialPreview() {
  return <section className="editorial-preview" aria-labelledby="editorial-preview-title">
    <div className="editorial-preview-head">
      <div><span className="eyebrow">guide &amp; news</span><h2 id="editorial-preview-title">読み方を知る。更新を確かめる。</h2><p>職業情報を判断に使う手順と、掲載内容の変更を編集部が記録します。</p></div>
      <div className="editorial-preview-actions"><Link href="/guide/">ガイド一覧 <ArrowRight aria-hidden="true" /></Link><Link href="/news/">更新情報一覧 <ArrowRight aria-hidden="true" /></Link></div>
    </div>
    <div className="editorial-preview-grid">
      <Link className="featured-guide" href={`/guide/${guides[0].slug}/`}>
        <span className="editorial-card-icon"><BookOpenText aria-hidden="true" /></span>
        <span className="editorial-card-kicker">{guides[0].category}・{guides[0].readMinutes}分</span>
        <strong>{guides[0].title}</strong><p>{guides[0].summary}</p><em>ガイドを読む <ArrowRight aria-hidden="true" /></em>
      </Link>
      <div className="news-preview-list">
        {newsItems.slice(0, 3).map((item) => <Link key={item.slug} href={`/news/${item.slug}/`}>
          <span className="editorial-card-icon"><Newspaper aria-hidden="true" /></span>
          <span><small>{item.kind}</small><strong>{item.title}</strong><em><CalendarDays aria-hidden="true" />{item.publishedAt}</em></span>
          <ArrowRight aria-hidden="true" />
        </Link>)}
      </div>
    </div>
  </section>;
}
