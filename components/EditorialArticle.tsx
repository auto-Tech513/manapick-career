import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, ListTree } from "lucide-react";
import { Fragment } from "react";
import { AdSenseScript } from "@/components/AdSenseScript";
import { AdSlot } from "@/components/AdSlot";
import type { EditorialNetworkLink, EditorialSection } from "@/content/editorial";
import { publishedJobs } from "@/content/jobs";
import prLinks from "@/content/pr-links.json";

type Source = { sourceId: string; provider: string; url: string; checkedAt: string; notes: string };

export function EditorialArticle({
  answer,
  keyPoints,
  sections,
  sources,
  relatedCareerSlugs,
  author,
  editor,
  checkedAt,
  readMinutes,
  pathname,
  networkLinks,
  estimateLabel = "読了目安",
}: {
  answer: string;
  keyPoints: string[];
  sections: EditorialSection[];
  sources: Source[];
  relatedCareerSlugs: string[];
  author: string;
  editor: string;
  checkedAt: string;
  readMinutes: number;
  pathname: string;
  networkLinks?: EditorialNetworkLink[];
  estimateLabel?: string;
}) {
  const relatedJobs = publishedJobs.filter((job) => relatedCareerSlugs.includes(job.slug));
  const offers = prLinks.enabled ? prLinks.items.filter((offer) => offer.placements.includes(pathname)) : [];
  const toc = <ol>{sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.heading.replace(/^\d+\.\s*/, "")}</a></li>)}</ol>;
  return <>
    <AdSenseScript />
    <details className="mobile-article-toc"><summary><ListTree aria-hidden="true" />目次を開く</summary>{toc}</details>
    <div className="article-layout">
      <aside className="article-toc" aria-label="この記事の目次"><p><ListTree aria-hidden="true" />目次</p>{toc}<small><Clock3 aria-hidden="true" />{estimateLabel} {readMinutes}分</small></aside>
      <article className="editorial-article">
        {offers.length > 0 && <p className="article-pr-notice"><strong>PRを含みます</strong> 広告の有無は、記事の結論・職業の掲載順・比較結果に影響しません。</p>}
        <section className="article-answer" aria-labelledby="article-answer-title"><span>先に結論</span><h2 id="article-answer-title">この記事の答え</h2><p>{answer}</p></section>
        <section className="article-key-points"><h2>この記事の要点</h2><ul>{keyPoints.map((point) => <li key={point}><CheckCircle2 aria-hidden="true" />{point}</li>)}</ul></section>
        {sections.map((section, index) => <Fragment key={section.id}><section id={section.id} className="article-section"><span className="article-section-number">SECTION {String(index + 1).padStart(2, "0")}</span><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.points && <ul>{section.points.map((point) => <li key={point}><CheckCircle2 aria-hidden="true" />{point}</li>)}</ul>}</section>{index === 1 && <AdSlot placement={`${pathname}after-section-2`} />}</Fragment>)}
        {relatedJobs.length > 0 && <section className="related-careers"><span className="article-section-number">NEXT STEP</span><h2>関連する職業の仕事内容を確認</h2><p>記事の内容を、実際の作業・注意点・学び方と結び付けて確認できます。</p><div>{relatedJobs.map((job) => <Link key={job.slug} href={`/career/${job.slug}/`}><span><strong>{job.name}</strong><small>{job.conclusion[0]}</small></span><ArrowRight aria-hidden="true" /></Link>)}</div></section>}
        {networkLinks && networkLinks.length > 0 && <section className="related-careers network-bridges"><span className="article-section-number">MANAPICK NETWORK</span><h2>この手順を、学び・AI・資格へつなぐ</h2><p>記事を読んだ後に必要な確認だけを選べます。各サイトの独自ページへ進み、公式情報と現在の条件を確認してください。</p><div>{networkLinks.map((item) => <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer"><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowUpRight aria-hidden="true" /></a>)}</div></section>}
        {offers.map((offer) => <aside className="learning-offer" key={offer.offerId} aria-label={`${offer.provider}のPR情報`}><span>PR</span><div><small>{offer.disclosure}</small><h2>{offer.label}</h2><p>{offer.description}</p><p className="offer-caution">価格・無料体験・給付対象・申込条件は、リンク先の公式表示で最新情報を確認してください。</p></div><a href={offer.url} target="_blank" rel="sponsored nofollow noopener noreferrer">公式情報を確認 <ArrowUpRight aria-hidden="true" /></a></aside>)}
        <section className="article-review"><h2>執筆・確認情報</h2><dl><div><dt>執筆</dt><dd>{author}</dd></div><div><dt>編集</dt><dd>{editor}</dd></div><div><dt>最終確認日</dt><dd>{checkedAt}</dd></div><div><dt>確認方法</dt><dd>公的資料と一次情報を独自に整理し、公開前に人が主張とリンクを確認</dd></div></dl><h3>参照した公式情報</h3><ul className="source-list">{sources.map((source) => <li key={source.sourceId}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.provider}<ArrowUpRight aria-hidden="true" /></a><small>確認日 {source.checkedAt}／{source.notes}</small></li>)}</ul><p className="correction-note">誤りにお気づきの場合は<Link href="/contact/">訂正窓口</Link>へお知らせください。確認中は一時非公開または確認中表示へ切り替えます。</p></section>
        <p className="article-checked"><CalendarDays aria-hidden="true" />この記事の内容確認日：{checkedAt}</p>
      </article>
    </div>
  </>;
}
