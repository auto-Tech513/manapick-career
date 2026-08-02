import Link from "next/link";
import { ArrowRight, BookOpenCheck, FileCheck2, GitCompareArrows, Newspaper } from "lucide-react";
import type { NewsItem } from "@/content/editorial";

export function DailyCareerLoop({ latestNews }: { latestNews?: NewsItem }) {
  return <section className="daily-career-loop" aria-labelledby="daily-career-title">
    <div className="daily-loop-head"><div><span className="eyebrow">DAILY CAREER LOOP</span><h2 id="daily-career-title">読むだけで終わらせない、15分の使い方。</h2><p>公式情報から変化を一つ知り、仕事の違いを比べ、学びを一つ試し、転職や社内で説明できる記録へ変えます。</p></div><Link href="/guide/">使い方ガイド <ArrowRight aria-hidden="true" /></Link></div>
    <div className="daily-loop-grid">
      <Link className="daily-loop-news" href={latestNews ? `/news/${latestNews.slug}/` : "/news/"}><Newspaper aria-hidden="true" /><span>01 / KNOW</span><strong>{latestNews?.title ?? "確認済みニュースを読む"}</strong><small>{latestNews ? `一次資料確認 ${latestNews.checkedAt}` : "確認を終えた記事だけ公開します"}</small><em>業界の変化を確認 <ArrowRight aria-hidden="true" /></em></Link>
      <Link href="/compare/"><GitCompareArrows aria-hidden="true" /><span>02 / COMPARE</span><strong>似た仕事を2つ比べる</strong><small>職業名ではなく、成果物と責任範囲で比較</small><em>比較を始める <ArrowRight aria-hidden="true" /></em></Link>
      <a href="https://manapick.app/" target="_blank" rel="noopener noreferrer"><BookOpenCheck aria-hidden="true" /><span>03 / TRY</span><strong>一つの作業を試す</strong><small>動画で基礎を確認し、短い成果物を作る</small><em>manapickで学ぶ <ArrowRight aria-hidden="true" /></em></a>
      <Link href="/guide/"><FileCheck2 aria-hidden="true" /><span>04 / RECORD</span><strong>学びを3行で記録する</strong><small>目的・試したこと・次の確認を残す</small><em>記録方法を見る <ArrowRight aria-hidden="true" /></em></Link>
    </div>
  </section>;
}
