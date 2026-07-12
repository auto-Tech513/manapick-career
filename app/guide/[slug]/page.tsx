import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { EditorialArticle } from "@/components/EditorialArticle";
import { JsonLd } from "@/components/JsonLd";
import { guideBySlug, guides } from "@/content/editorial";
import sourceRegistry from "@/content/source-registry.json";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = guideBySlug(slug); if (!guide) return {}; return { title: guide.title, description: guide.summary, alternates: { canonical: `/guide/${slug}/` }, openGraph: { title: guide.title, description: guide.summary, type: "article", url: absoluteUrl(`/guide/${slug}/`) } }; }

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const sources = sourceRegistry.filter((source) => guide.sourceIds.includes(source.sourceId));
  const url = absoluteUrl(`/guide/${slug}/`);
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: guide.title, description: guide.summary, mainEntityOfPage: url, url, datePublished: guide.publishedAt, dateModified: guide.checkedAt, inLanguage: "ja-JP", author: { "@type": "Organization", name: guide.author }, editor: { "@type": "Organization", name: guide.editor }, publisher: { "@id": absoluteUrl("/#organization") }, citation: sources.map((source) => source.url) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "ガイド", item: absoluteUrl("/guide/") }, { "@type": "ListItem", position: 3, name: guide.title, item: url }] },
  ] };
  return <><JsonLd data={graph}/><div className="page-shell editorial-detail">
    <nav className="article-breadcrumbs" aria-label="パンくずリスト"><Link href="/">ホーム</Link><span>/</span><Link href="/guide/">ガイド</Link><span>/</span><span aria-current="page">{guide.category}</span></nav>
    <Link className="back-link" href="/guide/"><ArrowLeft aria-hidden="true" />ガイド一覧へ</Link>
    <header className="page-heading article-heading"><span className="eyebrow">{guide.category}</span><h1>{guide.title}</h1><p>{guide.summary}</p><div className="article-meta"><span><Clock3 aria-hidden="true" />{guide.readMinutes}分</span><span><CalendarDays aria-hidden="true" />公開 {guide.publishedAt}</span><span>確認 {guide.checkedAt}</span></div></header>
    <EditorialArticle {...guide} pathname={`/guide/${slug}/`} sources={sources}/>
  </div></>;
}
