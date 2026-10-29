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

export const dynamicParams = false;
export function generateStaticParams() { return buildNewsStaticParams(newsItems); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = newsBySlug(slug); if (!item) return {}; const modifiedAt = newsModifiedAt(item); const image = articleOgUrl("news", slug, `${item.title}|${item.publishedAt}|${item.reviewedAt}|${item.checkedAt}`); return { title: item.title, description: metaDescription(item.summary), alternates: { canonical: `/news/${slug}/` }, openGraph: { title: item.title, description: metaDescription(item.summary), type: "article", url: absoluteUrl(`/news/${slug}/`), publishedTime: item.publishedAt, modifiedTime: modifiedAt, images: [{ url: image, width: 1200, height: 630, alt: item.title }] }, twitter: { card: "summary_large_image", title: item.title, description: metaDescription(item.summary), images: [image] } }; }

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === EMPTY_NEWS_ROUTE_SLUG) notFound();
  const item = newsBySlug(slug);
  if (!item) notFound();
  const sources = sourceRegistry.filter((source) => item.sourceIds.includes(source.sourceId));
  const url = absoluteUrl(`/news/${slug}/`);
  const modifiedAt = newsModifiedAt(item);
  const articleText = item.sections.flatMap((section) => section.paragraphs).join("");
  const readMinutes = Math.max(7, Math.ceil(articleText.length / 400));
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "NewsArticle", headline: item.title, description: item.summary, mainEntityOfPage: url, url, image: articleOgUrl("news", slug, `${item.title}|${item.publishedAt}|${item.reviewedAt}|${item.checkedAt}`), datePublished: item.publishedAt, dateModified: modifiedAt, inLanguage: "ja-JP", articleSection: item.kind, isAccessibleForFree: true, author: { "@type": "Organization", name: item.author, url: absoluteUrl("/operator/") }, editor: { "@type": "Organization", name: item.editor, url: absoluteUrl("/operator/") }, publisher: { "@id": absoluteUrl("/#organization") }, citation: sources.map((source) => source.url) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "ニュース", item: absoluteUrl("/news/") }, { "@type": "ListItem", position: 3, name: item.title, item: url }] },
  ] };
  return <><JsonLd data={graph}/><div className="page-shell editorial-detail news-detail-page">
    <nav className="article-breadcrumbs" aria-label="パンくずリスト"><Link href="/">ホーム</Link><span>/</span><Link href="/news/">ニュース</Link><span>/</span><span aria-current="page">{item.kind}</span></nav>
    <Link className="back-link" href="/news/"><ArrowLeft aria-hidden="true" />ニュース一覧へ</Link>
    <header className="page-heading article-heading"><span className="eyebrow">{item.kind}</span><h1 className="phrase-breaks"><PhraseText text={item.title} /></h1><p>{item.summary}</p><div className="article-meta"><span><Clock3 aria-hidden="true" />{readMinutes}分</span><span><CalendarDays aria-hidden="true" />資料公表 {item.sourcePublishedAt}</span><span>出典台帳の記録 {item.checkedAt}</span><span>公開台帳の記録 {item.reviewedAt}</span><span>サイト公開 {item.publishedAt}</span></div></header>
    {newsNeedsRefresh(item) ? <aside className="source-freshness-notice" data-news-archive="true" role="note"><h2>過去の公表資料に基づく記事です</h2><p>資料確認日の記録は{item.checkedAt}です。更新確認の期限を超えています。現在の状況を示す情報として使わず、下記の公式出典で最新の発表を確認してください。</p></aside> : null}
    <ShareKit title={item.title} summary={item.summary} url={url} kind="news" />
    <EditorialArticle {...item} pathname={`/news/${slug}/`} readMinutes={readMinutes} sources={sources}/>
  </div></>;
}
