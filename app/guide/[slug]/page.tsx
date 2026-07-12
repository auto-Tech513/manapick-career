import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { guideBySlug, guides } from "@/content/editorial";
import sourceRegistry from "@/content/source-registry.json";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = guideBySlug(slug); if (!guide) return {}; return { title: guide.title, description: guide.summary, alternates: { canonical: `/guide/${slug}/` }, openGraph: { title: guide.title, description: guide.summary, type: "article", url: absoluteUrl(`/guide/${slug}/`) } }; }

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const guide = guideBySlug(slug); if (!guide) notFound(); const sources = sourceRegistry.filter((source) => guide.sourceIds.includes(source.sourceId)); const url = absoluteUrl(`/guide/${slug}/`); const graph = { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.summary, url, dateModified: guide.checkedAt, author: { "@type": "Organization", name: guide.author }, editor: { "@type": "Organization", name: guide.editor }, citation: sources.map((source) => source.url) }; return <><JsonLd data={graph}/><div className="page-shell editorial-detail">
  <Link className="back-link" href="/guide/"><ArrowLeft aria-hidden="true" />ガイド一覧へ</Link>
  <header className="page-heading"><span className="eyebrow">{guide.category}・{guide.readMinutes}分</span><h1>{guide.title}</h1><p>{guide.summary}</p></header>
  <article className="editorial-article">{guide.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.points && <ul>{section.points.map((point) => <li key={point}><CheckCircle2 aria-hidden="true" />{point}</li>)}</ul>}</section>)}
    <section className="article-review"><h2>この記事の確認情報</h2><dl><div><dt>執筆</dt><dd>{guide.author}</dd></div><div><dt>編集</dt><dd>{guide.editor}</dd></div><div><dt>最終確認日</dt><dd>{guide.checkedAt}</dd></div><div><dt>確認方法</dt><dd>公的資料と一次情報を整理し、公開前に人が本文とリンクを確認</dd></div></dl><h3>参照した公式情報</h3><ul className="source-list">{sources.map((source) => <li key={source.sourceId}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.provider}<ArrowUpRight aria-hidden="true" /></a><small>確認日 {source.checkedAt}／{source.notes}</small></li>)}</ul><p>誤りにお気づきの場合は<Link href="/contact/">訂正窓口</Link>へお知らせください。</p></section>
  </article><Link className="article-next" href="/all/">公開中の職業を見る <ArrowRight aria-hidden="true" /></Link>
</div></>; }
