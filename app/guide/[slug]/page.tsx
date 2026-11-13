import { PhraseText } from "@/components/PhraseTitle";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { EditorialArticle } from "@/components/EditorialArticle";
import { AiDeepLinks } from "@/components/AiDeepLinks";
import { JsonLd } from "@/components/JsonLd";
import { ShareKit } from "@/components/ShareKit";
import { NewsletterForm } from "@/components/NewsletterForm";
import { guideBySlug, guides } from "@/content/editorial";
import sourceRegistry from "@/content/source-registry.json";
import { absoluteUrl, articleOgUrl, metaDescription } from "@/lib/site";
import "@/components/article-cover.css";

export const dynamicParams = false;
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = guideBySlug(slug); if (!guide) return {}; const description = metaDescription(`${guide.summary}${guide.answer}${guide.sections[0]?.paragraphs[0] ?? ""}${guide.sections[1]?.paragraphs[0] ?? ""}${guide.sections[2]?.paragraphs[0] ?? ""}`); const image = articleOgUrl("guide", slug, `${guide.title}|${guide.checkedAt}`); return { title: guide.title, description: description, alternates: { canonical: `/guide/${slug}/`, types: { "application/rss+xml": "/feed.xml" } }, openGraph: { title: guide.title, description: description, type: "article", url: absoluteUrl(`/guide/${slug}/`), publishedTime: guide.publishedAt, modifiedTime: guide.checkedAt, images: [{ url: image, width: 1200, height: 675, alt: guide.title }] }, twitter: { card: "summary_large_image", title: guide.title, description: description, images: [image] } }; }

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const sources = sourceRegistry.filter((source) => guide.sourceIds.includes(source.sourceId));
  const relatedGuides = guides.filter((g) => g.category === guide.category && g.slug !== slug).sort((a, b) => (a.checkedAt < b.checkedAt ? 1 : -1)).slice(0, 3);
  const relatedArticles = { heading: guide.category === "職業の違い" ? "ほかの職業の違いも比べる" : "同じテーマのガイドを読む", links: relatedGuides.map((g) => ({ href: `/guide/${g.slug}/`, title: g.title, meta: `${g.category}・読む・試す目安 約${g.readMinutes}分` })) };
  const url = absoluteUrl(`/guide/${slug}/`);
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: guide.title, description: guide.summary, mainEntityOfPage: url, url, image: { "@type": "ImageObject", url: articleOgUrl("guide", slug, `${guide.title}|${guide.checkedAt}`), width: 1200, height: 675 }, datePublished: guide.publishedAt, dateModified: guide.checkedAt, inLanguage: "ja-JP", author: { "@type": "Organization", name: guide.author, url: absoluteUrl("/operator/") }, editor: { "@type": "Organization", name: guide.editor, url: absoluteUrl("/operator/") }, publisher: { "@id": absoluteUrl("/#organization") }, citation: sources.map((source) => source.url) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "ガイド", item: absoluteUrl("/guide/") }, { "@type": "ListItem", position: 3, name: guide.title, item: url }] },
    { "@type": "HowTo", name: guide.title, description: guide.summary, url, inLanguage: "ja-JP", totalTime: `PT${guide.readMinutes}M`, step: guide.sections.map((section, index) => ({ "@type": "HowToStep", position: index + 1, name: section.heading.replace(/^\d+\.\s*/, ""), text: section.paragraphs.join(" "), url: `${url}#${section.id}` })) },
  ] };
  return <><JsonLd data={graph}/><div className="page-shell editorial-detail">
    <nav className="article-breadcrumbs" aria-label="パンくずリスト"><Link href="/">ホーム</Link><span>/</span><Link href="/guide/">ガイド</Link><span>/</span><span aria-current="page">{guide.category}</span></nav>
    <Link className="back-link" href="/guide/"><ArrowLeft aria-hidden="true" />ガイド一覧へ</Link>
    <header className="page-heading article-heading"><span className="eyebrow">{guide.category}</span><h1 className="phrase-breaks"><PhraseText text={guide.title} /></h1><p>{guide.summary}</p><div className="article-meta"><span><Clock3 aria-hidden="true" />読む・試す目安 {guide.readMinutes}分</span><span><CalendarDays aria-hidden="true" />公開 {guide.publishedAt}</span><span>確認 {guide.checkedAt}</span></div></header>
    <figure className="article-cover"><img src={articleOgUrl("guide", slug, `${guide.title}|${guide.checkedAt}`)} alt={guide.title} width={1200} height={675} /></figure>
    <EditorialArticle {...guide} pathname={`/guide/${slug}/`} sources={sources} networkLinks={guide.sections.some((section) => section.paragraphs.some((paragraph) => paragraph.includes("manapick AI") || paragraph.includes("manapick license"))) ? [] : guide.networkLinks} relatedArticles={relatedArticles} estimateLabel="読む・試す目安"/>
    <ShareKit title={guide.title} summary={guide.summary} url={url} kind="guide" />
    <NewsletterForm context="article" />
    <AiDeepLinks path={`/guide/${slug}/`} />
  </div></>;
}
