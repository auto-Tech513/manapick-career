import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { EditorialArticle } from "@/components/EditorialArticle";
import { JsonLd } from "@/components/JsonLd";
import { ShareKit } from "@/components/ShareKit";
import { newsBySlug, newsItems } from "@/content/editorial";
import sourceRegistry from "@/content/source-registry.json";
import { absoluteUrl, articleOgUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return newsItems.map((item) => ({ slug: item.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = newsBySlug(slug); if (!item) return {}; const image = articleOgUrl("news", slug); return { title: item.title, description: item.summary, alternates: { canonical: `/news/${slug}/` }, openGraph: { title: item.title, description: item.summary, type: "article", url: absoluteUrl(`/news/${slug}/`), publishedTime: item.publishedAt, modifiedTime: item.checkedAt, images: [{ url: image, width: 1200, height: 630, alt: item.title }] }, twitter: { card: "summary_large_image", title: item.title, description: item.summary, images: [image] } }; }

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = newsBySlug(slug);
  if (!item) notFound();
  const sources = sourceRegistry.filter((source) => item.sourceIds.includes(source.sourceId));
  const url = absoluteUrl(`/news/${slug}/`);
  const readMinutes = Math.max(7, Math.ceil(item.sections.flatMap((section) => section.paragraphs).join("").length / 400));
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "NewsArticle", headline: item.title, description: item.summary, mainEntityOfPage: url, url, image: articleOgUrl("news", slug), datePublished: item.publishedAt, dateModified: item.checkedAt, inLanguage: "ja-JP", author: { "@type": "Organization", name: item.author, url: absoluteUrl("/operator/") }, editor: { "@type": "Organization", name: item.editor, url: absoluteUrl("/operator/") }, publisher: { "@id": absoluteUrl("/#organization") }, citation: sources.map((source) => source.url) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "ニュース", item: absoluteUrl("/news/") }, { "@type": "ListItem", position: 3, name: item.title, item: url }] },
  ] };
  return <><JsonLd data={graph}/><div className="page-shell editorial-detail news-detail-page">
    <nav className="article-breadcrumbs" aria-label="パンくずリスト"><Link href="/">ホーム</Link><span>/</span><Link href="/news/">ニュース</Link><span>/</span><span aria-current="page">{item.kind}</span></nav>
    <Link className="back-link" href="/news/"><ArrowLeft aria-hidden="true" />ニュース一覧へ</Link>
    <header className="page-heading article-heading"><span className="eyebrow">{item.kind}</span><h1>{item.title}</h1><p>{item.summary}</p><div className="article-meta"><span><Clock3 aria-hidden="true" />{readMinutes}分</span><span><CalendarDays aria-hidden="true" />公開 {item.publishedAt}</span><span>確認 {item.checkedAt}</span></div></header>
    <ShareKit title={item.title} summary={item.summary} url={url} kind="news" />
    <EditorialArticle {...item} pathname={`/news/${slug}/`} readMinutes={readMinutes} sources={sources}/>
  </div></>;
}
