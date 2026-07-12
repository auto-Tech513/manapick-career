import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { newsBySlug, newsItems } from "@/content/editorial";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return newsItems.map((item) => ({ slug: item.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = newsBySlug(slug); if (!item) return {}; return { title: item.title, description: item.summary, alternates: { canonical: `/news/${slug}/` }, openGraph: { title: item.title, description: item.summary, type: "article", url: absoluteUrl(`/news/${slug}/`) } }; }

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = newsBySlug(slug); if (!item) notFound(); const url = absoluteUrl(`/news/${slug}/`); const graph = { "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.summary, url, datePublished: item.publishedAt, dateModified: item.checkedAt, author: { "@type": "Organization", name: "manapick career編集部" }, publisher: { "@id": absoluteUrl("/#organization") } }; return <><JsonLd data={graph}/><div className="page-shell editorial-detail news-detail-page">
  <Link className="back-link" href="/news/"><ArrowLeft aria-hidden="true" />更新情報一覧へ</Link>
  <header className="page-heading"><span className="eyebrow">{item.kind}</span><h1>{item.title}</h1><p>{item.summary}</p><span className="published-date"><CalendarDays aria-hidden="true" />公開日 {item.publishedAt}</span></header>
  <article className="editorial-article"><section>{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section><section className="article-review"><h2>この更新情報について</h2><dl><div><dt>発信</dt><dd>manapick career編集部</dd></div><div><dt>確認日</dt><dd>{item.checkedAt}</dd></div><div><dt>訂正</dt><dd><Link href="/contact/">訂正窓口</Link>で受け付けます</dd></div></dl></section></article>
  <Link className="article-next" href={item.relatedHref}>{item.relatedLabel} <ArrowRight aria-hidden="true" /></Link>
</div></>; }
