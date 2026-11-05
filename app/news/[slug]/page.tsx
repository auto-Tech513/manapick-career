import { PhraseText } from "@/components/PhraseTitle";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { EditorialArticle } from "@/components/EditorialArticle";
import { JsonLd } from "@/components/JsonLd";
import { ShareKit } from "@/components/ShareKit";
import { newsBySlug, newsItems, newsModifiedAt, newsNeedsRefresh } from "@/content/editorial";
import sourceRegistry from "@/content/source-registry.json";
import { absoluteUrl, articleOgUrl, metaDescription } from "@/lib/site";
import { buildNewsStaticParams, EMPTY_NEWS_ROUTE_SLUG } from "@/lib/news-static-params.mjs";
import "@/components/article-cover.css";

export const dynamicParams = false;
export function generateStaticParams() { return buildNewsStaticParams(newsItems); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = newsBySlug(slug); if (!item) return {}; const modifiedAt = newsModifiedAt(item); const image = articleOgUrl("news", slug, `${item.title}|${item.publishedAt}|${item.reviewedAt}|${item.checkedAt}`); return { title: item.title, description: metaDescription(item.summary), alternates: { canonical: `/news/${slug}/`, types: { "application/rss+xml": "/feed.xml" } }, openGraph: { title: item.title, description: metaDescription(item.summary), type: "article", url: absoluteUrl(`/news/${slug}/`), publishedTime: item.publishedAt, modifiedTime: modifiedAt, images: [{ url: image, width: 1200, height: 675, alt: item.title }] }, twitter: { card: "summary_large_image", title: item.title, description: metaDescription(item.summary), images: [image] } }; }

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === EMPTY_NEWS_ROUTE_SLUG) notFound();
  const item = newsBySlug(slug);
  if (!item) notFound();
  const sources = sourceRegistry.filter((source) => item.sourceIds.includes(source.sourceId));
  // 関連記事は同種を優先し、3件に満たない場合は「出典の共有」「対象職業の共有」の順で補う。
  // 同種が1〜2本しかない分類では、補わないと関連枠が1件以下になってしまうため。
  const byPublishedDesc = (a: (typeof newsItems)[number], b: (typeof newsItems)[number]) => (a.publishedAt < b.publishedAt ? 1 : -1);
  const sameKindNews = newsItems.filter((n) => n.kind === item.kind && n.slug !== slug).sort(byPublishedDesc);
  const chosenSlugs = new Set([slug, ...sameKindNews.map((n) => n.slug)]);
  const sharedSourceNews = newsItems.filter((n) => !chosenSlugs.has(n.slug) && n.sourceIds.some((sourceId) => item.sourceIds.includes(sourceId))).sort(byPublishedDesc);
  sharedSourceNews.forEach((n) => chosenSlugs.add(n.slug));
  const sharedCareerNews = newsItems.filter((n) => !chosenSlugs.has(n.slug) && n.relatedCareerSlugs.some((careerSlug) => item.relatedCareerSlugs.includes(careerSlug))).sort(byPublishedDesc);
  const relatedNews = [...sameKindNews, ...sharedSourceNews, ...sharedCareerNews].slice(0, 3);
  const relatedHeading = relatedNews.every((n) => n.kind === item.kind) ? `ほかの「${item.kind}」の解説を読む` : "関連する解説を読む";
  const relatedArticles = { heading: relatedHeading, links: relatedNews.map((n) => ({ href: `/news/${n.slug}/`, title: n.title, meta: `資料公表 ${n.sourcePublishedAt}` })) };
  const url = absoluteUrl(`/news/${slug}/`);
  const modifiedAt = newsModifiedAt(item);
  const articleText = item.sections.flatMap((section) => section.paragraphs).join("");
  const readMinutes = Math.max(7, Math.ceil(articleText.length / 400));
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "NewsArticle", headline: item.title, description: item.summary, mainEntityOfPage: url, url, image: { "@type": "ImageObject", url: articleOgUrl("news", slug, `${item.title}|${item.publishedAt}|${item.reviewedAt}|${item.checkedAt}`), width: 1200, height: 675 }, datePublished: item.publishedAt, dateModified: modifiedAt, inLanguage: "ja-JP", articleSection: item.kind, isAccessibleForFree: true, author: { "@type": "Organization", name: item.author, url: absoluteUrl("/operator/") }, editor: { "@type": "Organization", name: item.editor, url: absoluteUrl("/operator/") }, publisher: { "@id": absoluteUrl("/#organization") }, citation: sources.map((source) => source.url) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "ニュース", item: absoluteUrl("/news/") }, { "@type": "ListItem", position: 3, name: item.title, item: url }] },
  ] };
  return <><JsonLd data={graph}/><div className="page-shell editorial-detail news-detail-page">
    <nav className="article-breadcrumbs" aria-label="パンくずリスト"><Link href="/">ホーム</Link><span>/</span><Link href="/news/">ニュース</Link><span>/</span><span aria-current="page">{item.kind}</span></nav>
    <Link className="back-link" href="/news/"><ArrowLeft aria-hidden="true" />ニュース一覧へ</Link>
    <header className="page-heading article-heading"><span className="eyebrow">{item.kind}</span><h1 className="phrase-breaks"><PhraseText text={item.title} /></h1><p>{item.summary}</p><div className="article-meta"><span><Clock3 aria-hidden="true" />{readMinutes}分</span><span><CalendarDays aria-hidden="true" />資料公表 {item.sourcePublishedAt}</span><span>出典台帳の記録 {item.checkedAt}</span><span>公開台帳の記録 {item.reviewedAt}</span><span>サイト公開 {item.publishedAt}</span></div></header>
    <figure className="article-cover"><img src={articleOgUrl("news", slug, `${item.title}|${item.publishedAt}|${item.reviewedAt}|${item.checkedAt}`)} alt={item.title} width={1200} height={675} /></figure>
    {newsNeedsRefresh(item) ? <aside className="source-freshness-notice" data-news-archive="true" role="note"><h2>過去の公表資料に基づく記事です</h2><p>資料確認日の記録は{item.checkedAt}で、更新確認の期限を過ぎています。最新の発表は下記の公式出典に載っています。</p></aside> : null}
    <EditorialArticle {...item} pathname={`/news/${slug}/`} readMinutes={readMinutes} sources={sources} relatedArticles={relatedArticles}/>
    <ShareKit title={item.title} summary={item.summary} url={url} kind="news" />
    <p className="article-method-note">この記事の数字の読み方と編集方針は<Link href="/about-method/">作成方法・編集方針</Link>にまとめています。</p>
  </div></>;
}
